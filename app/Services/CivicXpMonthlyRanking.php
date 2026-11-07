<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CivicXpMonthlyRanking
{
    public function recordsForBarangay(string $barangayId, string $month): array
    {
        if ($month === now()->format('Y-m')) {
            return [
                'records' => $this->buildRecords($barangayId, $month, true),
                'source' => 'live',
                'has_activity' => $this->hasActivity($barangayId, $month),
            ];
        }

        $snapshots = DB::table('civic_xp_monthly_rankings')
            ->where('barangay_id', $barangayId)
            ->where('month', $month)
            ->orderBy('rank_position')
            ->get();

        if ($snapshots->isNotEmpty()) {
            return [
                'records' => $snapshots->map(function ($snapshot) {
                    $badges = is_string($snapshot->badges)
                        ? json_decode($snapshot->badges, true)
                        : $snapshot->badges;

                    return [
                        'id' => $snapshot->user_id,
                        'account_id' => $snapshot->account_id,
                        'name' => $snapshot->resident_name,
                        'civic_xp' => (int) $snapshot->civic_xp,
                        'rank' => (int) $snapshot->rank_position,
                        'badges' => is_array($badges) ? $badges : [],
                    ];
                })->all(),
                'source' => 'snapshot',
                'has_activity' => true,
            ];
        }

        $records = $this->buildRecords($barangayId, $month, false);
        $hasActivity = $this->hasActivity($barangayId, $month);
        $this->persist($barangayId, $month, $records);

        return [
            'records' => $records,
            'source' => 'reconstructed',
            'has_activity' => $hasActivity,
        ];
    }

    private function hasActivity(string $barangayId, string $month): bool
    {
        $start = Carbon::parse($month.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth()->endOfDay();

        return DB::table('civic_xp_events')
            ->where('barangay_id', $barangayId)
            ->whereBetween('created_at', [$start, $end])
            ->exists()
            || DB::table('resident_badges')
                ->join('users', 'resident_badges.user_id', '=', 'users.id')
                ->where('users.barangay_id', $barangayId)
                ->whereBetween('resident_badges.earned_at', [$start, $end])
                ->exists();
    }

    public function snapshotMonth(string $month): int
    {
        $storedCount = 0;

        foreach (DB::table('barangays')->pluck('id') as $barangayId) {
            $alreadySnapshotted = DB::table('civic_xp_monthly_rankings')
                ->where('barangay_id', $barangayId)
                ->where('month', $month)
                ->exists();

            if ($alreadySnapshotted) {
                continue;
            }

            $records = $this->buildRecords((string) $barangayId, $month, false);
            $this->persist((string) $barangayId, $month, $records);
            $storedCount += count($records);
        }

        return $storedCount;
    }

    private function buildRecords(string $barangayId, string $month, bool $currentMonth): array
    {
        $start = Carbon::parse($month.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth()->endOfDay();
        $monthlyPoints = DB::table('civic_xp_events')
            ->where('barangay_id', $barangayId)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('user_id, SUM(points) as points')
            ->groupBy('user_id')
            ->pluck('points', 'user_id');
        $badgeUserIds = DB::table('resident_badges')
            ->join('users', 'resident_badges.user_id', '=', 'users.id')
            ->where('users.barangay_id', $barangayId)
            ->whereBetween('resident_badges.earned_at', [$start, $end])
            ->pluck('resident_badges.user_id');
        $activityUserIds = $monthlyPoints->keys()
            ->merge($badgeUserIds)
            ->unique()
            ->values();

        if ($activityUserIds->isEmpty()) {
            return [];
        }

        $records = User::query()
            ->where('barangay_id', $barangayId)
            ->where('role', 'resident')
            ->whereIn('id', $activityUserIds)
            ->when($currentMonth, fn ($query) => $query->where('is_active', true))
            ->whereHas('residentProfile', fn ($query) => $query->where('verification_status', 'approved'))
            ->with('residentProfile.badges')
            ->get()
            ->map(function (User $user) use ($month, $currentMonth, $monthlyPoints, $start, $end) {
                $xp = $currentMonth
                    ? (int) ($user->residentProfile?->civic_xp ?? 50)
                    : min(100, max(0, 50 + (int) ($monthlyPoints[$user->id] ?? 0)));
                $badges = $user->residentProfile?->badges
                    ->filter(fn ($badge) => $badge->earned_at?->betweenIncluded($start, $end))
                    ->map(fn ($badge) => [
                        'id' => $badge->id,
                        'name' => $badge->name,
                        'threshold' => $badge->threshold,
                        'earned_xp' => $badge->earned_xp,
                    ])
                    ->values()
                    ->all() ?? [];

                return [
                    'id' => $user->id,
                    'account_id' => $user->account_id,
                    'name' => trim($user->first_name.' '.$user->last_name),
                    'civic_xp' => $xp,
                    'badges' => $badges,
                ];
            })
            ->all();

        usort($records, function (array $left, array $right): int {
            $scoreOrder = $right['civic_xp'] <=> $left['civic_xp'];

            return $scoreOrder !== 0 ? $scoreOrder : strcmp($left['account_id'], $right['account_id']);
        });

        foreach ($records as $index => &$record) {
            $record['rank'] = $index + 1;
        }
        unset($record);

        return $records;
    }

    private function persist(string $barangayId, string $month, array $records): void
    {
        if ($records === []) {
            return;
        }

        $rows = array_map(fn (array $record) => [
            'id' => (string) Str::uuid(),
            'barangay_id' => $barangayId,
            'user_id' => $record['id'],
            'month' => $month,
            'account_id' => $record['account_id'],
            'resident_name' => $record['name'],
            'civic_xp' => $record['civic_xp'],
            'rank_position' => $record['rank'],
            'badges' => json_encode($record['badges'], JSON_THROW_ON_ERROR),
            'snapshot_at' => now(),
        ], $records);

        DB::transaction(function () use ($rows) {
            foreach (array_chunk($rows, 200) as $chunk) {
                DB::table('civic_xp_monthly_rankings')->insertOrIgnore($chunk);
            }
        });
    }
}