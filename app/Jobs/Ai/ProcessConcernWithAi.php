<?php

namespace App\Jobs\Ai;

use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Models\ConcernCategory;
use App\Models\ConcernSubcategory;
use App\Services\Concerns\ConcernDuplicateMatcher;
use App\Services\Concerns\ConcernResolutionDeadline;
use App\Enums\ConcernStatus;
use App\Support\ConcernStatusUpdate;
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

        // Pre-check for blatant keyboard smashes / gibberish before querying AI or heuristics
        if ($this->isGibberishText($this->concern->title . ' ' . $this->concern->description)) {
            $this->suggestSpamReview();
            return;
        }

        if (!$apiKey) {
            Log::warning('Gemini API key is missing; using rule-based analysis.', [
                'concern_id' => $this->concern->id,
            ]);
            $this->applyHeuristicAnalysis();
            return;
        }

        $prompt = "
            You are an expert case-triage assistant for a barangay in the Philippines. 
            You are fluent in English, Tagalog, Taglish, common Filipino text shortcuts, acronyms, and informal terms.

            Analyze the supplied report text and image evidence. Look past typos, slang, and shorthand to extract the true underlying intent or community issue. 
            If the text is purely random string sequences, keyboard smashes (e.g., 'asdjfugiocnrle' or 'asdasd'), or meaningless gibberish with no valid community concern, you MUST set suggested_severity to 'low', severity_confidence to 0.01, and add 'Possible spam or gibberish input' to uncertainties.

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
                \"suggested_due_date\": \"YYYY-MM-DD or null\",
                \"evidence_summary\": [\"short fact supported by the report or image\"],
                \"uncertainties\": [\"what cannot be determined from the evidence\"]
            }

            Choose category and subcategory ONLY from this catalog. Return null when none matches:
            " . json_encode($this->categoryCatalog(), JSON_UNESCAPED_SLASHES) . "

            Analysis & Quality Guidelines:
            - Keyboard Smashes / Gibberish: If the text is purely random string sequences with no discernible words or meaning (e.g., \"asdjfugiocnrle\" or \"asdasd\"), set suggested_severity to \"low\", severity_confidence to 0.05, and add \"Report consists of gibberish or non-sensical text\" to uncertainties.
            - Taglish, Typos & Shorthand: Accurately interpret Tagalog, Taglish, abbreviations (like brgy, baha, kuryente, sirang ilaw), and common typos. Do not penalize reports just because they are misspelled or informal.
            - Vague Context: If the report lacks actionable details, set low confidence and note what is missing in uncertainties.
            - Reliable Concern: Genuine municipal or barangay issues should receive appropriate categories and actionable steps.
            - Routing Rules: If the report contains sensitive info, PII, domestic disputes, or VAWC, set visibility to 'private'. Otherwise set 'public'.
            - Prescriptive Steps: Provide detailed, step-by-step operational solutions to resolve the concern. CRITICAL: You must write these steps from a third-person perspective referring to the barangay personnel (e.g., \"The barangay response team will deploy...\", \"Assigned officials must bring...\", \"The engineering desk will repair...\"). Do NOT write them as direct commands like \"Clear the debris,\" because residents will read these steps on the public feed and might mistakenly think they are being instructed to do the work themselves.

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

                if (($analysisData['severity_confidence'] ?? 1.0) < 0.1 || 
                    collect($analysisData['uncertainties'] ?? [])->contains(fn($u) => stripos($u, 'gibberish') !== false || stripos($u, 'spam') !== false)) {
                    $this->suggestSpamReview();
                    return;
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

    private function isGibberishText(string $text): bool
    {
        $text = strtolower(trim($text));
        if ($text === '') {
            return true;
        }

        $cleanAlpha = preg_replace('/[^a-z]/', '', $text);
        if (strlen($cleanAlpha) < 4) {
            return true; 
        }

        $commonTokens = [
            'ang', 'mga', 'sa', 'ng', 'at', 'na', 'ay', 'ko', 'mo', 'nya', 'ka', 'kita', 'kami', 'sila', 'kayo',
            'po', 'opo', 'yung', 'ito', 'iyan', 'iyon', 'may', 'mayroon', 'wala', 'hindi', 'oo', 'ba', 'pa', 'na',
            'baha', 'tubig', 'ilaw', 'kuryente', 'basura', 'tapon', 'kalat', 'daan', 'kalsada', 'pothole', 'lubak',
            'sunog', 'fire', 'nakawan', 'magnanakaw', 'away', 'gulo', 'ingay', 'videoke', 'street', 'road', 'light',
            'pole', 'electric', 'leak', 'pipe', 'dog', 'aso', 'pusa', 'cat', 'stray', 'report', 'concern', 'issue',
            'tulong', 'help', 'please', 'paki', 'sir', 'maam', 'kapitan', 'tanod', 'barangay', 'bgy', 'brgy', 'lgu'
        ];

        $hasKnownToken = false;
        foreach ($commonTokens as $token) {
            if (str_contains($text, $token)) {
                $hasKnownToken = true;
                break;
            }
        }

        if (!$hasKnownToken && strlen($cleanAlpha) >= 5) {
            return true;
        }

        $words = preg_split('/\s+/', $text);
        $hasLongNonsenseWord = collect($words)->contains(function($w) {
            $wClean = preg_replace('/[^a-z]/', '', $w);
            return strlen($wClean) > 10 && !preg_match('/[aeiou]{2}/', $wClean);
        });

        return $hasLongNonsenseWord;
    }

    /**
     * Suggest Spam / Rejection to Admin Queue (Waits for Human Confirmation)
     */
    private function suggestSpamReview(): void
    {
        DB::transaction(function () {
            $previousStatus = $this->concern->status->value ?? $this->concern->status;
            
            // Set to AI Processed so it appears in the Admin Report Queue for human review/rejection
            $this->concern->update([
                'severity' => 'low',
                'status' => ConcernStatus::AiProcessed,
                'ai_processed_at' => now(),
            ]);

            ConcernAiAnalysis::create([
                'concern_id' => $this->concern->id,
                'is_current' => true,
                'detected_language' => 'en',
                'suggested_visibility' => $this->concern->visibility ?? 'public',
                'suggested_severity' => 'low',
                'severity_confidence' => 0.01,
                'prescriptive_steps' => [
                    'Review report content for spam or meaningless text.',
                    'Confirm rejection or dismissal if non-actionable.',
                ],
                'raw_model_output' => ['reason' => 'AI flagged as potential spam/gibberish requiring admin confirmation.'],
                'processed_at' => now(),
            ]);

            if ($previousStatus !== ConcernStatus::AiProcessed->value) {
                ConcernStatusUpdate::record(
                    $this->concern,
                    $previousStatus,
                    ConcernStatus::AiProcessed->value,
                    null,
                    'AI suggests reviewing for spam or dismissal.',
                );
            }
        });
    }

    private function applyHeuristicAnalysis(): void
    {
        $text = strtolower(trim($this->concern->title.' '.$this->concern->description));

        if ($this->isGibberishText($text)) {
            $this->suggestSpamReview();
            return;
        }

        $hasFilipino = (bool) preg_match('/\b(ang|mga|po|yung|naman|hindi|sa|ng|baha|ilaw|basura|kalat|daan|kalsada)\b/u', $text);
        $hasEnglish = (bool) preg_match('/\b(the|and|please|street|flood|garbage|road|water|light)\b/i', $text);

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
            str_contains($text, 'fire') || str_contains($text, 'sunog') || str_contains($text, 'collapse') || str_contains($text, 'electroc') => 'critical',
            str_contains($text, 'flood') || str_contains($text, 'baha') || str_contains($text, 'pothole') || str_contains($text, 'lubak') => 'high',
            str_contains($text, 'noise') || str_contains($text, 'ingay') || str_contains($text, 'videoke') => 'low',
            default => 'medium',
        };

        $this->persistAnalysis([
            'detected_language' => $language,
            'suggested_visibility' => $forcePrivate ? 'private' : 'public',
            'suggested_severity' => $severity,
            'severity_confidence' => 0.55,
            'prescriptive_steps' => [
                'The barangay response team will be deployed to the site with appropriate tools to physically resolve the reported issue.',
                'Assigned personnel will clear any hazards, conduct necessary repairs, or mediate the dispute based on barangay protocols.',
                'The field team will document the completed operational resolution with before and after photos.',
            ],
            'suggested_duration_hours' => app(ConcernResolutionDeadline::class)
                ->durationHoursForConcern($this->concern, $severity),
        ]);
    }

    private function persistAnalysis(array $analysisData): void
    {
        [$categoryId, $subcategoryId] = $this->resolveCategoryIds($analysisData);
        $aiSeverity = $analysisData['suggested_severity'] ?? 'medium';
        $aiSeverity = in_array($aiSeverity, ['low', 'medium', 'high', 'critical'], true)
            ? $aiSeverity
            : 'medium';

        $visibility = $analysisData['suggested_visibility'] ?? $this->concern->visibility ?? 'public';
        if (Concern::shouldForcePrivate(null, $this->concern->title ?? '', $this->concern->description ?? '')) {
            $visibility = 'private';
        }

        $duplicateMatcher = app(ConcernDuplicateMatcher::class);
        $duplicateMatch = $visibility === 'public' && $categoryId
            ? $duplicateMatcher->findMatch($this->concern, $categoryId, $subcategoryId)
            : null;
        $crowdSeverity = $duplicateMatch
            ? $duplicateMatcher->severityForReporterCount($duplicateMatch['reporter_count'])
            : null;
        $severity = $duplicateMatcher->higherSeverity($aiSeverity, $crowdSeverity);
        $deadlinePolicy = app(ConcernResolutionDeadline::class);
        $analysisData['suggested_duration_hours'] = $deadlinePolicy->durationHoursForConcern($this->concern, $severity);
        $analysisData['suggested_due_date'] = $deadlinePolicy->deadlineFor($this->concern, $severity)->toDateString();

        $analysis = DB::transaction(function () use (
            $analysisData,
            $categoryId,
            $subcategoryId,
            $visibility,
            $aiSeverity,
            $severity,
            $duplicateMatch,
            $crowdSeverity,
            $duplicateMatcher,
            $deadlinePolicy,
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
                'suggested_severity' => $aiSeverity,
                'severity_confidence' => $this->boundedConfidence($analysisData['severity_confidence'] ?? 0.55),
                'prescriptive_steps' => $analysisData['prescriptive_steps'] ?? [],
                'suggested_due_date' => $analysisData['suggested_due_date'],
                'suggested_duration_hours' => $analysisData['suggested_duration_hours']
                    ?? app(ConcernResolutionDeadline::class)->durationHoursForConcern($this->concern, $severity),
                'duplicate_candidate_id' => $duplicateMatch['candidate']->id ?? null,
                'duplicate_similarity' => $duplicateMatch['similarity'] ?? null,
                'raw_model_output' => $analysisData,
                'processed_at' => now(),
            ]);

            $previousStatus = $this->concern->status->value ?? $this->concern->status;
            $this->concern->update([
                'severity' => $severity,
                'visibility' => $visibility,
                'status' => ConcernStatus::AiProcessed,
                'ai_processed_at' => now(),
            ]);

            if ($previousStatus !== ConcernStatus::AiProcessed->value) {
                ConcernStatusUpdate::record(
                    $this->concern,
                    $previousStatus,
                    ConcernStatus::AiProcessed->value,
                    null,
                    'AI triage completed.',
                );
            }

            if ($duplicateMatch && $crowdSeverity) {
                $duplicateMatcher->raiseMatchedIncidentSeverity(
                    $duplicateMatch['candidate'],
                    $crowdSeverity,
                );
            }

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
                'suggested_due_date' => ['type' => 'STRING', 'nullable' => true],
                'evidence_summary' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
                'uncertainties' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
            ],
            'required' => [
                'detected_language', 'suggested_visibility', 'suggested_severity',
                'severity_confidence', 'suggested_category_code', 'suggested_subcategory_code',
                'prescriptive_steps', 'suggested_duration_hours', 'suggested_due_date', 'evidence_summary', 'uncertainties',
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