<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResidentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'birthday',
        'sex',
        'civil_status',
        'house_street',
        'barangay_name',
        'city',
        'province',
        'address',
        'government_id_storage_key',
        'rejection_reason',
        'digital_id_code',
    ];

    protected $casts = [
        'birthday' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}