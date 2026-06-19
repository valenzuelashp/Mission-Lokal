<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernMedia extends Model
{
    use HasFactory, HasUuids;

    // Explicitly declaring the table is best practice here
    protected $table = 'concern_media';

    // Disable the auto-updating 'updated_at' column since we don't have it in the schema
    public const UPDATED_AT = null;

    protected $fillable = [
        'concern_id',
        'storage_key',
        'mime_type',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }
}