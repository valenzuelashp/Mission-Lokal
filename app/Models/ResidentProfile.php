<?php

namespace App\Models;

use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

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

    /**
     * Safely award Civic XP to the resident.
     * Prevents double-awarding for the same action on the same reference item.
     */
    public function awardXp(string $action, int $points, string $referenceType, string $referenceId, string $barangayId): void
    {
        // Check if points were already awarded for this specific action and concern
        $exists = DB::table('civic_xp_events')
            ->where('user_id', $this->user_id)
            ->where('action', $action)
            ->where('reference_type', $referenceType)
            ->where('reference_id', $referenceId)
            ->exists();

        if (!$exists && $points > 0) {
            // Log the event
            DB::table('civic_xp_events')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $this->user_id,
                'barangay_id' => $barangayId,
                'action' => $action,
                'points' => $points,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'created_at' => now(),
            ]);

            // Add points to their profile
            $this->increment('civic_xp', $points);
        }
    }

    /**
     * Safely deduct Civic XP and auto-suspend if threshold is breached.
     */
    public function penalize(string $action, int $penaltyPoints, string $referenceType, string $referenceId, string $barangayId): void
    {
        // Ensure points are negative
        $points = -abs($penaltyPoints);

        $exists = DB::table('civic_xp_events')
            ->where('user_id', $this->user_id)
            ->where('action', $action)
            ->where('reference_type', $referenceType)
            ->where('reference_id', $referenceId)
            ->exists();

        if (!$exists && $points < 0) {
            // 1. Log the penalty event
            DB::table('civic_xp_events')->insert([
                'id' => (string) Str::uuid(),
                'user_id' => $this->user_id,
                'barangay_id' => $barangayId,
                'action' => $action,
                'points' => $points,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'created_at' => now(),
            ]);

            // 2. Deduct points from profile
            $this->increment('civic_xp', $points);
            $this->refresh();

            // 3. Auto-Suspend if XP drops below 0
            if ($this->civic_xp < 0) {
                $user = $this->user;
                if ($user && $user->is_active) {
                    $user->update(['is_active' => 0]); // 0 = Suspended

                    DB::table('audit_logs')->insert([
                        'barangay_id' => $barangayId,
                        'actor_id' => Auth::id() ?? $user->id,
                        'action' => 'AUTO_SUSPEND',
                        'entity_type' => 'User',
                        'entity_id' => $user->id,
                        'metadata' => json_encode(['details' => 'Account auto-suspended. Civic XP dropped to ' . $this->civic_xp . ' due to spam/fake reports.']),
                        'ip_address' => request()->ip(),
                        'created_at' => now(),
                    ]);
                }
            }
        }
    }
}