<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionChecklistItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'mission_checklist_items';

    // Completely disable Laravel's automatic timestamps (created_at / updated_at)
    // because they do not exist in our migration schema.
    public $timestamps = false;

    protected $fillable = [
        'mission_id',
        'step_order',
        'description',
        'is_completed',
        'completed_at',
        'completed_by',
    ];

    protected function casts(): array
    {
        return [
            'step_order' => 'integer',
            'is_completed' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function completer(): BelongsTo
    {
        // Custom name 'completer' pointing to 'completed_by'
        return $this->belongsTo(User::class, 'completed_by');
    }
}
