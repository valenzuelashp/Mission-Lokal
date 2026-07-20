<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory, HasUuids;

    // FIX: Whitelisted required missing structural columns for dynamic layout feeds
    protected $fillable = [
        'barangay_id',
        'title',
        'body',
        'summary',
        'cover_image_url',
        'is_published',
        'published_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function creator(): BelongsTo
    {
        // Custom name 'creator' pointing to the 'created_by' column
        return $this->belongsTo(User::class, 'created_by');
    }
}