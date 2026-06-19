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