<?php

namespace App\Support;

class DemoConcerns
{
    private const SESSION_KEY = 'demo_concerns';

    /** @return list<array<string, mixed>> */
    public static function seed(): array
    {
        return [
            [
                'id' => 'c1',
                'title' => 'Clogged drainage on Mabini Street',
                'category' => 'Infrastructure · Drainage',
                'severity' => 'high',
                'status' => 'active',
                'vote_count' => 12,
                'location_label' => 'Mabini St. corner Rizal Ave.',
                'created_at' => '2 days ago',
                'user_vote' => null,
            ],
            [
                'id' => 'c2',
                'title' => 'Street light not working',
                'category' => 'Infrastructure · Street lights',
                'severity' => 'medium',
                'status' => 'under_review',
                'vote_count' => 5,
                'location_label' => 'Block 3, Phase 2',
                'created_at' => '5 days ago',
                'user_vote' => 'up',
            ],
            [
                'id' => 'c3',
                'title' => 'Uncollected garbage near market',
                'category' => 'Sanitation · Waste collection',
                'severity' => 'low',
                'status' => 'resolved',
                'vote_count' => 8,
                'location_label' => 'Public market rear entrance',
                'created_at' => '1 week ago',
                'user_vote' => null,
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function all(): array
    {
        if (! session()->has(self::SESSION_KEY)) {
            session([self::SESSION_KEY => self::seed()]);
        }

        return session(self::SESSION_KEY);
    }

    /** @return array<string, mixed>|null */
    public static function find(string $id): ?array
    {
        foreach (self::all() as $concern) {
            if ($concern['id'] === $id) {
                return $concern;
            }
        }

        return null;
    }

    public static function vote(string $id, string $direction): void
    {
        $concerns = self::all();
        $value = $direction === 'up' ? 1 : -1;

        foreach ($concerns as $index => $concern) {
            if ($concern['id'] !== $id) {
                continue;
            }

            $current = match ($concern['user_vote'] ?? null) {
                'up' => 1,
                'down' => -1,
                default => 0,
            };

            if ($current === $value) {
                $concerns[$index]['vote_count'] -= $value;
                $concerns[$index]['user_vote'] = null;
            } else {
                $concerns[$index]['vote_count'] += $value - $current;
                $concerns[$index]['user_vote'] = $direction === 'up' ? 'up' : 'down';
            }

            session([self::SESSION_KEY => $concerns]);

            return;
        }
    }

    /** @return array<string, mixed> */
    public static function detail(string $id): array
    {
        $concern = self::find($id) ?? self::seed()[0];

        return array_merge($concern, [
            'description' => 'Water accumulates after rain and blocks the sidewalk. Residents have difficulty passing, especially seniors and children.',
            'timeline' => [
                ['key' => 'submitted', 'label' => 'Submitted', 'at' => 'Jun 15, 10:30 AM', 'state' => 'done'],
                ['key' => 'ai', 'label' => 'AI processed', 'description' => 'Category & severity suggested', 'at' => 'Jun 15, 10:31 AM', 'state' => 'done'],
                ['key' => 'review', 'label' => 'Under review', 'description' => 'Staff reviewing report', 'at' => 'Jun 15, 2:00 PM', 'state' => 'done'],
                ['key' => 'active', 'label' => 'Being addressed', 'description' => 'Mission assigned to personnel', 'state' => 'current'],
                ['key' => 'resolved', 'label' => 'Resolved', 'state' => 'upcoming'],
            ],
        ]);
    }
}
