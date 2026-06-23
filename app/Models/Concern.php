<?php

namespace App\Models;

use App\Enums\ConcernStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Concern extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'concerns';

    // The $fillable array acts as a security whitelist. 
    // It prevents malicious users from injecting unexpected data into the database (Mass Assignment).
    protected $fillable = [
        'barangay_id',
        'reporter_id',
        'title',
        'description',
        'category_id',
        'subcategory_id',
        'visibility',
        'severity',
        'severity_confirmed',
        'status',
        'location', // Note: Geospatial data needs special handling when inserting, which we'll do in the controller
        'public_location',
        'address_text',
        'is_blotter_candidate',
        'duplicate_of_id',
        'ai_processed_at',
        'staff_reviewed_by',
        'staff_reviewed_at',
        'closed_summary',
    ];

    // The $casts array automatically converts raw database values into useful PHP types.
    protected function casts(): array
    {
        return [
            'severity_confirmed' => 'boolean',
            'is_blotter_candidate' => 'boolean',
            'status' => ConcernStatus::class, // Automatically converts the DB string into your existing PHP Enum
            'ai_processed_at' => 'datetime',
            'staff_reviewed_at' => 'datetime',
        ];
    }

    // --- Relationships ---
    // These methods allow us to easily grab related data. 
    // E.g., $concern->reporter->full_name

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ConcernCategory::class, 'category_id');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function duplicateOf(): BelongsTo
    {
        return $this->belongsTo(Concern::class, 'duplicate_of_id');
    }

    public function staffReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_reviewed_by');
    }

    public function media(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ConcernMedia::class);
    }
}