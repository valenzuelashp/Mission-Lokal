<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureBarangayIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\Support\ConcernSchema;
use Tests\TestCase;

class PersonnelMissionMapTest extends TestCase
{
    private User $personnelUser;

    private string $missionId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([HandleInertiaRequests::class, EnsureBarangayIsActive::class]);

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->string('role');
            $table->string('first_name');
            $table->string('last_name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('personnel', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('role');
            $table->string('department');
            $table->string('shift')->nullable();
            $table->boolean('is_active')->default(true);
        });
        Schema::create('concerns', function (Blueprint $table) {
            ConcernSchema::classification($table, true);
            $table->uuid('id')->primary();
            $table->uuid('subcategory_id')->nullable();
            $table->unsignedSmallInteger('category_id')->default(1);
            $table->string('title');
            $table->text('description');
            $table->text('location');
            $table->string('address_text');
            $table->string('visibility')->default('public');
            $table->string('severity')->default('medium');
        });
        Schema::create('concern_categories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->string('code');
        });
        DB::table('concern_categories')->insert(['id' => 1, 'code' => 'NOISE']);
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code');
        });
        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->unsignedInteger('content_revision')->default(1);
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->uuid('suggested_subcategory_id')->nullable();
            $table->boolean('is_current')->default(true);
        });
        Schema::create('concern_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
        });
        Schema::create('missions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->uuid('concern_id');
            $table->string('department');
            $table->string('status')->default('assigned');
            $table->timestamps();
        });
        Schema::create('mission_personnel', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
            $table->uuid('personnel_id');
            $table->uuid('assigned_by')->nullable();
            $table->string('status')->default('assigned');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('sms_sent_at')->nullable();
            $table->timestamps();
        });
        Schema::create('mission_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
            $table->uuid('personnel_id');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('unassigned_at')->nullable();
        });
        Schema::create('mission_proof', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
        });
        Schema::create('mission_checklist_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
        });

        // Match the spatial database's POINT(longitude latitude) coordinate order.
        $pdo = DB::connection()->getPdo();
        $pdo->sqliteCreateFunction('ST_X', fn (string $point) => sscanf($point, 'POINT(%f %f)')[0]);
        $pdo->sqliteCreateFunction('ST_Y', fn (string $point) => sscanf($point, 'POINT(%f %f)')[1]);

        $barangayId = (string) Str::uuid();
        $userId = (string) Str::uuid();
        $concernId = (string) Str::uuid();
        $this->missionId = (string) Str::uuid();

        DB::table('users')->insert([
            'id' => $userId,
            'barangay_id' => $barangayId,
            'role' => 'personnel',
            'first_name' => 'Map',
            'last_name' => 'Tester',
        ]);
        DB::table('personnel')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'role' => 'tanod',
            'department' => 'Peace & Order',
        ]);
        DB::table('concerns')->insert([
            'id' => $concernId,
            'title' => 'Street light needs repair',
            'description' => 'The street light at the pinned location is out.',
            'location' => 'POINT(120.993381 14.517308)',
            'address_text' => 'Barangay Tambo',
        ]);
        DB::table('missions')->insert([
            'id' => $this->missionId,
            'barangay_id' => $barangayId,
            'concern_id' => $concernId,
            'department' => 'Peace & Order',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->personnelUser = User::findOrFail($userId);
    }

    protected function tearDown(): void
    {
        foreach ([
            'mission_checklist_items', 'mission_proof', 'mission_assignments',
            'mission_personnel', 'missions', 'concern_media', 'concern_ai_analysis',
            'concern_subcategories', 'concerns', 'personnel', 'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_department_queue_returns_the_reports_latitude_and_longitude_in_map_order(): void
    {
        $this->actingAs($this->personnelUser)
            ->get('/personnel/missions', ['X-Inertia' => 'true'])
            ->assertOk()
            ->assertJsonPath('props.missions.0.id', $this->missionId)
            ->assertJsonPath('props.missions.0.lat', 14.517308)
            ->assertJsonPath('props.missions.0.lng', 120.993381);
    }

    public function test_report_details_return_the_reports_latitude_and_longitude_in_map_order(): void
    {
        $this->actingAs($this->personnelUser)
            ->get("/personnel/missions/{$this->missionId}", ['X-Inertia' => 'true'])
            ->assertOk()
            ->assertJsonPath('props.mission.id', $this->missionId)
            ->assertJsonPath('props.mission.lat', 14.517308)
            ->assertJsonPath('props.mission.lng', 120.993381);
    }
}
