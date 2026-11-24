<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernAiAnalysis extends Model
{
    use HasFactory, HasUuids;

    // Explicitly define the table name since Laravel's pluralizer might guess "concern_ai_analyses"
    protected $table = 'concern_ai_analysis';

    protected $fillable = [
        'concern_id',
        'is_current',
        'detected_language',
        'suggested_category_id',
        'suggested_subcategory_id',
        'suggested_visibility',
        'suggested_severity',
        'severity_confidence',
        'embedding',
        'prescriptive_steps',
        'suggested_due_date',
        'suggested_duration_hours',
        'duplicate_candidate_id',
        'duplicate_similarity',
        'raw_model_output',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_current' => 'boolean',
            'severity_confidence' => 'float',
            'duplicate_similarity' => 'float',
            'suggested_due_date' => 'date',
            'processed_at' => 'datetime',
            
            // This tells Laravel to automatically convert these JSON columns into PHP arrays 
            // when reading from the database, and back to JSON when saving.
            'embedding' => 'array',
            'prescriptive_steps' => 'array',
            'raw_model_output' => 'array',
        ];
    }

    // --- Relationships ---

    public function reportQuality(): string
    {
        $rawOutput = is_array($this->raw_model_output) ? $this->raw_model_output : [];
        $quality = $rawOutput['report_quality'] ?? null;
        if (in_array($quality, ['ready_for_review', 'needs_clarification', 'possible_spam'], true)) {
            return $quality;
        }

        return ($this->severity_confidence ?? 0.55) < 0.1 ? 'needs_clarification' : 'ready_for_review';
    }

    public function triageExplanation(Concern $concern): array
    {
        $raw = is_array($this->raw_model_output) ? $this->raw_model_output : [];
        $factors = is_array($raw['severity_factors'] ?? null) ? $raw['severity_factors'] : [];
        $plan = is_array($raw['response_plan'] ?? null) ? $raw['response_plan'] : [];
        $severities = ['low', 'medium', 'high', 'critical'];
        $strings = static fn ($items) => array_slice(array_values(array_filter(array_map(
            fn ($item) => is_string($item) ? mb_substr(trim($item), 0, 500) : '',
            is_array($items) ? $items : [],
        ), fn ($item) => $item !== '')), 0, 10);
        $count = filter_var($factors['reporter_count'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        return [
            'analysis_source' => in_array($raw['analysis_source'] ?? null, ['gemini', 'local_rules'], true)
                ? $raw['analysis_source'] : 'unknown',
            'base_severity' => in_array($this->suggested_severity, $severities, true) ? $this->suggested_severity : null,
            'community_severity' => $count !== false && in_array($factors['community_severity'] ?? null, $severities, true)
                ? $factors['community_severity'] : null,
            'reporter_count' => $count !== false ? $count : null,
            'current_severity' => in_array($concern->severity, $severities, true) ? $concern->severity : 'medium',
            'staff_confirmed' => (bool) $concern->severity_confirmed,
            'severity_reason' => is_string($raw['severity_reason'] ?? null) && trim($raw['severity_reason']) !== ''
                ? mb_substr(trim($raw['severity_reason']), 0, 1000) : null,
            'evidence_summary' => $strings($raw['evidence_summary'] ?? []),
            'uncertainties' => $strings($raw['uncertainties'] ?? []),
            'response_plan' => [
                'source' => in_array($plan['source'] ?? null, ['playbook', 'gemini', 'local_rules', 'safeguarding'], true)
                    ? $plan['source'] : 'unknown',
                'playbook_title' => ($plan['source'] ?? null) === 'playbook' && is_string($plan['playbook_title'] ?? null)
                    ? mb_substr($plan['playbook_title'], 0, 255) : null,
            ],
        ];
    }

    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }

    public function suggestedCategory(): BelongsTo
    {
        // This links to the 'concern_categories' table, which we will build or have already seeded
        return $this->belongsTo(ConcernCategory::class, 'suggested_category_id');
    }

    public function suggestedSubcategory(): BelongsTo
    {
        return $this->belongsTo(ConcernSubcategory::class, 'suggested_subcategory_id');
    }

    public function duplicateCandidate(): BelongsTo
    {
        return $this->belongsTo(Concern::class, 'duplicate_candidate_id');
    }
}
