<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureBarangayIsActive;
use App\Http\Middleware\EnsureResidentIsVerified;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Models\ConcernClarification;
use App\Models\Notification;
use App\Models\User;
use App\Models\ConcernReanalysis;
use App\Jobs\Ai\ProcessConcernWithAi;
use Illuminate\Support\Facades\Bus;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class ConcernClarificationTest extends TestCase
{
    private string $barangayId;

    private User $admin;

    private User $resident;

    private Concern $concern;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware([HandleInertiaRequests::class, EnsureBarangayIsActive::class, EnsureResidentIsVerified::class]);
        $this->barangayId = (string) Str::uuid();

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->string('account_id');
            $table->string('role');
            $table->string('admin_type')->nullable();
            $table->boolean('is_view_only')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('first_name');
            $table->string('last_name');
            $table->timestamps();
        });
        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->uuid('reporter_id')->nullable();
            $table->uuid('intake_logged_by')->nullable();
            $table->uuid('duplicate_of_id')->nullable();
            $table->unsignedSmallInteger('category_id')->nullable();
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->string('intake_channel')->default('resident_portal');
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('under_review');
            $table->string('visibility')->default('public');
            $table->string('severity')->default('high');
            $table->boolean('is_blotter_candidate')->default(false);
            $table->text('location')->nullable();
            $table->string('address_text')->nullable();
            $table->uuid('staff_reviewed_by')->nullable();
            $table->timestamp('staff_reviewed_at')->nullable();
            $table->timestamps();
        });
        (require database_path('migrations/2026_11_15_120000_create_concern_clarifications_table.php'))->up();
        (require database_path('migrations/2026_07_21_170342_create_notifications_table.php'))->up();

        // Minimal related tables let the real report pages verify serialization privacy.
        Schema::create('resident_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
        });
        Schema::create('concern_categories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->string('name');
            $table->string('code');
        });
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->string('code');
            $table->boolean('force_private')->default(false);
        });
        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->unsignedSmallInteger('suggested_category_id')->nullable();
            $table->unsignedSmallInteger('suggested_subcategory_id')->nullable();
            $table->uuid('duplicate_candidate_id')->nullable();
            $table->boolean('is_current')->default(true);
            $table->decimal('severity_confidence', 4, 3)->nullable();
            $table->json('raw_model_output')->nullable();
            $table->timestamps();
        });
        (require database_path('migrations/2026_11_15_130000_create_concern_reanalyses_table.php'))->up();
        Schema::create('concern_votes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->uuid('user_id');
            $table->integer('vote');
        });
        Schema::create('concern_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
        });
        Schema::create('concern_status_history', function (Blueprint $table) {
            $table->id();
            $table->uuid('concern_id');
            $table->string('to_status');
            $table->text('note')->nullable();
            $table->timestamp('created_at')->nullable();
        });
        Schema::create('missions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
        });
        Schema::create('personnel', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('role')->nullable();
            $table->string('department')->nullable();
            $table->string('shift')->nullable();
            $table->boolean('is_active')->default(true);
        });
        Schema::create('concern_duplicate_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('primary_concern_id');
            $table->uuid('linked_concern_id');
        });
        DB::connection()->getPdo()->sqliteCreateFunction('ST_X', fn () => 14.5173);
        DB::connection()->getPdo()->sqliteCreateFunction('ST_Y', fn () => 120.9934);

        $this->admin = $this->actor('admin');
        $this->resident = $this->actor('resident');
        $this->concern = Concern::create([
            'barangay_id' => $this->barangayId,
            'reporter_id' => $this->resident->id,
            'title' => 'Baha dito sa amin',
            'description' => 'May baha dito.',
            'status' => 'under_review',
            'severity' => 'high',
        ]);
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('concern_reanalyses');
        foreach (['concern_clarifications', 'notifications', 'concern_duplicate_links', 'personnel', 'missions',
            'concern_status_history', 'concern_media', 'concern_votes', 'concern_ai_analysis',
            'concern_subcategories', 'concern_categories', 'resident_profiles', 'concerns', 'users'] as $table) {
            Schema::dropIfExists($table);
        }
        parent::tearDown();
    }

    public function test_admin_reviews_questions_and_resident_replies_without_changing_original_report(): void
    {
        $this->actingAs($this->admin)->post($this->requestUrl(), ['questions' => ['Which landmark is affected?', 'Is water entering houses?']])
            ->assertRedirect()->assertSessionHasNoErrors();

        $entry = $this->concern->clarifications()->firstOrFail();
        $this->assertSame(['Which landmark is affected?', 'Is water entering houses?'], $entry->questions);
        $notification = Notification::where('user_id', $this->resident->id)->firstOrFail();
        $this->assertSame('concern_clarification_requested', $notification->event_type);
        $this->assertSame($this->concern->id, $notification->payload['concern_id']);

        $this->actingAs($this->resident)->post($this->replyUrl($entry), ['response' => 'Near the school gate. Water is entering two houses.'])
            ->assertRedirect()->assertSessionHasNoErrors();

        $this->assertNotNull($entry->fresh()->answered_at);
        $this->assertSame('Near the school gate. Water is entering two houses.', $entry->fresh()->response);
        $this->assertDatabaseHas('notifications', ['user_id' => $this->admin->id, 'event_type' => 'concern_clarification_answered']);
        $this->assertSame('May baha dito.', $this->concern->fresh()->description);
        $this->assertSame('high', $this->concern->fresh()->severity);
        $this->assertSame('under_review', $this->concern->fresh()->status->value);

        $this->actingAs($this->admin)->post($this->requestUrl(), ['questions' => ['When did the flooding begin?']])
            ->assertRedirect()->assertSessionHasNoErrors();
        $this->assertSame(2, $this->concern->clarifications()->count());
    }

    public function test_only_one_unanswered_request_can_be_sent(): void
    {
        $this->entry();
        $this->actingAs($this->admin)->post($this->requestUrl(), ['questions' => ['Another question?']])
            ->assertSessionHasErrors('questions');
        $this->assertSame(1, $this->concern->clarifications()->count());
        $this->assertSame(0, Notification::count());
    }

    public function test_only_original_reporter_can_reply_even_for_a_public_concern(): void
    {
        $entry = $this->entry();
        $this->actingAs($this->actor('resident'))->post($this->replyUrl($entry), ['response' => 'Unauthorized reply'])->assertForbidden();
        $this->actingAs($this->actor('resident', (string) Str::uuid()))->post($this->replyUrl($entry), ['response' => 'Other barangay'])->assertNotFound();
        $this->assertNull($entry->fresh()->response);
    }

    public function test_cross_barangay_admins_view_only_admins_and_other_roles_cannot_send_questions(): void
    {
        $payload = ['questions' => ['Where is it?']];
        $this->actingAs($this->actor('admin', (string) Str::uuid()))->post($this->requestUrl(), $payload)->assertNotFound();
        $viewOnly = $this->actor('admin');
        $viewOnly->forceFill(['is_view_only' => true])->save();
        $this->actingAs($viewOnly)->post($this->requestUrl(), $payload)->assertForbidden();
        $this->actingAs($this->resident)->post($this->requestUrl(), $payload)->assertForbidden();
        $this->actingAs($this->actor('personnel'))->post($this->requestUrl(), $payload)->assertForbidden();
        $this->assertSame(0, ConcernClarification::count());
    }

    public function test_reply_must_belong_to_the_concern_and_cannot_be_overwritten(): void
    {
        $entry = $this->entry();
        $other = $this->concern->replicate();
        $other->save();
        $this->actingAs($this->resident)->post("/concerns/{$other->id}/clarifications/{$entry->id}/reply", ['response' => 'Wrong concern'])->assertNotFound();
        $this->actingAs($this->resident)->post($this->replyUrl($entry), ['response' => 'Original reply'])->assertSessionHasNoErrors();
        $this->actingAs($this->resident)->post($this->replyUrl($entry), ['response' => 'Replacement reply'])->assertSessionHasErrors('response');
        $this->assertSame('Original reply', $entry->fresh()->response);
        $this->assertSame(1, Notification::where('event_type', 'concern_clarification_answered')->count());
    }

    public function test_closed_or_dispatched_concerns_cannot_receive_new_requests_or_replies(): void
    {
        $entry = $this->entry();
        $this->concern->update(['status' => 'active']);
        $this->actingAs($this->admin)->post($this->requestUrl(), ['questions' => ['Where is it?']])->assertSessionHasErrors('questions');
        $this->actingAs($this->resident)->post($this->replyUrl($entry), ['response' => 'A late reply'])->assertSessionHasErrors('response');
        $this->assertNull($entry->fresh()->response);
    }

    public function test_dispatched_concerns_are_no_longer_labeled_as_awaiting_a_reply(): void
    {
        $this->entry();
        $this->concern->update(['status' => 'active']);

        $this->actingAs($this->admin)->get('/admin/reports', ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.reports.0.clarification_status', null);
        $this->actingAs($this->resident)->get("/concerns/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.concern.can_reply_to_clarification', false);
    }

    public function test_accountless_intake_cannot_receive_an_in_app_request(): void
    {
        $this->concern->update(['reporter_id' => null]);
        $this->actingAs($this->admin)->post($this->requestUrl(), ['questions' => ['Where is it?']])->assertSessionHasErrors('questions');
        $this->assertSame(0, Notification::count());
    }

    public function test_questions_and_replies_are_validated(): void
    {
        $this->actingAs($this->admin)->post($this->requestUrl(), ['questions' => ['  ']])->assertSessionHasErrors('questions.0');
        $this->actingAs($this->admin)->post($this->requestUrl(), ['questions' => ['Where?', 'Where?']])->assertSessionHasErrors('questions.0');
        $this->actingAs($this->admin)->post($this->requestUrl(), ['questions' => ['One?', 'Two?', 'Three?', 'Four?', 'Five?', 'Six?']])->assertSessionHasErrors('questions');
        $entry = $this->entry();
        $this->actingAs($this->resident)->post($this->replyUrl($entry), ['response' => '  '])->assertSessionHasErrors('response');
        $this->actingAs($this->resident)->post($this->replyUrl($entry), ['response' => str_repeat('a', 5001)])->assertSessionHasErrors('response');
        $this->assertNull($entry->fresh()->response);
    }

    public function test_other_residents_cannot_see_questions_or_replies_in_a_public_report(): void
    {
        $entry = $this->entry();
        $entry->update(['response' => 'Private reply for staff only.', 'answered_at' => now()]);
        $this->actingAs($this->actor('resident'))->get("/concerns/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.concern.clarifications', [])
            ->assertJsonPath('props.concern.can_reply_to_clarification', false)
            ->assertDontSee('Private reply for staff only.');

        $this->actingAs($this->resident)->get("/concerns/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.concern.clarifications.0.response', 'Private reply for staff only.');
    }

    public function test_low_confidence_admin_recommendation_is_review_instead_of_dismissal(): void
    {
        ConcernAiAnalysis::create(['concern_id' => $this->concern->id, 'severity_confidence' => 0.02, 'is_current' => true]);
        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.report_quality', 'needs_clarification')
            ->assertJsonPath('props.report.ai_recommended_action', 'review')
            ->assertJsonPath('props.report.can_request_clarification', true);
    }

    public function test_admin_receives_evidence_severity_factors_and_playbook_source(): void
    {
        ConcernAiAnalysis::create([
            'concern_id' => $this->concern->id, 'is_current' => true, 'severity_confidence' => 0.9,
            'raw_model_output' => [
                'analysis_source' => 'gemini', 'severity_reason' => 'The reported flooding needs staff verification.',
                'severity_factors' => ['community_severity' => 'high', 'reporter_count' => 4],
                'evidence_summary' => ['Reported: flooding near the school.'],
                'uncertainties' => ['Water depth is unknown.'],
                'response_plan' => ['source' => 'playbook', 'playbook_title' => 'Drainage inspection procedure'],
            ],
        ]);

        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.triage_explanation.analysis_source', 'gemini')
            ->assertJsonPath('props.report.triage_explanation.reporter_count', 4)
            ->assertJsonPath('props.report.triage_explanation.community_severity', 'high')
            ->assertJsonPath('props.report.triage_explanation.current_severity', 'high')
            ->assertJsonPath('props.report.triage_explanation.evidence_summary.0', 'Reported: flooding near the school.')
            ->assertJsonPath('props.report.triage_explanation.uncertainties.0', 'Water depth is unknown.')
            ->assertJsonPath('props.report.triage_explanation.response_plan.playbook_title', 'Drainage inspection procedure');
    }

    public function test_queue_and_report_show_waiting_and_answered_clarifications(): void
    {
        $entry = $this->entry();
        $this->actingAs($this->admin)->get('/admin/reports', ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.reports.0.clarification_status', 'awaiting_reply');
        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.ai_recommended_action', 'escalate')
            ->assertJsonPath('props.report.can_request_clarification', false);

        $entry->update(['response' => 'The water is near the school gate.', 'answered_at' => now()]);
        $this->actingAs($this->admin)->get('/admin/reports', ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.reports.0.clarification_status', 'answered');
        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.clarifications.0.response', 'The water is near the school gate.')
            ->assertJsonPath('props.report.can_request_clarification', true);
    }

    public function test_unanswered_optional_questions_do_not_replace_the_assessment_or_block_staff_decisions(): void
    {
        ConcernAiAnalysis::create([
            'concern_id' => $this->concern->id, 'is_current' => true, 'severity_confidence' => 0.9,
            'raw_model_output' => ['report_quality' => 'ready_for_review', 'severity_reason' => 'Floodwater is entering homes.'],
        ]);
        $entry = $this->entry();

        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.severity', 'high')
            ->assertJsonPath('props.report.triage_explanation.severity_reason', 'Floodwater is entering homes.')
            ->assertJsonPath('props.report.ai_recommended_action', 'escalate')
            ->assertJsonPath('props.report.can_confirm_verdict', true)
            ->assertJsonPath('props.report.can_reanalyse', false);

        $this->assertNull($entry->fresh()->answered_at);
        $this->assertSame(1, $this->concern->aiAnalyses()->count());
    }

    public function test_supplementary_replies_do_not_require_reanalysis_before_a_staff_decision(): void
    {
        $this->entry()->update(['response' => 'Near the school gate.', 'answered_at' => now()]);

        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.ai_recommended_action', 'escalate')
            ->assertJsonPath('props.report.severity', 'high')
            ->assertJsonPath('props.report.can_confirm_verdict', true)
            ->assertJsonPath('props.report.can_reanalyse', true);
        $this->assertSame(0, ConcernReanalysis::count());
    }

    public function test_optional_clarification_does_not_hide_a_duplicate_recommendation(): void
    {
        $original = $this->concern->replicate();
        $original->title = 'Original flood report';
        $original->save();
        ConcernAiAnalysis::create([
            'concern_id' => $this->concern->id, 'is_current' => true, 'severity_confidence' => 0.5,
            'duplicate_candidate_id' => $original->id, 'raw_model_output' => ['report_quality' => 'needs_clarification'],
        ]);
        $this->entry();

        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.ai_recommended_action', 'merge')
            ->assertJsonPath('props.report.ai_duplicate_id', $original->id)
            ->assertJsonPath('props.report.severity', 'high')
            ->assertJsonPath('props.report.can_confirm_verdict', true);
    }

    public function test_only_an_explicit_spam_assessment_recommends_dismissal(): void
    {
        ConcernAiAnalysis::create([
            'concern_id' => $this->concern->id, 'severity_confidence' => 0.9, 'is_current' => true,
            'raw_model_output' => ['report_quality' => 'possible_spam'],
        ]);
        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.ai_recommended_action', 'dismiss');
    }

    public function test_reanalysis_requires_new_replies_and_prevents_duplicate_queue_requests(): void
    {
        Bus::fake([ProcessConcernWithAi::class]);
        $url = "/admin/reports/{$this->concern->id}/reanalyse";
        $this->actingAs($this->admin)->post($url)->assertSessionHasErrors('reanalysis');
        $entry = $this->entry();
        $entry->update(['response' => 'Water is entering two houses.', 'answered_at' => now()]);
        $this->actingAs($this->admin)->post($url)->assertSessionHasNoErrors();
        $run = ConcernReanalysis::firstOrFail();
        $this->assertSame([$entry->id], $run->clarification_ids);
        Bus::assertDispatched(ProcessConcernWithAi::class, fn ($job) => $job->reanalysisId === $run->id);
        $this->actingAs($this->admin)->post($url)->assertSessionHasErrors('reanalysis');
        $this->assertSame(1, ConcernReanalysis::count());
        $run->update(['status' => 'completed']);
        $this->actingAs($this->admin)->post($url)->assertSessionHasErrors('reanalysis');
    }

    public function test_reanalysis_is_restricted_to_writable_admins_in_the_same_barangay(): void
    {
        Bus::fake([ProcessConcernWithAi::class]);
        $url = "/admin/reports/{$this->concern->id}/reanalyse";
        $entry = $this->entry();
        $entry->update(['response' => 'Additional details.', 'answered_at' => now()]);
        $this->actingAs($this->resident)->post($url)->assertForbidden();
        $this->actingAs($this->actor('admin', (string) Str::uuid()))->post($url)->assertNotFound();
        $readonly = $this->actor('admin');
        $readonly->forceFill(['is_view_only' => true])->save();
        $this->actingAs($readonly)->post($url)->assertForbidden();
        Bus::assertNotDispatched(ProcessConcernWithAi::class);
    }

    public function test_staff_review_reports_still_include_active_personnel_for_dispatch(): void
    {
        $this->concern->update(['title' => 'Noise complaint', 'description' => 'Loud videoke near the court.', 'is_blotter_candidate' => true, 'visibility' => 'private']);
        ConcernAiAnalysis::create(['concern_id' => $this->concern->id, 'is_current' => true,
            'raw_model_output' => ['report_quality' => 'needs_clarification'], 'severity_confidence' => 0.02]);
        $tanod = $this->actor('personnel');
        $personnelId = (string) Str::uuid();
        DB::table('personnel')->insert(['id' => $personnelId, 'user_id' => $tanod->id, 'role' => 'tanod',
            'department' => 'Peace & Order', 'shift' => \App\Enums\PersonnelShift::current()->next()->value, 'is_active' => true]);

        $this->actingAs($this->admin)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.ai_recommended_action', 'review')
            ->assertJsonPath('props.report.can_confirm_verdict', true)
            ->assertJsonPath('props.report.department', 'Peace & Order')
            ->assertJsonCount(1, 'props.personnel')
            ->assertJsonPath('props.personnel.0.id', $personnelId);
    }

    public function test_view_only_accounts_are_identified_before_verdict_confirmation(): void
    {
        $readonly = $this->actor('admin');
        $readonly->forceFill(['is_view_only' => true])->save();
        $this->actingAs($readonly)->get("/admin/reports/{$this->concern->id}", ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('props.report.can_confirm_verdict', false);
    }

    private function actor(string $role, ?string $barangayId = null): User
    {
        return User::forceCreate([
            'barangay_id' => $barangayId ?? $this->barangayId,
            'account_id' => (string) Str::uuid(), 'role' => $role,
            'first_name' => 'Test', 'last_name' => ucfirst($role), 'is_active' => true,
        ]);
    }

    private function entry(): ConcernClarification
    {
        return $this->concern->clarifications()->create(['requested_by' => $this->admin->id, 'questions' => ['Which landmark is affected?']]);
    }

    private function requestUrl(): string
    {
        return "/admin/reports/{$this->concern->id}/clarifications";
    }

    private function replyUrl(ConcernClarification $entry): string
    {
        return "/concerns/{$this->concern->id}/clarifications/{$entry->id}/reply";
    }
}
