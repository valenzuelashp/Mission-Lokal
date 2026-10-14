<?php

namespace App\Services\Missions;

use App\Models\CategoryPlaybook;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\MissionAssignment;
use App\Models\MissionChecklistItem;
use App\Models\Personnel;
use Illuminate\Support\Facades\DB;

class MissionLifecycleService
{
    public function areActivePersonnelInBarangay(array $personnelIds, string $barangayId): bool
    {
        $personnelIds = array_values(array_unique($personnelIds));

        return $personnelIds !== []
            && Personnel::query()
                ->whereIn('id', $personnelIds)
                ->whereHas('user', function ($query) use ($barangayId) {
                    $query->where('barangay_id', $barangayId)
                        ->where('role', 'personnel')
                        ->where('is_active', true);
                })
                ->count() === count($personnelIds);
    }

    public function recordAssignmentChanges(
        Mission $mission,
        array $detachedPersonnelIds,
        string $actorId,
    ): void {
        $personnel = Personnel::whereIn('id', array_unique([
            ...$detachedPersonnelIds,
        ]))->get()->keyBy('id');

        foreach ($detachedPersonnelIds as $personnelId) {
            $userId = $personnel->get($personnelId)?->user_id;

            if ($userId) {
                MissionAssignment::where('mission_id', $mission->id)
                    ->where('personnel_id', $userId)
                    ->whereNull('unassigned_at')
                    ->update(['unassigned_at' => now()]);
            }
        }

        foreach ($mission->personnel()->with('user')->get() as $assignedPersonnel) {
            $userId = $assignedPersonnel->user_id;

            if ($userId && !MissionAssignment::where('mission_id', $mission->id)
                ->where('personnel_id', $userId)
                ->whereNull('unassigned_at')
                ->exists()) {
                MissionAssignment::create([
                    'mission_id' => $mission->id,
                    'personnel_id' => $userId,
                    'assigned_by' => $actorId,
                ]);
            }
        }
    }

    public function ensureChecklist(Mission $mission, Concern $concern): void
    {
        if ($mission->checklistItems()->exists()) {
            return;
        }

        $analysis = $concern->currentAiAnalysis()->first();
        $playbook = $mission->playbook_id
            ? CategoryPlaybook::find($mission->playbook_id)
            : CategoryPlaybook::query()
                ->where('subcategory_id', $analysis?->suggested_subcategory_id)
                ->where('is_active', true)
                ->first();

        if ($playbook && $mission->playbook_id !== $playbook->id) {
            $mission->update(['playbook_id' => $playbook->id]);
        }

        $steps = $playbook?->steps_template ?? $analysis?->prescriptive_steps ?? [];
        $steps = array_values(array_filter(array_map(function ($step) {
            if (is_string($step)) {
                return trim($step);
            }

            if (is_array($step)) {
                foreach (['task', 'step', 'title', 'instruction', 'action'] as $key) {
                    if (is_string($step[$key] ?? null) && trim($step[$key]) !== '') {
                        return trim($step[$key]);
                    }
                }
            }

            return null;
        }, is_array($steps) ? $steps : [])));

        if ($steps === []) {
            $steps = [
                'Inspect and verify the reported issue at the assigned location.',
                'Complete the appropriate corrective action and document the result.',
                'Upload geotagged photo evidence and resolution notes.',
            ];
        }

        foreach ($steps as $index => $description) {
            MissionChecklistItem::create([
                'mission_id' => $mission->id,
                'step_order' => $index + 1,
                'description' => $description,
            ]);
        }
    }

    public function recordStatusChange(Mission $mission, ?string $from, string $to, ?string $actorId, string $note): void
    {
        DB::table('mission_status_history')->insert([
            'mission_id' => $mission->id,
            'from_status' => $from,
            'to_status' => $to,
            'actor_id' => $actorId,
            'note' => $note,
            'created_at' => now(),
        ]);
    }
}