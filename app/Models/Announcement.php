<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
    'barangay_id',
    'title',
    'body',
    'summary',
    'cover_image_url', // 🧠 Whitelisted safely
    'is_published',
    'published_at',
    'created_by',
];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    /**
     * Get the Barangay that owns the announcement.
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * Get the User who created the announcement.
     */
    public function creator(): BelongsTo
    {
        // Custom name 'creator' pointing to the 'created_by' column
        return $this->belongsTo(User::class, 'created_by');
    }
}