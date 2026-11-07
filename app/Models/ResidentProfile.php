<?php

namespace App\Models;

use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
        'house_street',
        'barangay_name',
        'city',
        'province',
        'address',
        'government_id_storage_key',
        'digital_id_code',
        'digital_id_verification_token',
    ];

    protected $casts = [
        'civic_xp' => 'integer',
        'verification_status' => VerificationStatus::class,
        'birthday' => 'date',
    ];

    protected $attributes = [
        'civic_xp' => 50,
    ];

    protected static function booted(): void
    {
        static::creating(function (ResidentProfile $profile): void {
            $profile->digital_id_verification_token ??= Str::random(64);
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function badges(): HasMany
    {
        return $this->hasMany(ResidentBadge::class, 'user_id', 'user_id')->orderBy('threshold');
    }

    /**
     * Safely award Civic XP to the resident.
     * Prevents double-awarding for the same action on the same reference item.
     */
    public function awardXp(string $action, int $points, string $referenceType, string $referenceId, string $barangayId): void
    {
        if ($points <= 0) {
            return;
        }

        DB::transaction(function () use ($action, $points, $referenceType, $referenceId, $barangayId) {
            $profile = self::query()->lockForUpdate()->find($this->getKey());
            if (! $profile) {
                return;
            }

            $events = DB::table('civic_xp_events')->where('user_id', $profile->user_id);
            $alreadyAwarded = (clone $events)
                ->where('action', $action)
                ->where('reference_type', $referenceType)
                ->where('reference_id', $referenceId)
                ->exists();

            if ($alreadyAwarded) {
                return;
            }

            $awardedPoints = min($points, max(0, 100 - (int) $profile->civic_xp));
            if ($awardedPoints === 0) {
                return;
            }

            DB::table('civic_xp_events')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $profile->user_id,
                'barangay_id' => $barangayId,
                'action' => $action,
                'points' => $awardedPoints,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'created_at' => now(),
            ]);

            $profile->increment('civic_xp', $awardedPoints);
            $profile->refresh();
            $this->civic_xp = $profile->civic_xp;
            app(\App\Services\CivicRecognition::class)->awardBadges($profile->user_id, (int) $profile->civic_xp);
        });
    }

    /**
     * Safely deduct Civic XP and auto-suspend if threshold is breached.
     */
    public function penalize(string $action, int $penaltyPoints, string $referenceType, string $referenceId, string $barangayId): void
    {
        DB::transaction(function () use ($action, $penaltyPoints, $referenceType, $referenceId, $barangayId) {
            $profile = self::query()->lockForUpdate()->find($this->getKey());
            if (! $profile) {
                return;
            }

            $alreadyPenalized = DB::table('civic_xp_events')
                ->where('user_id', $profile->user_id)
                ->where('action', $action)
                ->where('reference_type', $referenceType)
                ->where('reference_id', $referenceId)
                ->exists();

            if ($alreadyPenalized) {
                return;
            }

            $deduction = min((int) $profile->civic_xp, abs($penaltyPoints));
            DB::table('civic_xp_events')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $profile->user_id,
                'barangay_id' => $barangayId,
                'action' => $action,
                'points' => -$deduction,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'created_at' => now(),
            ]);

            $profile->update(['civic_xp' => (int) $profile->civic_xp - $deduction]);
            $this->civic_xp = $profile->civic_xp;
        });
    }
}