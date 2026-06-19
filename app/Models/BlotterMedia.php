<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlotterMedia extends Model
{
    use HasFactory, HasUuids;

    // Explicitly defining the table name
    protected $table = 'blotter_media';

    // Disable the auto-updating 'updated_at' column
    public const UPDATED_AT = null;

    protected $fillable = [
        'blotter_id',
        'storage_key',
        'mime_type',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function blotter(): BelongsTo
    {
        return $this->belongsTo(Blotter::class);
    }
}