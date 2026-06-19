<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionProofMedia extends Model
{
    use HasFactory, HasUuids;

    // Explicitly defining the table name so Laravel doesn't guess wrong
    protected $table = 'mission_proof_media';

    // Disable the auto-updating 'updated_at' column since it's not in the schema
    public const UPDATED_AT = null;

    protected $fillable = [
        'proof_id',
        'storage_key',
        'mime_type',
        'caption',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function proof(): BelongsTo
    {
        return $this->belongsTo(MissionProof::class, 'proof_id');
    }
}