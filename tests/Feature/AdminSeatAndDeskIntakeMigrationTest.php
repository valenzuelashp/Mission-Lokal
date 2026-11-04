<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminSeatAndDeskIntakeMigrationTest extends TestCase
{
    protected function tearDown(): void
    {
        Schema::dropIfExists('concerns');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_full_access_admins_are_backfilled_as_general_admins_without_changing_view_only_users(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role');
            $table->boolean('is_view_only')->default(false);
        });

        $generalAdminId = (string) Str::uuid();
        $viewOnlyAdminId = (string) Str::uuid();
        DB::table('users')->insert([
            ['id' => $generalAdminId, 'role' => 'admin', 'is_view_only' => false],
            ['id' => $viewOnlyAdminId, 'role' => 'admin', 'is_view_only' => true],
        ]);

        $migration = require database_path('migrations/2026_11_05_000001_add_admin_types_to_users_table.php');
        $migration->up();

        $this->assertDatabaseHas('users', ['id' => $generalAdminId, 'admin_type' => 'general', 'is_view_only' => false]);
        $this->assertDatabaseHas('users', ['id' => $viewOnlyAdminId, 'admin_type' => null, 'is_view_only' => true]);
    }

    public function test_desk_concerns_can_be_saved_without_a_resident_account_and_keep_an_admin_audit_actor(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
        });
        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('reporter_id');
            $table->foreign('reporter_id', 'concerns_reporter_id_foreign')->references('id')->on('users')->restrictOnDelete();
        });

        $adminId = (string) Str::uuid();
        $concernId = (string) Str::uuid();
        DB::table('users')->insert(['id' => $adminId]);

        $migration = require database_path('migrations/2026_11_05_000002_add_desk_intake_to_concerns_table.php');
        $migration->up();

        DB::table('concerns')->insert([
            'id' => $concernId,
            'reporter_id' => null,
            'intake_logged_by' => $adminId,
            'intake_channel' => 'phone',
            'intake_reporter_name' => 'Caller Name',
            'intake_reporter_phone' => '09170000000',
        ]);

        $this->assertDatabaseHas('concerns', [
            'id' => $concernId,
            'reporter_id' => null,
            'intake_logged_by' => $adminId,
            'intake_channel' => 'phone',
            'intake_reporter_name' => 'Caller Name',
            'intake_reporter_phone' => '09170000000',
        ]);
    }

    public function test_rollback_is_blocked_while_accountless_desk_concerns_exist(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
        });
        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('reporter_id');
            $table->foreign('reporter_id', 'concerns_reporter_id_foreign')->references('id')->on('users')->restrictOnDelete();
        });

        $migration = require database_path('migrations/2026_11_05_000002_add_desk_intake_to_concerns_table.php');
        $migration->up();
        DB::table('concerns')->insert(['id' => (string) Str::uuid(), 'reporter_id' => null]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Cannot roll back desk intake while accountless concerns exist.');
        $migration->down();
    }
}