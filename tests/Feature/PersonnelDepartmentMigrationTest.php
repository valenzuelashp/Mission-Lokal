<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PersonnelDepartmentMigrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('personnel', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('category', 50)->nullable();
        });
        Schema::create('missions', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('concern_id', 36);
        });
        Schema::create('mission_personnel', function (Blueprint $table) {
            $table->char('mission_id', 36);
            $table->char('personnel_id', 36);
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('mission_personnel');
        Schema::dropIfExists('missions');
        Schema::dropIfExists('personnel');

        parent::tearDown();
    }

    public function test_it_backfills_personnel_and_mission_departments(): void
    {
        DB::table('personnel')->insert([
            'id' => 'staff-peace',
            'category' => 'tanod',
        ]);
        DB::table('missions')->insert([
            'id' => 'mission-peace',
            'concern_id' => 'concern-1',
        ]);
        DB::table('mission_personnel')->insert([
            'mission_id' => 'mission-peace',
            'personnel_id' => 'staff-peace',
        ]);

        $migration = require database_path('migrations/2026_10_31_000000_add_departments_to_personnel_and_missions.php');
        $migration->up();

        $this->assertDatabaseHas('personnel', [
            'id' => 'staff-peace',
            'department' => 'peace_order',
        ]);
        $this->assertDatabaseHas('missions', [
            'id' => 'mission-peace',
            'department' => 'peace_order',
        ]);
    }
}
