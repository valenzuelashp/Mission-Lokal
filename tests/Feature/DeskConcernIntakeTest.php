<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Http\Middleware\EnsureBarangayIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use App\Models\Concern;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeskConcernIntakeTest extends TestCase
{
    private string $barangayId;
    private string $adminId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->barangayId = (string) Str::uuid();
        $this->adminId = (string) Str::uuid();
        DB::connection()->getPdo()->sqliteCreateFunction('ST_GeomFromText', fn (string $point) => $point, -1);

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id')->nullable();
            $table->string('account_id');
            $table->string('role');
            $table->string('admin_type')->nullable();
            $table->boolean('is_view_only')->default(false);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->uuid('reporter_id')->nullable();
            $table->uuid('intake_logged_by')->nullable();
            $table->string('intake_channel')->default('resident_portal');
            $table->text('intake_reporter_name')->nullable();
            $table->text('intake_reporter_phone')->nullable();
            $table->text('intake_reporter_address')->nullable();
            $table->dateTime('incident_occurred_at')->nullable();
            $table->string('title');
            $table->text('description');
            $table->unsignedSmallInteger('category_id')->nullable();
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->string('visibility');
            $table->string('severity')->nullable();
            $table->boolean('severity_confirmed')->default(false);
            $table->string('status')->default('submitted');
            $table->text('location')->nullable();
            $table->text('address_text')->nullable();
            $table->boolean('is_blotter_candidate')->default(false);
            $table->uuid('duplicate_of_id')->nullable();
            $table->dateTime('ai_processed_at')->nullable();
            $table->uuid('staff_reviewed_by')->nullable();
            $table->dateTime('staff_reviewed_at')->nullable();
            $table->text('closed_summary')->nullable();
            $table->timestamps();
        });
        Schema::create('concern_categories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->uuid('barangay_id')->nullable();
            $table->string('code');
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
        });
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->unsignedSmallInteger('category_id');
            $table->string('code');
            $table->string('name');
            $table->boolean('force_private')->default(false);
            $table->boolean('is_active')->default(true);
        });
        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->boolean('is_current')->default(true);
            $table->string('detected_language')->nullable();
            $table->unsignedSmallInteger('suggested_category_id')->nullable();
            $table->unsignedSmallInteger('suggested_subcategory_id')->nullable();
            $table->string('suggested_visibility')->nullable();
            $table->string('suggested_severity')->nullable();
            $table->decimal('severity_confidence', 4, 3)->nullable();
            $table->json('prescriptive_steps')->nullable();
            $table->date('suggested_due_date')->nullable();
            $table->unsignedSmallInteger('suggested_duration_hours')->nullable();
            $table->uuid('duplicate_candidate_id')->nullable();
            $table->decimal('duplicate_similarity', 5, 4)->nullable();
            $table->json('raw_model_output')->nullable();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();
        });
        Schema::create('concern_status_history', function (Blueprint $table) {
            $table->id();
            $table->uuid('concern_id');
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->uuid('actor_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('created_at')->nullable();
        });
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('barangay_id');
            $table->uuid('actor_id')->nullable();
            $table->string('action');
            $table->string('entity_type');
            $table->uuid('entity_id');
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        config(['services.gemini.key' => null, 'queue.default' => 'sync']);
        DB::table('users')->insert([
            'id' => $this->adminId,
            'barangay_id' => $this->barangayId,
            'account_id' => 'EXAMPLE_ADM_0001',
            'role' => 'admin',
            'admin_type' => 'radio_room',
            'is_view_only' => false,
            'first_name' => 'Radio',
            'last_name' => 'Admin',
            'email' => 'radio@example.test',
            'password' => bcrypt('test-password'),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('concern_categories')->insert([
            'id' => 1,
            'code' => 'INFRA',
            'name' => 'Infrastructure',
            'is_active' => true,
            'sort_order' => 1,
        ]);
    }

    protected function tearDown(): void
    {
        foreach ([
            'audit_logs',
            'concern_status_history',
            'concern_ai_analysis',
            'concern_subcategories',
            'concern_categories',
            'concerns',
            'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_phone_intake_creates_an_accountless_concern_and_records_the_admin_actor(): void
    {
        $admin = User::findOrFail($this->adminId);
        $this->withoutMiddleware([HandleInertiaRequests::class, EnsureBarangayIsActive::class]);

        $this->actingAs($admin)->post('/admin/reports/intake', [
            'intake_channel' => 'phone',
            'intake_reporter_name' => 'Caller Name',
            'intake_reporter_phone' => '09171234567',
            'intake_reporter_address' => 'Phase 2, Sample Street',
            'title' => 'Blocked street drainage',
            'description' => 'Water pools beside the street after heavy rain and blocks residents.',
            'category_id' => 1,
            'incident_location' => 'Near the community court',
            'lat' => 14.5173,
            'lng' => 120.9934,
            'visibility' => 'public',
        ])->assertRedirect('/admin/reports');

        $concern = DB::table('concerns')->first();
        $this->assertNotNull($concern);
        $this->assertNull($concern->reporter_id);
        $this->assertSame($this->adminId, $concern->intake_logged_by);
        $this->assertSame('phone', $concern->intake_channel);
        $deskConcern = Concern::findOrFail($concern->id);
        $this->assertSame('Caller Name', $deskConcern->intake_reporter_name);
        $this->assertSame('09171234567', $deskConcern->intake_reporter_phone);
        $storedCallerName = DB::table('concerns')->where('id', $concern->id)->value('intake_reporter_name');
        $this->assertNotSame('Caller Name', $storedCallerName);
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->adminId,
            'action' => 'DESK_INTAKE',
            'entity_id' => $concern->id,
        ]);
        $this->assertDatabaseHas('concern_ai_analysis', ['concern_id' => $concern->id, 'is_current' => 1]);
    }

    public function test_vawc_desk_intake_is_forced_private(): void
    {
        DB::table('concern_subcategories')->insert([
            'id' => 6,
            'category_id' => 1,
            'code' => 'VAWC',
            'name' => 'VAWC',
            'force_private' => true,
            'is_active' => true,
        ]);
        $admin = User::findOrFail($this->adminId);
        $this->withoutMiddleware([HandleInertiaRequests::class, EnsureBarangayIsActive::class]);

        $this->actingAs($admin)->post('/admin/reports/intake', [
            'intake_channel' => 'walk_in',
            'intake_reporter_name' => 'Confidential Caller',
            'title' => 'Confidential assistance request',
            'description' => 'A person reports violence against women and requests confidential help.',
            'category_id' => 1,
            'subcategory_id' => 6,
            'incident_location' => 'Private location recorded for authorized staff',
            'lat' => 14.5173,
            'lng' => 120.9934,
            'visibility' => 'public',
        ])->assertRedirect('/admin/reports');

        $concern = DB::table('concerns')->first();
        $this->assertSame('private', $concern->visibility);
        $this->assertTrue((bool) $concern->is_blotter_candidate);
        $this->assertDatabaseHas('concern_ai_analysis', [
            'concern_id' => $concern->id,
            'suggested_visibility' => 'private',
        ]);
    }
}