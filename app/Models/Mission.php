<?php

namespace App\Models;

use App\Enums\MissionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Mission extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'barangay_id',
        'concern_id',
        'assigned_to',
        'playbook_id',
        'due_date',
        'estimated_duration_hours',
        'status',
        'is_overdue',
        'is_escalated',
        'acknowledged_at',
        'completed_at',
        'verified_at',
        'verified_by',
        'closed_summary',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'status' => MissionStatus::class, // Converts the string to your MissionStatus PHP Enum
            'is_overdue' => 'boolean',
            'is_escalated' => 'boolean',
            'acknowledged_at' => 'datetime',
            'completed_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }

    public function assignee(): BelongsTo
    {
        // Custom name 'assignee' pointing to the 'assigned_to' column in the users table
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function playbook(): BelongsTo
    {
        // Links to the CategoryPlaybook model
        return $this->belongsTo(CategoryPlaybook::class, 'playbook_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function proof(): HasOne
    {
        return $this->hasOne(MissionProof::class);
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(MissionChecklistItem::class);
    }
}