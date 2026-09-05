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

    /**
     * Create a new job instance.
     */
    public function __construct(public Concern $concern)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            Log::error('Gemini API key is missing.');
            return;
        }

        // We instruct Gemini to return a strict JSON format matching your blueprint's AI pipeline rules.
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
            // Laravel's Http facade handles the cURL request natively and securely.
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $apiKey,
            ])->post('https://generativelanguage.googleapis.com/v1beta/models/' . config('services.gemini.model') . ':generateContent', [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json', // Forces Gemini to output pure JSON
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                $rawText = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($rawText) {
                    $analysisData = json_decode($rawText, true);
                    $severity = $analysisData['suggested_severity'] ?? 'medium';
                    $severity = in_array($severity, ['low', 'medium', 'high', 'critical'], true)
                        ? $severity
                        : 'medium';

                    // 1. Save the analysis to the concern_ai_analysis table
                    ConcernAiAnalysis::create([
                        'concern_id' => $this->concern->id,
                        'is_current' => true,
                        'detected_language' => $analysisData['detected_language'] ?? 'mixed',
                        'suggested_visibility' => $analysisData['suggested_visibility'] ?? 'public',
                        'suggested_severity' => $severity,
                        'severity_confidence' => $analysisData['severity_confidence'] ?? 0.8,
                        'prescriptive_steps' => $analysisData['prescriptive_steps'] ?? [],
                        'suggested_duration_hours' => $analysisData['suggested_duration_hours'] ?? 24,
                        'raw_model_output' => $analysisData,
                        'processed_at' => now(),
                    ]);

                    // 2. Update the main concern status to 'ai_processed'
                    $this->concern->update([
                        'severity' => $severity,
                        'status' => ConcernStatus::AiProcessed,
                        'ai_processed_at' => now(),
                    ]);
                }
            } else {
                if ($response->serverError() || $response->status() === 429) {
                    $response->throw();
                }

                Log::error('Gemini API Error: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('AI Processing Exception: ' . $e->getMessage());
            throw $e;
        }
    }
}