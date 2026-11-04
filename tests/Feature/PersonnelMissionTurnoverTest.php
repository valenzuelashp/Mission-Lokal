<?php

namespace Tests\Feature;

use App\Models\User;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\EnsureBarangayIsActive;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class PersonnelMissionTurnoverTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('users', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('barangay_id', 36);
            $table->string('role');
            $table->string('first_name');
            $table->string('last_name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('personnel', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            $table->string('role')->nullable();
            $table->string('department')->nullable();
            $table->string('shift')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('missions', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('barangay_id', 36);
            $table->char('concern_id', 36);
            $table->string('department')->nullable();
            $table->string('status');
            $table->timestamps();
        });
        Schema::create('concerns', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('barangay_id', 36);
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_blotter_candidate')->default(false);
            $table->char('subcategory_id', 36)->nullable();
            $table->timestamps();
        });
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('code')->nullable();
        });
        Schema::create('mission_personnel', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('mission_id', 36);
            $table->char('personnel_id', 36);
            $table->char('assigned_by', 36);
            $table->string('status');
            $table->dateTime('acknowledged_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('sms_sent_at')->nullable();
            $table->timestamps();
            $table->unique(['mission_id', 'personnel_id']);
        });
        Schema::create('mission_assignments', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('mission_id', 36);
            $table->char('personnel_id', 36)->nullable();
            $table->char('assigned_by', 36)->nullable();
            $table->dateTime('assigned_at');
            $table->dateTime('unassigned_at')->nullable();
            $table->dateTime('sms_sent_at')->nullable();
        });
        Schema::create('mission_status_history', function (Blueprint $table) {
            $table->char('mission_id', 36);
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->char('actor_id', 36)->nullable();
            $table->text('note')->nullable();
            $table->dateTime('created_at')->nullable();
        });
        Schema::create('notifications', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            $table->string('channel');
            $table->string('event_type');
            $table->string('title')->nullable();
            $table->text('body');
            $table->json('payload')->nullable();
            $table->boolean('is_read')->default(false);
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('read_at')->nullable();
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        foreach ([
            'notifications',
            'mission_status_history',
            'mission_assignments',
            'mission_personnel',
            'concern_subcategories',
            'concerns',
            'missions',
            'personnel',
            'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_tanod_can_turn_over_a_mission_to_the_next_shift_and_both_are_notified(): void
    {
        Bus::fake();
        $this->withoutMiddleware([HandleInertiaRequests::class, EnsureBarangayIsActive::class]);

        $barangayId = (string) Str::uuid();
        $currentUser = $this->createUser($barangayId, 'Current', 'Tanod');
        $nextUser = $this->createUser($barangayId, 'Next', 'Tanod');
        $currentPersonnelId = $this->createPersonnel($currentUser->id, 'morning');
        $nextPersonnelId = $this->createPersonnel($nextUser->id, 'evening');
        $missionId = (string) Str::uuid();
        $concernId = (string) Str::uuid();

        DB::table('concerns')->insert([
            'id' => $concernId,
            'barangay_id' => $barangayId,
            'title' => 'Street light repair',
            'description' => 'A street light is not working.',
            'is_blotter_candidate' => false,
        ]);
        DB::table('missions')->insert([
            'id' => $missionId,
            'barangay_id' => $barangayId,
            'concern_id' => $concernId,
            'department' => 'Peace & Order',
            'status' => 'in_progress',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('mission_personnel')->insert([
            'id' => (string) Str::uuid(),
            'mission_id' => $missionId,
            'personnel_id' => $currentPersonnelId,
            'assigned_by' => $currentUser->id,
            'status' => 'in_progress',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('mission_assignments')->insert([
            'id' => (string) Str::uuid(),
            'mission_id' => $missionId,
            'personnel_id' => $currentUser->id,
            'assigned_by' => $currentUser->id,
            'assigned_at' => now(),
        ]);

        $this->actingAs($currentUser)
            ->from("/personnel/missions/{$missionId}")
            ->post("/personnel/missions/{$missionId}/turnover", ['personnel_id' => $nextPersonnelId])
            ->assertRedirect("/personnel/missions/{$missionId}")
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('mission_personnel', [
            'mission_id' => $missionId,
            'personnel_id' => $currentPersonnelId,
        ]);
        $this->assertDatabaseHas('mission_personnel', [
            'mission_id' => $missionId,
            'personnel_id' => $nextPersonnelId,
            'status' => 'assigned',
        ]);
        $this->assertNotNull(DB::table('mission_assignments')
            ->where('mission_id', $missionId)
            ->where('personnel_id', $currentUser->id)
            ->value('unassigned_at'));
        $this->assertDatabaseHas('mission_assignments', [
            'mission_id' => $missionId,
            'personnel_id' => $nextUser->id,
            'unassigned_at' => null,
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $currentUser->id,
            'event_type' => 'mission_turned_over',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $nextUser->id,
            'event_type' => 'mission_turnover_assigned',
        ]);
    }

    private function createUser(string $barangayId, string $firstName, string $lastName): User
    {
        $id = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $id,
            'barangay_id' => $barangayId,
            'role' => 'personnel',
            'first_name' => $firstName,
            'last_name' => $lastName,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return User::findOrFail($id);
    }

    private function createPersonnel(string $userId, string $shift): string
    {
        $id = (string) Str::uuid();
        DB::table('personnel')->insert([
            'id' => $id,
            'user_id' => $userId,
            'role' => 'tanod',
            'department' => 'Peace & Order',
            'shift' => $shift,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }
}
