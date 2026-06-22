<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne; // <-- Added this
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'barangay_id',
        'account_id',
        'role',
        'first_name', 
        'middle_name',
        'last_name',  
        'name_extension',
        'birthday', 
        'address',  
        'email',
        'mobile',
        'password',
        'verification_status',
        'profile_edit_status',
        'civic_xp',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'verification_status' => VerificationStatus::class,
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'birthday' => 'date',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    // <-- NEW RELATIONSHIP ADDED HERE
    public function residentProfile(): HasOne
    {
        return $this->hasOne(ResidentProfile::class);
    }
}