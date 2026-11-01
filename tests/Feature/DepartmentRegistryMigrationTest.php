<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DepartmentRegistryMigrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('barangays', function (Blueprint $table) {
            $table->uuid('id')->primary();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('departments');
        Schema::dropIfExists('barangays');

        parent::tearDown();
    }

    public function test_it_persists_departments_per_barangay(): void
    {
        DB::table('barangays')->insert(['id' => '00000000-0000-4000-8000-000000000001']);

        $migration = require database_path('migrations/2026_10_31_000002_create_departments_table.php');
        $migration->up();

        DB::table('departments')->insert([
            'id' => '00000000-0000-4000-8000-000000000002',
            'barangay_id' => '00000000-0000-4000-8000-000000000001',
            'name' => 'Disaster Risk Reduction',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertDatabaseHas('departments', [
            'barangay_id' => '00000000-0000-4000-8000-000000000001',
            'name' => 'Disaster Risk Reduction',
        ]);
    }
}
