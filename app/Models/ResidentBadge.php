<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResidentBadge extends Model
{
    public $timestamps = false;

    protected $table = 'resident_badges';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'badge_key',
        'name',
        'threshold',
        'earned_xp',
        'earned_at',
    ];

    protected $casts = [
        'threshold' => 'integer',
        'earned_xp' => 'integer',
        'earned_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}