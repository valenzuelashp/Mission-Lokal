<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionResolutionPost extends Model
{
    use HasUuids;

    protected $fillable = [
        'mission_id',
        'created_by',
        'title',
        'body',
        'media_ids',
        'is_published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'media_ids' => 'array',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}