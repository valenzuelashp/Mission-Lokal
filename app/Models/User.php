<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne; 
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

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
        'profile_edit_status',
        'is_active',
        'password_prompt_snoozed_on',
        'last_login_at',
        // --- PARENT FIELDS FOR MINORS ---
        'parent_user_id',
        'parent_name',
        'parent_contact',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'password' => 'hashed',
            'is_active' => 'boolean',
            'password_prompt_snoozed_on' => 'date',
            'last_login_at' => 'datetime',
            'birthday' => 'date',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function residentProfile(): HasOne
    {
        return $this->hasOne(ResidentProfile::class);
    }

    public function personnelProfile(): HasOne
    {
        return $this->hasOne(Personnel::class, 'user_id');
    }

    public function concerns(): HasMany
    {
        return $this->hasMany(Concern::class, 'reporter_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_user_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(User::class, 'parent_user_id');
    }

    public function isMinor(): bool
    {
        if ($this->role !== UserRole::Resident && $this->role !== 'resident') {
            return false;
        }

        if (!$this->birthday) {
            $profile = $this->residentProfile;
            if (!$profile || !$profile->birthday) {
                return false;
            }
            return Carbon::parse($profile->birthday)->age < 18;
        }

        return Carbon::parse($this->birthday)->age < 18;
    }

    public function needsPasswordSetup(): bool
    {
        if (! $this->password) {
            return true;
        }

        return ! $this->is_active || Hash::check('password', $this->password);
    }

    public function shouldShowPasswordPrompt(): bool
    {
        return $this->needsPasswordSetup();
    }

    public function governmentIdFileLabel(): string
    {
        $last = mb_strtoupper(trim((string) preg_replace('/\s+/u', ' ', (string) $this->last_name)));
        $initials = mb_strtoupper(mb_substr(trim((string) $this->first_name), 0, 1));
        $middle = trim((string) $this->middle_name);
        if ($middle !== '') {
            $initials .= mb_strtoupper(mb_substr($middle, 0, 1));
        }

        $last = $last !== '' ? $last : 'UNKNOWN';
        $initials = $initials !== '' ? $initials : 'X';

        return "{$last}, {$initials} ID";
    }
}