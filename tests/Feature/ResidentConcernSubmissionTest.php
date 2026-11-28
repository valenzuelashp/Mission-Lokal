<?php

namespace Tests\Feature;

use App\Enums\ConcernCategoryCode;
use App\Http\Middleware\EnsureBarangayIsActive;
use App\Http\Middleware\EnsureResidentIsVerified;
use App\Http\Middleware\HandleInertiaRequests;
use App\Jobs\Ai\ProcessConcernWithAi;
use App\Models\Concern;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\Support\ConcernSchema;
use Tests\TestCase;

class ResidentConcernSubmissionTest extends TestCase
{
    private User $resident;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        $this->withoutMiddleware([HandleInertiaRequests::class, EnsureBarangayIsActive::class, EnsureResidentIsVerified::class]);
        DB::connection()->getPdo()->sqliteCreateFunction('ST_GeomFromText', fn (string $point) => $point, -1);
        DB::connection()->getPdo()->sqliteCreateFunction('ST_X', fn (string $point) => sscanf($point, 'POINT(%f %f)')[0]);
        DB::connection()->getPdo()->sqliteCreateFunction('ST_Y', fn (string $point) => sscanf($point, 'POINT(%f %f)')[1]);
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->string('role');
            $table->date('birthday');
            $table->timestamps();
        });
        Schema::create('concern_categories', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->uuid('barangay_id')->nullable();
            $table->string('code');
            $table->string('name');
            $table->boolean('is_active')->default(true);
        });
        foreach (ConcernCategoryCode::cases() as $definition) {
            DB::table('concern_categories')->insert(['code' => $definition->value, 'name' => $definition->label()]);
        }
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->unsignedSmallInteger('category_id');
            $table->string('code');
            $table->boolean('force_private')->default(false);
        });
        Schema::create('concerns', function (Blueprint $table) {
            ConcernSchema::classification($table, true);
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->uuid('reporter_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->unsignedSmallInteger('category_id');
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->string('visibility');
            $table->string('status');
            $table->text('location');
            $table->text('address_text')->nullable();
            $table->timestamp('incident_occurred_at')->nullable();
            $table->boolean('is_blotter_candidate')->default(false);
            $table->boolean('severity_confirmed')->default(false);
            $table->timestamp('ai_processed_at')->nullable();
            $table->timestamps();
        });
        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->boolean('is_current')->default(true);
            $table->unsignedSmallInteger('suggested_subcategory_id')->nullable();
            $table->json('raw_model_output')->nullable();
            $table->timestamps();
        });
        Schema::create('concern_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
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
        Schema::create('missions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
        });
        $this->resident = User::create(['barangay_id' => (string) Str::uuid(), 'role' => 'resident', 'birthday' => '1990-01-01']);
        $this->actingAs($this->resident);
    }

    private function payload(array $overrides = []): array
    {
        return array_replace(['title' => 'Street needs repair', 'description' => 'The sidewalk has broken paving stones.', 'category_id' => 'infra', 'lat' => 14.5173, 'lng' => 120.9933, 'visibility' => 'public'], $overrides);
    }

    public function test_all_nine_categories_are_accepted_and_unknown_or_legacy_values_are_rejected(): void
    {
        foreach (ConcernCategoryCode::options() as $option) {
            $this->post('/concerns', $this->payload(['category_id' => $option['value']]))->assertSessionHasNoErrors()->assertRedirect('/feed');
        }
        $this->assertSame(9, Concern::count());
        $this->post('/concerns', $this->payload(['category_id' => 'fire']))->assertSessionHasErrors('category_id');
        $this->post('/concerns', $this->payload(['category_id' => 'invented']))->assertSessionHasErrors('category_id');
    }

    public function test_selecting_vawc_forces_private_despite_a_forged_public_visibility(): void
    {
        $this->post('/concerns', $this->payload(['category_id' => 'vawc']))->assertSessionHasNoErrors();
        $concern = Concern::firstOrFail();
        $this->assertSame('private', $concern->visibility);
        $this->assertTrue($concern->is_vawc);
        $this->patch('/concerns/'.$concern->id.'/visibility', ['visibility' => 'public'])->assertSessionHas('error');
        $this->assertSame('private', $concern->fresh()->visibility);
    }

    public function test_active_emergency_is_rejected_before_it_is_saved_or_queued(): void
    {
        $this->post('/concerns', $this->payload(['title' => 'A house is on fire now']))->assertSessionHasErrors('description');
        $this->assertSame(0, Concern::count());
        Queue::assertNotPushed(ProcessConcernWithAi::class);
    }

    public function test_owner_can_edit_a_pending_concern_and_triggers_fresh_analysis(): void
    {
        $this->post('/concerns', $this->payload())->assertSessionHasNoErrors();
        $concern = Concern::firstOrFail();
        $this->get('/concerns/'.$concern->id.'/edit', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.initialConcern.title', 'Street needs repair');
        $this->put('/concerns/'.$concern->id, $this->payload(['category_id' => 'waste', 'description' => 'Uncollected garbage has accumulated beside the street.']))->assertSessionHasNoErrors()->assertRedirect('/concerns/'.$concern->id);
        $this->assertSame(2, $concern->fresh()->content_revision);
        $this->assertSame('pending', $concern->fresh()->scope_status);
        Queue::assertPushed(ProcessConcernWithAi::class, 2);
    }

    public function test_editing_cannot_publish_a_previously_confidential_case(): void
    {
        $this->post('/concerns', $this->payload(['category_id' => 'vawc']));
        $concern = Concern::firstOrFail();
        $this->put('/concerns/'.$concern->id, $this->payload())->assertSessionHasNoErrors();
        $this->assertSame('private', $concern->fresh()->visibility);
        $this->assertTrue($concern->fresh()->is_vawc);
    }

    public function test_other_residents_cannot_edit_the_report_and_deployed_reports_cannot_be_edited(): void
    {
        $this->post('/concerns', $this->payload());
        $concern = Concern::firstOrFail();
        $other = User::create(['barangay_id' => $this->resident->barangay_id, 'role' => 'resident', 'birthday' => '1990-01-01']);
        $this->actingAs($other)->put('/concerns/'.$concern->id, $this->payload())->assertNotFound();
        $concern->update(['status' => 'active']);
        $this->actingAs($this->resident)->put('/concerns/'.$concern->id, $this->payload())->assertForbidden();
    }
}
