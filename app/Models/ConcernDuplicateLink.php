<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernDuplicateLink extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'concern_duplicate_links';

    // We must tell Laravel to disable the 'updated_at' timestamp behavior
    // because this table only tracks 'created_at'.
    public const UPDATED_AT = null;

    protected $fillable = [
        'primary_concern_id',
        'linked_concern_id',
        'link_type',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function primaryConcern(): BelongsTo
    {
        return $this->belongsTo(Concern::class, 'primary_concern_id');
    }

    public function linkedConcern(): BelongsTo
    {
        return $this->belongsTo(Concern::class, 'linked_concern_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}