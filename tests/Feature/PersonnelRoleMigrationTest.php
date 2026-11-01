<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PersonnelRoleMigrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('personnel', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('category', 50)->nullable();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('personnel');

        parent::tearDown();
    }

    public function test_it_renames_category_to_role_without_losing_saved_values(): void
    {
        DB::table('personnel')->insert([
            'id' => 'staff-maintenance',
            'category' => 'maintenance',
        ]);

        $migration = require database_path('migrations/2026_11_01_000000_rename_personnel_category_to_role.php');
        $migration->up();

        $this->assertTrue(Schema::hasColumn('personnel', 'role'));
        $this->assertFalse(Schema::hasColumn('personnel', 'category'));
        $this->assertDatabaseHas('personnel', [
            'id' => 'staff-maintenance',
            'role' => 'maintenance',
        ]);

        $migration->down();

        $this->assertTrue(Schema::hasColumn('personnel', 'category'));
        $this->assertFalse(Schema::hasColumn('personnel', 'role'));
        $this->assertDatabaseHas('personnel', [
            'id' => 'staff-maintenance',
            'category' => 'maintenance',
        ]);
    }
}
