<?php

use App\Enums\ConcernCategoryCode;
use App\Enums\PersonnelDepartment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Retain assignment/proof history while moving active work into the final category's queue.
        DB::table('missions')->join('concerns', 'concerns.id', '=', 'missions.concern_id')
            ->join('concern_categories', 'concern_categories.id', '=', 'concerns.category_id')
            ->whereIn('missions.status', ['assigned', 'acknowledged', 'in_progress', 'completed'])
            ->select(['missions.id', 'missions.department', 'concerns.id as concern_id', 'concerns.status as concern_status', 'concerns.scope_status', 'concerns.category_realignment_reason', 'concern_categories.code'])
            ->orderBy('missions.id')->chunk(200, function ($missions) {
                foreach ($missions as $mission) {
                    $definition = ConcernCategoryCode::tryFrom($mission->code);
                    if (! $definition || $mission->scope_status === 'out_of_scope') {
                        continue;
                    }
                    $department = $definition->department()?->label() ?? 'Admin Triage';
                    if (in_array($mission->concern_status, ['active', 'resolved'], true) && $mission->scope_status !== 'in_scope') {
                        DB::table('concerns')->where('id', $mission->concern_id)->update([
                            'scope_status' => 'in_scope', 'scope_reason' => 'The existing staff approval was retained during category migration.',
                            'routed_department' => $definition->department()?->value ?? 'admin_triage', 'routed_roles' => json_encode($definition->roles()),
                        ]);
                    }
                    $aliases = [$department, $definition->department()?->value];
                    if ($definition->department() === PersonnelDepartment::UtilityInfrastructure) {
                        $aliases[] = 'Utility and Infrastructure';
                    }
                    if ($definition->department() === PersonnelDepartment::TamboAnimalResponse) {
                        $aliases[] = 'Tambo Animal Response Team';
                    }
                    if (in_array($mission->department, $aliases, true)) {
                        continue;
                    }
                    DB::transaction(function () use ($mission, $department) {
                        DB::table('missions')->where('id', $mission->id)->update(['department' => $department]);
                        $note = 'Department routing was updated from '.$mission->department.' to '.$department.'. Admin must review existing assignees for the eligible roles; assignment and proof history are retained.';
                        DB::table('concerns')->where('id', $mission->concern_id)->update([
                            'category_realignment_reason' => trim(($mission->category_realignment_reason ?? '').' '.$note),
                        ]);
                    });
                }
            });
    }

    public function down(): void
    {
        // Do not return active work to an obsolete department or alter assignment history.
    }
};
