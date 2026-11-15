<?php

namespace Tests\Feature;

use App\Models\CategoryPlaybook;
use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Models\Mission;
use App\Services\Concerns\ConcernResponsePlan;
use App\Services\Missions\MissionLifecycleService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ConcernResponsePlanTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->string('code');
        });
        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->timestamps();
        });
        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->unsignedSmallInteger('suggested_subcategory_id')->nullable();
            $table->boolean('is_current')->default(true);
            $table->json('prescriptive_steps')->nullable();
            $table->json('raw_model_output')->nullable();
            $table->timestamps();
        });
        (require database_path('migrations/2026_06_19_045331_create_category_playbooks_table.php'))->up();
        Schema::create('missions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->uuid('playbook_id')->nullable();
            $table->timestamps();
        });
        Schema::create('mission_checklist_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
            $table->unsignedSmallInteger('step_order');
            $table->text('description');
            $table->boolean('is_completed')->default(false);
        });
        DB::table('concern_subcategories')->insert(['id' => 4, 'code' => 'DRAINAGE']);
    }

    protected function tearDown(): void
    {
        foreach (['mission_checklist_items', 'missions', 'category_playbooks', 'concern_ai_analysis', 'concerns', 'concern_subcategories'] as $table) {
            Schema::dropIfExists($table);
        }
        parent::tearDown();
    }

    public function test_mission_uses_the_saved_plan_even_if_its_playbook_is_later_edited_or_retired(): void
    {
        $playbook = $this->playbook(['Inspect the drainage inlet.', ['step' => 2, 'task' => 'Document the conditions.']]);
        $plan = app(ConcernResponsePlan::class)->forSubcategory(4);
        $concern = $this->concern();
        ConcernAiAnalysis::create([
            'concern_id' => $concern->id, 'suggested_subcategory_id' => 4,
            'prescriptive_steps' => $plan['prescriptive_steps'], 'raw_model_output' => ['response_plan' => $plan['response_plan']],
        ]);
        $playbook->update(['steps_template' => ['A different procedure added later.'], 'is_active' => false]);
        $mission = Mission::create(['concern_id' => $concern->id]);

        app(MissionLifecycleService::class)->ensureChecklist($mission, $concern);

        $this->assertSame($plan['prescriptive_steps'], $mission->checklistItems()->orderBy('step_order')->pluck('description')->all());
        $this->assertSame($playbook->id, $mission->fresh()->playbook_id);
    }

    public function test_mission_keeps_the_reviewed_draft_if_a_new_playbook_is_added_later(): void
    {
        $concern = $this->concern();
        $steps = ['Barangay staff will verify the reported drainage problem.'];
        ConcernAiAnalysis::create([
            'concern_id' => $concern->id, 'suggested_subcategory_id' => 4,
            'prescriptive_steps' => $steps, 'raw_model_output' => ['response_plan' => ['source' => 'gemini']],
        ]);
        $this->playbook(['A procedure that was unavailable during triage.']);
        $mission = Mission::create(['concern_id' => $concern->id]);

        app(MissionLifecycleService::class)->ensureChecklist($mission, $concern);

        $this->assertSame($steps, $mission->checklistItems()->pluck('description')->all());
        $this->assertNull($mission->fresh()->playbook_id);
    }

    public function test_legacy_analysis_can_still_use_an_active_matching_playbook(): void
    {
        $playbook = $this->playbook(['Inspect the drainage inlet.']);
        $concern = $this->concern();
        ConcernAiAnalysis::create(['concern_id' => $concern->id, 'suggested_subcategory_id' => 4, 'prescriptive_steps' => ['Old AI draft.']]);
        $mission = Mission::create(['concern_id' => $concern->id]);

        app(MissionLifecycleService::class)->ensureChecklist($mission, $concern);

        $this->assertSame(['Assigned barangay personnel: Inspect the drainage inlet.'], $mission->checklistItems()->pluck('description')->all());
        $this->assertSame($playbook->id, $mission->fresh()->playbook_id);
    }

    public function test_empty_or_inactive_templates_do_not_hide_a_valid_playbook(): void
    {
        $this->playbook(['Retired procedure.'], false);
        CategoryPlaybook::create([
            'id' => '00000000-0000-4000-8000-000000000000', 'subcategory_id' => 4,
            'title' => 'Empty template', 'steps_template' => ['', ['step' => 1], null], 'is_active' => true,
        ]);
        $valid = $this->playbook([['step' => 1, 'task' => 'Inspect the drainage inlet.']]);

        $plan = app(ConcernResponsePlan::class)->forSubcategory(4);

        $this->assertSame($valid->id, $plan['response_plan']['playbook_id']);
        $this->assertSame(['Assigned barangay personnel: Inspect the drainage inlet.'], $plan['prescriptive_steps']);
        $this->assertNull(app(ConcernResponsePlan::class)->forSubcategory(null));
        $this->assertNull(app(ConcernResponsePlan::class)->forSubcategory(99));
    }

    public function test_existing_completed_checklist_items_are_preserved(): void
    {
        $concern = $this->concern();
        $mission = Mission::create(['concern_id' => $concern->id]);
        $mission->checklistItems()->create(['step_order' => 1, 'description' => 'An existing approved task.', 'is_completed' => true]);
        $this->playbook(['New procedure.']);

        app(MissionLifecycleService::class)->ensureChecklist($mission, $concern);

        $this->assertSame(1, $mission->checklistItems()->count());
        $this->assertTrue($mission->checklistItems()->first()->is_completed);
        $this->assertSame('An existing approved task.', $mission->checklistItems()->first()->description);
    }

    public function test_a_missing_playbook_does_not_remove_the_saved_plan(): void
    {
        $playbook = $this->playbook(['Inspect the drainage inlet.']);
        $plan = app(ConcernResponsePlan::class)->forSubcategory(4);
        $concern = $this->concern();
        ConcernAiAnalysis::create([
            'concern_id' => $concern->id, 'suggested_subcategory_id' => 4,
            'prescriptive_steps' => $plan['prescriptive_steps'], 'raw_model_output' => ['response_plan' => $plan['response_plan']],
        ]);
        $playbook->delete();
        $mission = Mission::create(['concern_id' => $concern->id]);

        app(MissionLifecycleService::class)->ensureChecklist($mission, $concern);

        $this->assertSame($plan['prescriptive_steps'], $mission->checklistItems()->pluck('description')->all());
        $this->assertNull($mission->fresh()->playbook_id);
    }

    public function test_a_generic_playbook_cannot_replace_vawc_safeguarding(): void
    {
        DB::table('concern_subcategories')->where('id', 4)->update(['code' => 'VAWC']);
        $this->playbook(['Arrange a meeting with all parties.']);
        $concern = $this->concern();
        ConcernAiAnalysis::create(['concern_id' => $concern->id, 'suggested_subcategory_id' => 4, 'prescriptive_steps' => ['Generic steps.']]);
        $mission = Mission::create(['concern_id' => $concern->id]);

        app(MissionLifecycleService::class)->ensureChecklist($mission, $concern);

        $this->assertSame(app(ConcernResponsePlan::class)->safeguardingSteps(), $mission->checklistItems()->orderBy('step_order')->pluck('description')->all());
        $this->assertNull($mission->fresh()->playbook_id);
    }

    private function playbook(array $steps, bool $active = true): CategoryPlaybook
    {
        return CategoryPlaybook::create(['subcategory_id' => 4, 'title' => 'Drainage procedure', 'steps_template' => $steps, 'is_active' => $active]);
    }

    private function concern(): Concern
    {
        return Concern::create(['title' => 'Blocked drain', 'description' => 'Water pools on the street after rain.', 'subcategory_id' => 4]);
    }
}
