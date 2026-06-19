<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionAssignment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'mission_assignments';

    // Tell Laravel to use 'assigned_at' instead of 'created_at' when making a new record,
    // and completely disable the 'updated_at' behavior.
    public const CREATED_AT = 'assigned_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'mission_id',
        'personnel_id',
        'assigned_by',
        // Note: assigned_at is handled automatically by Laravel because of the const above
        'unassigned_at',
        'sms_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'unassigned_at' => 'datetime',
            'sms_sent_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'personnel_id');
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}