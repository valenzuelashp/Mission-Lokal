<?php

namespace App\Jobs\Ai;

use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Enums\ConcernStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
            You are an AI assistant for a barangay in the Philippines.
            Analyze the following resident concern and respond ONLY with a valid JSON object matching this exact schema:
            {
                \"detected_language\": \"en\" | \"fil\" | \"mixed\",
                \"suggested_visibility\": \"public\" | \"private\",
                \"suggested_severity\": \"low\" | \"medium\" | \"high\" | \"critical\",
                \"severity_confidence\": float between 0.0 and 1.0,
                \"prescriptive_steps\": [\"step 1\", \"step 2\", \"step 3\"],
                \"suggested_duration_hours\": integer
            }

            Routing Rules:
            - If the report contains sensitive info, PII, domestic disputes, or VAWC, set visibility to 'private'.
            - If it is a public hazard (infrastructure, sanitation), set visibility to 'public'.

            Title: {$this->concern->title}
            Description: {$this->concern->description}
        ";

        try {
            $response = Http::timeout(30)
                ->retry(2, 1000)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])->post('https://generativelanguage.googleapis.com/v1beta/models/' . config('services.gemini.model') . ':generateContent', [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'response_mime_type' => 'application/json',
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

                $this->persistAnalysis($analysisData);
                return;
            }

            if ($response->serverError() || $response->status() === 429) {
                $response->throw();
            }

            Log::error('Gemini API Error.', [
                'concern_id' => $this->concern->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            $this->applyHeuristicAnalysis();
        } catch (\Exception $e) {
            Log::error('AI Processing Exception.', [
                'concern_id' => $this->concern->id,
                'message' => $e->getMessage(),
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
        $severity = $analysisData['suggested_severity'] ?? 'medium';
        $severity = in_array($severity, ['low', 'medium', 'high', 'critical'], true)
            ? $severity
            : 'medium';

        $visibility = $analysisData['suggested_visibility'] ?? $this->concern->visibility ?? 'public';
        if (Concern::shouldForcePrivate(null, $this->concern->title ?? '', $this->concern->description ?? '')) {
            $visibility = 'private';
        }

        ConcernAiAnalysis::where('concern_id', $this->concern->id)
            ->where('is_current', true)
            ->update(['is_current' => false]);

        ConcernAiAnalysis::create([
            'concern_id' => $this->concern->id,
            'is_current' => true,
            'detected_language' => $analysisData['detected_language'] ?? 'mixed',
            'suggested_visibility' => $visibility,
            'suggested_severity' => $severity,
            'severity_confidence' => $analysisData['severity_confidence'] ?? 0.8,
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
    }
}
