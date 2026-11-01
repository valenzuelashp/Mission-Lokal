<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personnel', function (Blueprint $table) {
            $table->string('department', 50)->nullable()->after('category')->index();
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->string('department', 50)->nullable()->after('concern_id')->index();
        });

        $departmentByCategory = [
            'tanod' => 'peace_order',
            'lupon' => 'peace_order',
            'vaw_desk' => 'peace_order',
            'public_works' => 'utility_infrastructure',
            'sanitation' => 'environmental',
            'traffic_control' => 'traffic_management',
            'animal_response' => 'tambo_animal_response',
            'maintenance' => 'maintenance',
        ];

        foreach ($departmentByCategory as $category => $department) {
            DB::table('personnel')
                ->where('category', $category)
                ->whereNull('department')
                ->update(['department' => $department]);
        }

        $missionDepartments = DB::table('mission_personnel')
            ->join('personnel', 'personnel.id', '=', 'mission_personnel.personnel_id')
            ->whereNotNull('personnel.department')
            ->select('mission_personnel.mission_id', 'personnel.department')
            ->orderBy('mission_personnel.mission_id')
            ->orderBy('mission_personnel.personnel_id')
            ->get()
            ->unique('mission_id');

        foreach ($missionDepartments as $assignment) {
            DB::table('missions')
                ->where('id', $assignment->mission_id)
                ->whereNull('department')
                ->update(['department' => $assignment->department]);
        }
    }

    public function down(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->dropIndex(['department']);
            $table->dropColumn('department');
        });

        Schema::table('personnel', function (Blueprint $table) {
            $table->dropIndex(['department']);
            $table->dropColumn('department');
        });
    }
};
