<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureBarangayIsActive;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use App\Services\Missions\DepartmentMissionAccess;
use App\Services\Missions\MissionLifecycleService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Mockery;
use Tests\Support\ConcernSchema;
use Tests\TestCase;

class PersonnelMissionProofTest extends TestCase
{
    private User $personnelUser;

    private string $missionId;

    private string $personnelId;

    private string $proofStoragePath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware([EnsureBarangayIsActive::class, EnsureUserHasRole::class, HandleInertiaRequests::class]);
        $this->proofStoragePath = storage_path('framework/testing/disks/personnel-proof-'.Str::uuid());
        config(['filesystems.disks.local.root' => $this->proofStoragePath]);
        Storage::forgetDisk('local');

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id')->nullable();
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
            $table->timestamps();
        });
        Schema::create('concerns', function (Blueprint $table) {
            ConcernSchema::classification($table, true);
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->text('location')->nullable();
            $table->string('address_text')->nullable();
            $table->string('visibility')->default('public');
            $table->string('severity')->default('medium');
            $table->string('status')->default('under_review');
            $table->timestamps();
        });
        Schema::create('missions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id')->nullable();
            $table->uuid('concern_id');
            $table->string('department')->nullable();
            $table->string('status');
            $table->date('due_date')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();
        });
        Schema::create('mission_personnel', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
            $table->uuid('personnel_id');
            $table->uuid('assigned_by')->nullable();
            $table->string('status')->default('assigned');
            $table->dateTime('acknowledged_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('sms_sent_at')->nullable();
            $table->timestamps();
        });
        Schema::create('mission_checklist_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
            $table->unsignedSmallInteger('step_order');
            $table->text('description');
            $table->boolean('is_completed')->default(false);
        });
        Schema::create('mission_proof', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
            $table->uuid('submitted_by')->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('submitted_at', 3);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('location_accuracy_m', 8, 2)->nullable();
        });
        (require database_path('migrations/2026_11_26_000001_add_work_context_to_mission_proof.php'))->up();
        Schema::create('mission_proof_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('proof_id');
            $table->string('storage_key');
            $table->string('mime_type');
            $table->string('caption')->nullable();
            $table->dateTime('created_at')->nullable();
        });
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->string('channel');
            $table->string('event_type');
            $table->string('title');
            $table->text('body');
            $table->json('payload')->nullable();
            $table->boolean('is_read')->default(false);
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('read_at')->nullable();
            $table->timestamps();
        });

        $userId = (string) Str::uuid();
        $this->personnelId = (string) Str::uuid();
        $concernId = (string) Str::uuid();
        $this->missionId = (string) Str::uuid();
        $barangayId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $userId, 'barangay_id' => $barangayId, 'role' => 'personnel',
            'first_name' => 'Proof', 'last_name' => 'Tester', 'is_active' => true,
        ]);
        DB::table('personnel')->insert([
            'id' => $this->personnelId, 'user_id' => $userId, 'role' => 'staff',
            'department' => 'Maintenance',
        ]);
        DB::table('concerns')->insert([
            'id' => $concernId, 'title' => 'Street light repair',
            'description' => 'The street light was repaired by assigned personnel.',
            'address_text' => 'Main Road',
        ]);
        DB::table('missions')->insert([
            'id' => $this->missionId, 'barangay_id' => $barangayId, 'concern_id' => $concernId,
            'department' => 'Maintenance', 'status' => 'in_progress',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('mission_personnel')->insert([
            'id' => (string) Str::uuid(), 'mission_id' => $this->missionId,
            'personnel_id' => $this->personnelId, 'status' => 'in_progress',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('mission_checklist_items')->insert([
            'id' => (string) Str::uuid(), 'mission_id' => $this->missionId,
            'step_order' => 1, 'description' => 'Inspect and repair the reported issue.',
            'is_completed' => true,
        ]);

        $this->personnelUser = new User;
        $this->personnelUser->forceFill([
            'id' => $userId, 'barangay_id' => $barangayId, 'role' => 'personnel',
            'first_name' => 'Proof', 'last_name' => 'Tester',
        ]);
    }

    protected function tearDown(): void
    {
        if (is_dir($this->proofStoragePath)) {
            File::deleteDirectory($this->proofStoragePath);
        }

        foreach ([
            'notifications', 'mission_proof_media', 'mission_proof', 'mission_checklist_items',
            'mission_personnel', 'missions', 'concerns', 'personnel', 'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_portrait_proof_can_be_submitted_without_gps_and_retry_does_not_duplicate_it(): void
    {
        $access = Mockery::mock(DepartmentMissionAccess::class);
        $access->shouldReceive('assertCanView')->times(4);
        $this->app->instance(DepartmentMissionAccess::class, $access);

        $lifecycle = Mockery::mock(MissionLifecycleService::class);
        $lifecycle->shouldReceive('ensureChecklist')->twice();
        $lifecycle->shouldReceive('recordStatusChange')->once();
        $this->app->instance(MissionLifecycleService::class, $lifecycle);
        $submissionId = (string) Str::uuid();
        $payload = [
            'client_submission_id' => $submissionId,
            'notes' => 'Replaced the damaged street light and tested it.',
            'photos' => [$this->proofPhoto(480, 720), $this->proofPhoto(720, 480)],
            'work_location' => 'Main Road, Barangay Tambo',
            'work_location_source' => 'mission_location',
            'latitude' => null,
            'longitude' => null,
            'location_accuracy_m' => null,
        ];

        $this->actingAs($this->personnelUser)
            ->post(route('personnel.missions.proof.store', $this->missionId), $payload)
            ->assertRedirect(route('personnel.missions.index'));

        $this->assertDatabaseHas('mission_proof', [
            'mission_id' => $this->missionId,
            'client_submission_id' => $submissionId,
            'work_location_source' => 'mission_location',
            'work_location' => 'Main Road, Barangay Tambo',
            'latitude' => null,
            'longitude' => null,
        ]);
        $this->assertDatabaseHas('missions', ['id' => $this->missionId, 'status' => 'completed']);
        $this->assertDatabaseCount('mission_proof_media', 2);

        $this->actingAs($this->personnelUser)
            ->post(route('personnel.missions.proof.store', $this->missionId), ['client_submission_id' => $submissionId])
            ->assertRedirect(route('personnel.missions.index'));

        $this->assertDatabaseCount('mission_proof', 1);
        $this->actingAs($this->personnelUser)
            ->post(route('personnel.missions.proof.store', $this->missionId), ['client_submission_id' => (string) Str::uuid()])
            ->assertSessionHasErrors('proof');
        $this->assertDatabaseCount('mission_proof', 1);
    }

    private function proofPhoto(int $width = 720, int $height = 480): UploadedFile
    {
        $chunk = static function (string $type, string $data): string {
            return pack('N', strlen($data)).$type.$data.pack('H*', hash('crc32b', $type.$data));
        };
        $pixels = str_repeat("\0".str_repeat("\0\0\0", $width), $height);
        $png = "\x89PNG\r\n\x1a\n"
            .$chunk('IHDR', pack('NNCCCCC', $width, $height, 8, 2, 0, 0, 0))
            .$chunk('IDAT', gzcompress($pixels))
            .$chunk('IEND', '');

        return UploadedFile::fake()->createWithContent('work-proof.png', $png);
    }
}
