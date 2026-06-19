<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'barangay_id',
        'type',
        'title',
        'content',
        'metadata',
        'location',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            // Automatically converts the JSON data into a usable PHP array
            'metadata' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    // --- Relationships ---

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }
}