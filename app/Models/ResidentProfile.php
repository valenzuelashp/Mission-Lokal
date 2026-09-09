<?php

namespace App\Models;

use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResidentProfile extends Model
{
    use HasFactory;

    protected $table = 'resident_profiles';

    protected $fillable = [
        'user_id',
        'civic_xp',
        'verification_status',
        'rejection_reason',
        'birthday',
        'sex',
        'civil_status',
        'house_street',
        'barangay_name',
        'city',
        'province',
        'address',
        'government_id_storage_key',
        'digital_id_code',
    ];

    protected $casts = [
        'civic_xp' => 'integer',
        'verification_status' => VerificationStatus::class,
        'birthday' => 'date',
    ];

    protected $attributes = [
        'civic_xp' => 50,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}