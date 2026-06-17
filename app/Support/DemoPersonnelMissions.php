<?php

namespace App\Support;

class DemoPersonnelMissions
{
    private const SESSION_KEY = 'demo_personnel_missions';

    /** @return list<array<string, mixed>> */
    public static function seed(string $accountId): array
    {
        if ($accountId !== 'PER001') {
            return [];
        }

        return [
            [
                'id' => 'MS-8902',
                'concern_id' => 'c1',
                'title' => 'Clogged drainage on Mabini St.',
                'location' => 'Mabini St. corner Rizal Ave.',
                'lat' => 14.6012,
                'lng' => 120.9821,
                'priority' => 'high',
                'status' => 'in_progress',
                'due_date' => 'Jun 18, 5:00 PM',
                'is_overdue' => false,
                'visibility' => 'public',
                'brief' => 'Clear debris from the drainage grate and verify water flow after rain. Coordinate with barangay maintenance if structural repair is needed.',
                'checklist' => [
                    ['id' => 'ck1', 'label' => 'Inspect drainage inlet and note blockages', 'done' => true],
                    ['id' => 'ck2', 'label' => 'Remove visible debris and waste', 'done' => true],
                    ['id' => 'ck3', 'label' => 'Test water flow with hose or wait for rain', 'done' => false],
                    ['id' => 'ck4', 'label' => 'Photo-document before and after', 'done' => false],
                ],
                'reporter_name' => 'Juan Dela Cruz',
                'reporter_phone' => '09191234567',
                'assigned_at' => 'Jun 17, 8:00 AM',
                'proof_submitted' => false,
            ],
            [
                'id' => 'MS-8888',
                'concern_id' => 'c4',
                'title' => 'Illegal dumping cleanup',
                'location' => 'Market rear alley',
                'lat' => 14.5988,
                'lng' => 120.9865,
                'priority' => 'med',
                'status' => 'assigned',
                'due_date' => 'Jun 19, 3:00 PM',
                'is_overdue' => false,
                'visibility' => 'public',
                'brief' => 'Collect dumped waste from the alley, coordinate disposal with sanitation team, and post a warning notice if evidence of repeat dumping is found.',
                'checklist' => [
                    ['id' => 'ck1', 'label' => 'Photograph dump site', 'done' => false],
                    ['id' => 'ck2', 'label' => 'Bag and remove waste', 'done' => false],
                    ['id' => 'ck3', 'label' => 'Sanitation handoff logged', 'done' => false],
                ],
                'reporter_name' => 'Ana Lopez',
                'reporter_phone' => '09178881234',
                'assigned_at' => 'Jun 17, 2:30 PM',
                'proof_submitted' => false,
            ],
            [
                'id' => 'MS-8880',
                'concern_id' => 'c6',
                'title' => 'VAWC case — welfare check',
                'location' => 'Withheld — private case',
                'lat' => 14.6001,
                'lng' => 120.9840,
                'priority' => 'high',
                'status' => 'acknowledged',
                'due_date' => 'Jun 17, 11:59 PM',
                'is_overdue' => true,
                'visibility' => 'private',
                'brief' => 'Conduct a discreet welfare check per barangay captain directive. Do not discuss case details on the public feed. Coordinate only through admin channel.',
                'checklist' => [
                    ['id' => 'ck1', 'label' => 'Review case brief with admin', 'done' => true],
                    ['id' => 'ck2', 'label' => 'Visit location with partner unit', 'done' => false],
                    ['id' => 'ck3', 'label' => 'Submit confidential field report', 'done' => false],
                ],
                'reporter_name' => 'Withheld',
                'reporter_phone' => null,
                'assigned_at' => 'Jun 17, 9:15 AM',
                'proof_submitted' => false,
            ],
            [
                'id' => 'MS-8870',
                'concern_id' => 'c5',
                'title' => 'Street light repair',
                'location' => 'Block 3, Phase 2',
                'lat' => 14.6035,
                'lng' => 120.9798,
                'priority' => 'low',
                'status' => 'completed',
                'due_date' => 'Jun 16, 5:00 PM',
                'is_overdue' => false,
                'visibility' => 'public',
                'brief' => 'Replace bulb and verify electrical connection at pole #B3-12.',
                'checklist' => [
                    ['id' => 'ck1', 'label' => 'Inspect pole and wiring', 'done' => true],
                    ['id' => 'ck2', 'label' => 'Replace bulb / fixture', 'done' => true],
                    ['id' => 'ck3', 'label' => 'Night verification photo', 'done' => true],
                ],
                'reporter_name' => 'Pedro Reyes',
                'reporter_phone' => '09175559876',
                'assigned_at' => 'Jun 15, 10:00 AM',
                'proof_submitted' => true,
            ],
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function all(string $accountId): array
    {
        $key = self::SESSION_KEY.'_'.$accountId;

        if (! session()->has($key)) {
            session([$key => self::seed($accountId)]);
        }

        return session($key);
    }

    /** @return array<string, mixed>|null */
    public static function find(string $accountId, string $id): ?array
    {
        foreach (self::all($accountId) as $mission) {
            if ($mission['id'] === $id) {
                return $mission;
            }
        }

        return null;
    }

    public static function updateStatus(string $accountId, string $id, string $status): bool
    {
        $missions = self::all($accountId);

        foreach ($missions as $index => $mission) {
            if ($mission['id'] !== $id) {
                continue;
            }

            $missions[$index]['status'] = $status;
            session([self::SESSION_KEY.'_'.$accountId => $missions]);

            return true;
        }

        return false;
    }

    public static function toggleChecklist(string $accountId, string $missionId, string $itemId): bool
    {
        $missions = self::all($accountId);

        foreach ($missions as $mi => $mission) {
            if ($mission['id'] !== $missionId) {
                continue;
            }

            foreach ($mission['checklist'] as $ci => $item) {
                if ($item['id'] !== $itemId) {
                    continue;
                }

                $missions[$mi]['checklist'][$ci]['done'] = ! $item['done'];
                session([self::SESSION_KEY.'_'.$accountId => $missions]);

                return true;
            }
        }

        return false;
    }

    public static function markProofSubmitted(string $accountId, string $id): bool
    {
        $missions = self::all($accountId);

        foreach ($missions as $index => $mission) {
            if ($mission['id'] !== $id) {
                continue;
            }

            $missions[$index]['proof_submitted'] = true;
            $missions[$index]['status'] = 'completed';
            session([self::SESSION_KEY.'_'.$accountId => $missions]);

            return true;
        }

        return false;
    }

    /** @return array<string, int> */
    public static function counts(string $accountId): array
    {
        $missions = self::all($accountId);

        return [
            'all' => count($missions),
            'active' => count(array_filter($missions, fn ($m) => in_array($m['status'], ['assigned', 'acknowledged', 'in_progress'], true))),
            'assigned' => count(array_filter($missions, fn ($m) => $m['status'] === 'assigned')),
            'acknowledged' => count(array_filter($missions, fn ($m) => $m['status'] === 'acknowledged')),
            'in_progress' => count(array_filter($missions, fn ($m) => $m['status'] === 'in_progress')),
            'completed' => count(array_filter($missions, fn ($m) => in_array($m['status'], ['completed', 'verified'], true))),
            'overdue' => count(array_filter($missions, fn ($m) => ($m['is_overdue'] ?? false) && ! in_array($m['status'], ['completed', 'verified', 'cancelled'], true))),
        ];
    }
}
