<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreloadedResident extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'full_name',
        'birthday',
        'address',
        'email',
        'mobile',
        'is_claimed',
        'claimed_at',
        'user_id',
    ];

    protected $casts = [
        'birthday' => 'date',
        'is_claimed' => 'boolean',
        'claimed_at' => 'datetime',
    ];

    // Links this record to the actual User account once they register
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}