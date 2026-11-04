<?php

namespace Tests\Feature;

use App\Enums\PersonnelShift;
use App\Services\Missions\MissionLifecycleService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class PersonnelAssignmentShiftEligibilityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('users', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('barangay_id', 36);
            $table->string('role');
            $table->boolean('is_active')->default(true);
        });
        Schema::create('personnel', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            $table->string('role')->nullable();
            $table->string('department')->nullable();
            $table->string('shift')->nullable();
            $table->boolean('is_active')->default(true);
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('personnel');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_active_personnel_can_be_assigned_even_when_their_tanod_shift_is_not_current(): void
    {
        $barangayId = (string) Str::uuid();
        $userId = (string) Str::uuid();
        $personnelId = (string) Str::uuid();

        DB::table('users')->insert([
            'id' => $userId,
            'barangay_id' => $barangayId,
            'role' => 'personnel',
            'is_active' => true,
        ]);
        DB::table('personnel')->insert([
            'id' => $personnelId,
            'user_id' => $userId,
            'role' => 'tanod',
            'department' => 'Peace & Order',
            'shift' => PersonnelShift::current()->next()->value,
            'is_active' => true,
        ]);

        $this->assertTrue(
            app(MissionLifecycleService::class)->areActivePersonnelInBarangay([$personnelId], $barangayId)
        );
    }
}
