<?php

namespace App\Services\Missions;

use App\Models\CategoryPlaybook;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\MissionAssignment;
use App\Models\MissionChecklistItem;
use App\Models\Personnel;
use App\Services\Concerns\ConcernResponsePlan;
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
        $concern->setRelation('currentAiAnalysis', $analysis);
        $responsePlans = app(ConcernResponsePlan::class);
        $snapshot = $analysis?->raw_model_output['response_plan'] ?? null;
        $playbook = null;

        if ($concern->isVawcConcern()) {
            $steps = $responsePlans->safeguardingSteps();
        } elseif (is_array($snapshot) && in_array($snapshot['source'] ?? null, ['playbook', 'gemini', 'local_rules', 'safeguarding'], true)) {
            // Use the same saved steps staff reviewed, even if the playbook has
            // since been edited or retired. The analysis is the plan snapshot.
            $steps = $responsePlans->normalizeSteps($analysis->prescriptive_steps);
            if (($snapshot['source'] ?? null) === 'playbook' && is_string($snapshot['playbook_id'] ?? null)) {
                $playbook = CategoryPlaybook::query()->whereKey($snapshot['playbook_id'])
                    ->where('subcategory_id', $analysis->suggested_subcategory_id)->first();
            }
        } else {
            // Older analyses do not have a saved plan source.
            $playbook = $mission->playbook_id ? CategoryPlaybook::find($mission->playbook_id) : null;
            $plan = $playbook ? null : $responsePlans->forSubcategory($analysis?->suggested_subcategory_id ?? $concern->subcategory_id);
            $steps = $responsePlans->normalizeSteps($playbook?->steps_template ?? $plan['prescriptive_steps'] ?? $analysis?->prescriptive_steps);
            if ($plan !== null) {
                $playbook = CategoryPlaybook::find($plan['response_plan']['playbook_id']);
            }
        }

        if ($playbook && $mission->playbook_id !== $playbook->id) {
            $mission->update(['playbook_id' => $playbook->id]);
        }
        $steps = $steps !== [] ? $steps : $responsePlans->defaultSteps();

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
