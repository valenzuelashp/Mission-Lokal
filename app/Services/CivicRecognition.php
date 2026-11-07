<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CivicRecognition
{
    private const BADGES = [
        ['id' => 'civic-spark', 'name' => 'Civic Spark', 'threshold' => 60],
        ['id' => 'community-helper', 'name' => 'Community Helper', 'threshold' => 70],
        ['id' => 'neighborhood-champion', 'name' => 'Neighborhood Champion', 'threshold' => 80],
        ['id' => 'civic-advocate', 'name' => 'Civic Advocate', 'threshold' => 90],
        ['id' => 'civic-leader', 'name' => 'Civic Leader', 'threshold' => 100],
    ];

    public function badgesFor(int $xp): array
    {
        return array_values(array_filter(
            self::BADGES,
            fn (array $badge): bool => $xp >= $badge['threshold'],
        ));
    }

    public function awardBadges(string $userId, int $xp): void
    {
        foreach ($this->badgesFor($xp) as $badge) {
            DB::table('resident_badges')->insertOrIgnore([
                'id' => (string) Str::uuid(),
                'user_id' => $userId,
                'badge_key' => $badge['id'],
                'name' => $badge['name'],
                'threshold' => $badge['threshold'],
                'earned_xp' => $xp,
                'earned_at' => now(),
            ]);
        }
    }
}