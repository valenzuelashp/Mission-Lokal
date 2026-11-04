<?php

namespace Tests\Feature;

use App\Enums\PersonnelShift;
use App\Models\Concern;
use App\Models\ConcernSubcategory;
use App\Services\Missions\MissionDepartmentAssignment;
use App\Services\Missions\MissionLifecycleService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
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

    public function test_private_noise_report_can_be_assigned_to_a_tanod(): void
    {
        $personnelId = (string) Str::uuid();
        DB::table('personnel')->insert([
            'id' => $personnelId,
            'user_id' => (string) Str::uuid(),
            'role' => 'tanod',
            'department' => 'Peace & Order',
            'shift' => PersonnelShift::current()->next()->value,
            'is_active' => true,
        ]);

        $concern = new Concern([
            'title' => 'Excessive late-night videoke noise past curfew',
            'description' => 'Loud singing and bass amplifiers operating continuously past 1:00 AM.',
            'is_blotter_candidate' => true,
        ]);
        $concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'NOISE']));

        $this->assertSame(
            'Peace & Order',
            app(MissionDepartmentAssignment::class)->departmentFor($concern, [$personnelId])
        );
    }

    public function test_vawc_report_cannot_be_assigned_to_a_tanod(): void
    {
        $personnelId = (string) Str::uuid();
        DB::table('personnel')->insert([
            'id' => $personnelId,
            'user_id' => (string) Str::uuid(),
            'role' => 'tanod',
            'department' => 'Peace & Order',
            'shift' => null,
            'is_active' => true,
        ]);

        $concern = new Concern(['title' => 'Confidential report']);
        $concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'VAWC']));

        $this->expectException(ValidationException::class);
        app(MissionDepartmentAssignment::class)->departmentFor($concern, [$personnelId]);
    }
}
