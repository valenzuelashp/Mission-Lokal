<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PersonnelShiftRestrictionMigrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('personnel', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('role')->nullable();
            $table->string('department')->nullable();
            $table->string('shift')->nullable();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('personnel');

        parent::tearDown();
    }

    public function test_it_clears_shifts_for_everyone_except_peace_and_order_tanods(): void
    {
        DB::table('personnel')->insert([
            ['id' => 'tanod', 'role' => 'tanod', 'department' => 'Peace & Order', 'shift' => 'morning'],
            ['id' => 'lupon', 'role' => 'lupon', 'department' => 'Peace & Order', 'shift' => 'evening'],
            ['id' => 'other-department', 'role' => 'tanod', 'department' => 'Traffic Management', 'shift' => 'overnight'],
        ]);

        $migration = require database_path('migrations/2026_11_04_000001_restrict_shifts_to_peace_and_order_tanods.php');
        $migration->up();

        $this->assertDatabaseHas('personnel', ['id' => 'tanod', 'shift' => 'morning']);
        $this->assertDatabaseHas('personnel', ['id' => 'lupon', 'shift' => null]);
        $this->assertDatabaseHas('personnel', ['id' => 'other-department', 'shift' => null]);
    }
}
