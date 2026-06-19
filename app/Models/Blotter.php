<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Blotter extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'barangay_id',
        'concern_id',
        'type',
        'complainant_id',
        'respondent_name',
        'narrative',
        'incident_at',
        'incident_location',
        'incident_address',
        'relief_sought',
        'witnesses',
        'signature_ack_at',
        'ticket_number',
        'status',
        'hearing_scheduled_at',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            // Automatically converts the JSON column into a PHP array
            'witnesses' => 'array',
            
            // Date parsing
            'incident_at' => 'datetime',
            'signature_ack_at' => 'datetime',
            'hearing_scheduled_at' => 'datetime',
            'approved_at' => 'datetime',
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

    public function complainant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'complainant_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}