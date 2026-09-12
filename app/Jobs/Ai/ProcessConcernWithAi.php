<?php

namespace App\Jobs\Ai;

use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Models\ConcernCategory;
use App\Models\ConcernSubcategory;
use App\Enums\ConcernStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProcessConcernWithAi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(public Concern $concern)
    {
    }

    public function handle(): void
    {
        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            Log::warning('Gemini API key is missing; using rule-based analysis.', [
                'concern_id' => $this->concern->id,
            ]);
            $this->applyHeuristicAnalysis();
            return;
        }

        $prompt = "
            You are a cautious case-triage assistant for a barangay in the Philippines.
            Analyze only the supplied report text and image evidence. Do not invent names, dates,
            locations, causes, damage, threats, or facts that are not visible or stated.
            If evidence is insufficient, return null for the uncertain field and use an empty array
            for uncertain lists. Do not treat a category label as proof of what happened.

            Respond ONLY with a valid JSON object matching this exact schema:
            {
                \"detected_language\": \"en\" | \"fil\" | \"mixed\",
                \"suggested_visibility\": \"public\" | \"private\",
                \"suggested_severity\": \"low\" | \"medium\" | \"high\" | \"critical\",
                \"severity_confidence\": number between 0.0 and 1.0,
                \"suggested_category_code\": \"category code from the catalog or null\",
                \"suggested_subcategory_code\": \"subcategory code from the catalog or null\",
                \"prescriptive_steps\": [\"specific evidence-based step\"],
                \"suggested_duration_hours\": integer or null,
                \"evidence_summary\": [\"short fact supported by the report or image\"],
                \"uncertainties\": [\"what cannot be determined from the evidence\"]
            }

            Choose category and subcategory ONLY from this catalog. Return null when none matches:
            " . json_encode($this->categoryCatalog(), JSON_UNESCAPED_SLASHES) . "

            Analysis rules:
            - Prefer the resident's submitted category when the evidence does not contradict it.
            - Use only category and subcategory codes present in the catalog.
            - Recommend inspection or verification when the report does not prove a condition.
            - Never claim that an image proves ownership, identity, intent, exact measurements, or causation.
            - Keep prescriptive steps actionable and limited to what barangay personnel can verify or do.

            Routing Rules:
            - If the report contains sensitive info, PII, domestic disputes, or VAWC, set visibility to 'private'.
            - If it is a public hazard (infrastructure, sanitation), set visibility to 'public'.

            Title: {$this->concern->title}
            Description: {$this->concern->description}
        ";

        try {
            $parts = [['text' => $prompt]];
            foreach ($this->imageParts() as $imagePart) {
                $parts[] = ['inlineData' => $imagePart];
            }

            $response = Http::timeout(60)
                ->retry(2, 1000)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])->post('https://generativelanguage.googleapis.com/v1beta/models/' . config('services.gemini.model') . ':generateContent', [
                    'contents' => [
                        [
                            'parts' => [
                                ...$parts,
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                        'responseSchema' => $this->responseSchema(),
                    ],
                ]);

            if ($response->successful()) {
                $result = $response->json();
                $rawText = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if (!$rawText) {
                    throw new \RuntimeException('Gemini response did not contain candidate text.');
                }

                $analysisData = json_decode($rawText, true);
                if (!is_array($analysisData) || json_last_error() !== JSON_ERROR_NONE) {
                    throw new \RuntimeException('Gemini response was not valid JSON.');
                }

                $this->persistAnalysis($this->sanitizeAnalysis($analysisData));
                return;
            }

            if ($response->serverError() || $response->status() === 429) {
                $response->throw();
            }

            Log::error('Gemini API Error.', [
                'concern_id' => $this->concern->id,
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 1000),
            ]);
            $this->applyHeuristicAnalysis();
        } catch (\Exception $e) {
            Log::error('AI Processing Exception.', [
                'concern_id' => $this->concern->id,
                'message' => $e->getMessage(),
                'trace_class' => get_class($e),
            ]);
            $this->applyHeuristicAnalysis();
        }
    }

    private function applyHeuristicAnalysis(): void
    {
        $text = strtolower(trim($this->concern->title.' '.$this->concern->description));

        $hasFilipino = (bool) preg_match('/\b(ang|mga|po|yung|naman|hindi|sa|ng)\b/u', $text);
        $hasEnglish = (bool) preg_match('/\b(the|and|please|street|flood|garbage)\b/i', $text);

        $language = match (true) {
            $hasFilipino && $hasEnglish => 'mixed',
            $hasFilipino => 'fil',
            default => 'en',
        };

        $forcePrivate = Concern::shouldForcePrivate(
            null,
            $this->concern->title ?? '',
            $this->concern->description ?? ''
        ) || $this->concern->visibility === 'private';

        $severity = match (true) {
            str_contains($text, 'fire') || str_contains($text, 'collapse') || str_contains($text, 'electroc') => 'critical',
            str_contains($text, 'flood') || str_contains($text, 'baha') || str_contains($text, 'pothole') => 'high',
            str_contains($text, 'noise') || str_contains($text, 'videoke') => 'low',
            default => 'medium',
        };

        $this->persistAnalysis([
            'detected_language' => $language,
            'suggested_visibility' => $forcePrivate ? 'private' : 'public',
            'suggested_severity' => $severity,
            'severity_confidence' => 0.55,
            'prescriptive_steps' => [
                'Inspect the reported location.',
                'Document current conditions with photos.',
                'Apply the matching barangay playbook and update the resident.',
            ],
            'suggested_duration_hours' => $severity === 'critical' ? 8 : 24,
        ]);
    }

    private function persistAnalysis(array $analysisData): void
    {
        [$categoryId, $subcategoryId] = $this->resolveCategoryIds($analysisData);
        $severity = $analysisData['suggested_severity'] ?? 'medium';
        $severity = in_array($severity, ['low', 'medium', 'high', 'critical'], true)
            ? $severity
            : 'medium';

        $visibility = $analysisData['suggested_visibility'] ?? $this->concern->visibility ?? 'public';
        if (Concern::shouldForcePrivate(null, $this->concern->title ?? '', $this->concern->description ?? '')) {
            $visibility = 'private';
        }

        $analysis = DB::transaction(function () use (
            $analysisData,
            $categoryId,
            $subcategoryId,
            $visibility,
            $severity
        ) {
            ConcernAiAnalysis::where('concern_id', $this->concern->id)
                ->where('is_current', true)
                ->update(['is_current' => false]);

            $analysis = ConcernAiAnalysis::create([
                'concern_id' => $this->concern->id,
                'is_current' => true,
                'detected_language' => $analysisData['detected_language'] ?? 'mixed',
                'suggested_category_id' => $categoryId,
                'suggested_subcategory_id' => $subcategoryId,
                'suggested_visibility' => $visibility,
                'suggested_severity' => $severity,
                'severity_confidence' => $this->boundedConfidence($analysisData['severity_confidence'] ?? 0.55),
                'prescriptive_steps' => $analysisData['prescriptive_steps'] ?? [],
                'suggested_duration_hours' => $analysisData['suggested_duration_hours'] ?? 24,
                'raw_model_output' => $analysisData,
                'processed_at' => now(),
            ]);

            $this->concern->update([
                'severity' => $severity,
                'visibility' => $visibility,
                'status' => ConcernStatus::AiProcessed,
                'ai_processed_at' => now(),
            ]);

            return $analysis;
        });

        Log::info('AI analysis persisted.', [
            'concern_id' => $this->concern->id,
            'analysis_id' => $analysis->id,
            'category_id' => $categoryId,
            'steps_count' => count($analysisData['prescriptive_steps'] ?? []),
        ]);
    }

    private function imageParts(): array
    {
        try {
            return $this->concern->media()
                ->orderBy('sort_order')
                ->limit(5)
                ->get()
                ->filter(fn ($media) => Storage::disk('public')->exists($media->storage_key))
                ->map(function ($media) {
                    $mimeType = $media->mime_type ?: Storage::disk('public')->mimeType($media->storage_key);

                    if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp'], true)) {
                        return null;
                    }

                    return [
                        'mimeType' => $mimeType,
                        'data' => base64_encode(Storage::disk('public')->get($media->storage_key)),
                    ];
                })
                ->filter()
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::warning('AI image reference unavailable; continuing with text only.', [
                'concern_id' => $this->concern->id,
                'message' => $e->getMessage(),
            ]);

            return [];
        }
    }

    private function responseSchema(): array
    {
        return [
            'type' => 'OBJECT',
            'properties' => [
                'detected_language' => ['type' => 'STRING'],
                'suggested_visibility' => ['type' => 'STRING'],
                'suggested_severity' => ['type' => 'STRING'],
                'severity_confidence' => ['type' => 'NUMBER'],
                'suggested_category_code' => ['type' => 'STRING', 'nullable' => true],
                'suggested_subcategory_code' => ['type' => 'STRING', 'nullable' => true],
                'prescriptive_steps' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
                'suggested_duration_hours' => ['type' => 'INTEGER', 'nullable' => true],
                'evidence_summary' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
                'uncertainties' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
            ],
            'required' => [
                'detected_language', 'suggested_visibility', 'suggested_severity',
                'severity_confidence', 'suggested_category_code', 'suggested_subcategory_code',
                'prescriptive_steps', 'suggested_duration_hours', 'evidence_summary', 'uncertainties',
            ],
        ];
    }

    private function sanitizeAnalysis(array $analysisData): array
    {
        $analysisData['prescriptive_steps'] = array_values(array_filter(
            is_array($analysisData['prescriptive_steps'] ?? null) ? $analysisData['prescriptive_steps'] : [],
            fn ($step) => is_string($step) && trim($step) !== ''
        ));
        $analysisData['evidence_summary'] = array_values(array_filter(
            is_array($analysisData['evidence_summary'] ?? null) ? $analysisData['evidence_summary'] : [],
            fn ($item) => is_string($item) && trim($item) !== ''
        ));
        $analysisData['uncertainties'] = array_values(array_filter(
            is_array($analysisData['uncertainties'] ?? null) ? $analysisData['uncertainties'] : [],
            fn ($item) => is_string($item) && trim($item) !== ''
        ));

        return $analysisData;
    }

    private function boundedConfidence(mixed $confidence): float
    {
        return min(1.0, max(0.0, is_numeric($confidence) ? (float) $confidence : 0.55));
    }

    private function categoryCatalog(): array
    {
        $categories = ConcernCategory::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('barangay_id')
                    ->orWhere('barangay_id', $this->concern->barangay_id);
            })
            ->get(['id', 'code', 'name']);

        $subcategories = ConcernSubcategory::query()
            ->where('is_active', true)
            ->whereIn('category_id', $categories->pluck('id'))
            ->get(['category_id', 'code', 'name']);

        return $categories->map(fn ($category) => [
            'category_code' => $category->code,
            'category_name' => $category->name,
            'subcategories' => $subcategories
                ->where('category_id', $category->id)
                ->map(fn ($subcategory) => [
                    'subcategory_code' => $subcategory->code,
                    'subcategory_name' => $subcategory->name,
                ])
                ->values()
                ->all(),
        ])->values()->all();
    }

    private function resolveCategoryIds(array $analysisData): array
    {
        $categoryCode = strtoupper(trim((string) ($analysisData['suggested_category_code'] ?? '')));
        $subcategoryCode = strtoupper(trim((string) ($analysisData['suggested_subcategory_code'] ?? '')));

        $category = $categoryCode === ''
            ? null
            : ConcernCategory::query()
                ->where('code', $categoryCode)
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('barangay_id')
                        ->orWhere('barangay_id', $this->concern->barangay_id);
                })
                ->first();

        if (!$category && $this->concern->category_id) {
            $category = ConcernCategory::find($this->concern->category_id);
        }

        if (!$category) {
            return [null, null];
        }

        $subcategory = $subcategoryCode === ''
            ? null
            : ConcernSubcategory::query()
                ->where('category_id', $category->id)
                ->where('code', $subcategoryCode)
                ->where('is_active', true)
                ->first();

        return [$category->id, $subcategory?->id];
    }
}
