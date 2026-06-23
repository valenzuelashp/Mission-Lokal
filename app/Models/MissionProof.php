<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionProof extends Model
{
    use HasFactory, HasUuids;

    // Explicitly define the table name to avoid Laravel pluralizing it to "mission_proofs"
    protected $table = 'mission_proof';

    // Tell Laravel to use 'submitted_at' when creating a new record, and disable updates.
    public const CREATED_AT = 'submitted_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'mission_id',
        'submitted_by',
        'notes',
        // 'submitted_at' is handled automatically by Laravel because of the const above
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function submitter(): BelongsTo
    {
        // Custom name 'submitter' pointing to the 'submitted_by' column
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function media(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MissionProofMedia::class, 'proof_id');
    }
}