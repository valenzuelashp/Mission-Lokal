<?php

namespace Tests\Feature\Ai;

use App\Enums\ConcernStatus;
use App\Jobs\Ai\ProcessConcernWithAi;
use App\Models\CategoryPlaybook;
use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Models\ConcernCategory;
use App\Models\ConcernReanalysis;
use App\Services\Concerns\ConcernDuplicateMatcher;
use App\Services\Concerns\ConcernResolutionDeadline;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\Support\ConcernSchema;
use Tests\TestCase;

class ProcessConcernWithAiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('concerns', function (Blueprint $table) {
            ConcernSchema::classification($table, true);
            $table->uuid('id')->primary();
            $table->unsignedSmallInteger('category_id')->nullable();
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->uuid('barangay_id')->nullable();
            $table->uuid('reporter_id')->nullable();
            $table->uuid('duplicate_of_id')->nullable();
            $table->text('location')->nullable();
            $table->text('address_text')->nullable();
            $table->timestamp('incident_occurred_at')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('severity')->nullable();
            $table->boolean('severity_confirmed')->default(false);
            $table->string('visibility')->nullable();
            $table->boolean('is_blotter_candidate')->default(false);
            $table->string('status')->default('submitted');
            $table->timestamp('ai_processed_at')->nullable();
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

        Schema::create('concern_categories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->uuid('barangay_id')->nullable();
            $table->string('code');
            $table->string('name');
            $table->boolean('is_active')->default(true);
        });

        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->unsignedSmallInteger('category_id');
            $table->string('code');
            $table->string('name');
            $table->boolean('force_private')->default(false);
            $table->boolean('is_active')->default(true);
        });

        Schema::create('concern_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->string('storage_key');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('created_at')->nullable();
        });

        (require database_path('migrations/2026_06_19_045331_create_category_playbooks_table.php'))->up();

        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->unsignedInteger('content_revision')->default(1);
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->unsignedSmallInteger('suggested_category_id')->nullable();
            $table->unsignedSmallInteger('suggested_subcategory_id')->nullable();
            $table->boolean('is_current')->default(true);
            $table->string('detected_language')->nullable();
            $table->string('suggested_visibility')->nullable();
            $table->string('suggested_severity')->nullable();
            $table->decimal('severity_confidence', 3, 2)->nullable();
            $table->json('prescriptive_steps')->nullable();
            $table->unsignedInteger('suggested_duration_hours')->nullable();
            $table->date('suggested_due_date')->nullable();
            $table->uuid('duplicate_candidate_id')->nullable();
            $table->decimal('duplicate_similarity', 5, 4)->nullable();
            $table->json('raw_model_output')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        config([
            'services.gemini.key' => 'test-key',
            'services.gemini.model' => 'test-model',
        ]);
        Schema::create('users', fn (Blueprint $table) => $table->uuid('id')->primary());
        (require database_path('migrations/2026_11_15_120000_create_concern_clarifications_table.php'))->up();
        (require database_path('migrations/2026_11_15_130000_create_concern_reanalyses_table.php'))->up();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('concern_reanalyses');
        Schema::dropIfExists('concern_clarifications');
        Schema::dropIfExists('users');
        Schema::dropIfExists('category_playbooks');
        Schema::dropIfExists('concern_status_history');
        Schema::dropIfExists('concern_ai_analysis');
        Schema::dropIfExists('concern_media');
        Schema::dropIfExists('concern_subcategories');
        Schema::dropIfExists('concern_categories');
        Schema::dropIfExists('concerns');

        parent::tearDown();
    }

    public function test_it_saves_a_valid_ai_analysis_and_marks_the_concern_processed(): void
    {
        ConcernCategory::create([
            'id' => 1,
            'code' => 'INFRA',
            'name' => 'Infrastructure & Utilities',
            'is_active' => true,
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => json_encode([
                                'scope_decision' => 'in_scope', 'scope_reason' => 'A non-emergency infrastructure concern.',
                                'detected_language' => 'en',
                                'suggested_visibility' => 'public',
                                'suggested_severity' => 'high',
                                'severity_confidence' => 0.95,
                                'suggested_category_code' => 'INFRA',
                                'suggested_subcategory_code' => null,
                                'prescriptive_steps' => ['Inspect the area'],
                                'suggested_duration_hours' => 12,
                            ]),
                        ]],
                    ],
                ]],
            ]),
        ]);

        $concern = Concern::create([
            'category_id' => 1,
            'title' => 'Blocked drainage',
            'description' => 'Water is pooling on the street.',
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        $this->assertDatabaseHas('concern_ai_analysis', [
            'concern_id' => $concern->id,
            'is_current' => 1,
            'suggested_category_id' => 1,
            'suggested_severity' => 'high',
            'suggested_duration_hours' => 168,
        ]);
        $this->assertSame(ConcernStatus::AiProcessed, $concern->fresh()->status);
        $this->assertSame('high', $concern->fresh()->severity);
        $this->assertDatabaseHas('concern_status_history', [
            'concern_id' => $concern->id,
            'to_status' => 'ai_processed',
            'note' => 'AI triage completed.',
        ]);
        $this->assertSame(
            app(ConcernResolutionDeadline::class)->deadlineFor($concern, 'high')->toDateString(),
            ConcernAiAnalysis::where('concern_id', $concern->id)->first()->suggested_due_date->toDateString(),
        );
    }

    public function test_low_confidence_requests_clarification_and_preserves_urgent_severity(): void
    {
        $this->fakeAnalysis([
            'suggested_severity' => 'critical',
            'severity_confidence' => 0.02,
            'uncertainties' => ['No spam was detected, but the extent of the danger is unclear.'],
        ]);
        $concern = Concern::create(['title' => 'Electrical hazard', 'description' => 'There are sparks near the school gate.']);

        (new ProcessConcernWithAi($concern))->handle();

        $analysis = $concern->fresh()->currentAiAnalysis;
        $this->assertSame('needs_clarification', $analysis->reportQuality());
        $this->assertNotEmpty($analysis->raw_model_output['follow_up_questions']);
        $this->assertSame('critical', $concern->fresh()->severity);
    }

    public function test_it_preserves_specific_questions_for_admin_review(): void
    {
        $this->fakeAnalysis([
            'report_quality' => 'needs_clarification',
            'missing_details' => ['Depth of the flooding'],
            'follow_up_questions' => ['Gaano po kataas ang baha?', '', ['invalid'], 'Gaano po kataas ang baha?'],
        ]);
        $concern = Concern::create(['title' => 'Baha sa amin', 'description' => 'May baha dito sa may kanto.']);

        (new ProcessConcernWithAi($concern))->handle();

        $analysis = $concern->fresh()->currentAiAnalysis;
        $this->assertSame('needs_clarification', $analysis->reportQuality());
        $this->assertSame(['Gaano po kataas ang baha?'], $analysis->raw_model_output['follow_up_questions']);
        $this->assertSame(['Depth of the flooding'], $analysis->raw_model_output['missing_details']);
        Http::assertSent(fn ($request) => data_get($request->data(), 'generationConfig.responseSchema.properties.report_quality.enum')
            === ['ready_for_review', 'needs_clarification', 'possible_spam']);
    }

    public function test_severity_is_assessed_even_when_an_optional_clarification_has_no_reply(): void
    {
        $this->fakeAnalysis([
            'suggested_severity' => 'critical', 'report_quality' => 'needs_clarification',
            'missing_details' => ['The extent of the hazard'],
        ]);
        $concern = Concern::create(['title' => 'Electrical hazard', 'description' => 'Sparks near the school gate.']);
        $entry = $concern->clarifications()->create(['questions' => ['How far from the school is the hazard?']]);

        (new ProcessConcernWithAi($concern))->handle();

        $this->assertNull($entry->fresh()->answered_at);
        $this->assertSame('critical', $concern->fresh()->severity);
        $this->assertSame(ConcernStatus::AiProcessed, $concern->fresh()->status);
        $this->assertSame('needs_clarification', $concern->fresh()->currentAiAnalysis->reportQuality());
        $this->assertSame(0, ConcernReanalysis::count());
    }

    public function test_valid_filipino_words_are_not_rejected_as_keyboard_smashes(): void
    {
        $this->fakeAnalysis(['suggested_severity' => 'low']);
        $concern = Concern::create(['title' => 'Pagmamaltrato sa hayop', 'description' => 'May taong nananakit ng mga aso malapit sa palengke.']);

        (new ProcessConcernWithAi($concern))->handle();

        Http::assertSentCount(1);
        $this->assertSame('ready_for_review', $concern->fresh()->currentAiAnalysis->reportQuality());
        $this->assertSame('low', $concern->fresh()->severity);
    }

    public function test_keyboard_smashes_require_staff_review_and_keep_only_one_current_analysis(): void
    {
        Http::fake();
        $concern = Concern::create(['title' => 'asdasd', 'description' => 'qwerty']);

        (new ProcessConcernWithAi($concern))->handle();
        (new ProcessConcernWithAi($concern))->handle();

        Http::assertNothingSent();
        $this->assertSame('possible_spam', $concern->fresh()->currentAiAnalysis->reportQuality());
        $this->assertSame(1, $concern->aiAnalyses()->where('is_current', true)->count());
        $this->assertSame(2, $concern->aiAnalyses()->count());
        $this->assertSame(ConcernStatus::UnderReview, $concern->fresh()->status);
    }

    public function test_local_analysis_flags_a_short_genuine_report_for_clarification(): void
    {
        config(['services.gemini.key' => null]);
        Http::fake();
        $concern = Concern::create(['title' => 'Baha', 'description' => 'Baha dito.']);

        (new ProcessConcernWithAi($concern))->handle();

        Http::assertNothingSent();
        $this->assertSame('needs_clarification', $concern->fresh()->currentAiAnalysis->reportQuality());
        $this->assertSame('high', $concern->fresh()->severity);
    }

    public function test_analysis_preserves_staff_review_and_confirmed_severity(): void
    {
        $this->fakeAnalysis(['suggested_severity' => 'low']);
        $concern = Concern::create([
            'title' => 'Broken street light', 'description' => 'The light is broken near the school.',
            'status' => 'under_review', 'severity' => 'high', 'severity_confirmed' => true,
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        $this->assertSame(ConcernStatus::UnderReview, $concern->fresh()->status);
        $this->assertSame('high', $concern->fresh()->severity);
    }

    public function test_it_does_not_reprocess_a_dispatched_concern(): void
    {
        Http::fake();
        $concern = Concern::create(['title' => 'Broken light', 'description' => 'The light is broken.', 'status' => 'active']);

        (new ProcessConcernWithAi($concern))->handle();

        Http::assertNothingSent();
        $this->assertSame(ConcernStatus::Active, $concern->fresh()->status);
        $this->assertSame(0, $concern->aiAnalyses()->count());
    }

    public function test_active_playbook_replaces_the_ai_draft_and_records_explainable_provenance(): void
    {
        $playbook = $this->drainagePlaybook();
        $this->fakeAnalysis([
            'suggested_category_code' => 'DRAINAGE', 'suggested_subcategory_code' => 'DRAINAGE',
            'severity_reason' => 'The resident reports a blocked drain; the extent of flooding is uncertain.',
            'evidence_summary' => ['Reported: the drain is blocked.'],
            'analysis_source' => 'forged', 'severity_factors' => ['reporter_count' => 999],
            'response_plan' => ['source' => 'playbook', 'playbook_id' => 'forged'],
        ]);
        $concern = Concern::create(['title' => 'Blocked drain', 'description' => 'Water pools in the street after rain.']);

        (new ProcessConcernWithAi($concern))->handle();

        $analysis = $concern->fresh()->currentAiAnalysis;
        $this->assertSame(['Assigned barangay personnel: Inspect the drainage inlet.', 'Assigned barangay personnel: Document the verified conditions.'], $analysis->prescriptive_steps);
        $this->assertSame('gemini', $analysis->raw_model_output['analysis_source']);
        $this->assertSame($playbook->id, $analysis->raw_model_output['response_plan']['playbook_id']);
        $this->assertNull($analysis->raw_model_output['severity_factors']['reporter_count']);
        $explanation = $analysis->triageExplanation($concern->fresh());
        $this->assertSame('medium', $explanation['base_severity']);
        $this->assertSame('medium', $explanation['current_severity']);
        $this->assertSame(['Reported: the drain is blocked.'], $explanation['evidence_summary']);
        $this->assertSame('Drainage inspection procedure', $explanation['response_plan']['playbook_title']);
        $this->assertStringContainsString('resident reports', $explanation['severity_reason']);
    }

    public function test_inactive_playbooks_do_not_replace_a_draft(): void
    {
        $this->drainagePlaybook(false);
        $this->fakeAnalysis(['suggested_category_code' => 'DRAINAGE', 'suggested_subcategory_code' => 'DRAINAGE']);
        $concern = Concern::create(['title' => 'Blocked drain', 'description' => 'Water pools in the street after rain.']);

        (new ProcessConcernWithAi($concern))->handle();

        $analysis = $concern->fresh()->currentAiAnalysis;
        $this->assertSame(['Barangay staff will inspect the reported location.'], $analysis->prescriptive_steps);
        $this->assertSame(['source' => 'gemini'], $analysis->raw_model_output['response_plan']);
    }

    public function test_local_private_analysis_can_use_the_resident_selected_playbook(): void
    {
        $this->drainagePlaybook();
        Http::fake();
        $concern = Concern::create([
            'title' => 'Blocked drain', 'description' => 'Water pools in the street after rain.',
            'category_id' => 1, 'subcategory_id' => 4, 'visibility' => 'private',
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        Http::assertNothingSent();
        $analysis = $concern->fresh()->currentAiAnalysis;
        $this->assertSame('local_rules', $analysis->raw_model_output['analysis_source']);
        $this->assertSame('playbook', $analysis->raw_model_output['response_plan']['source']);
        $this->assertSame(4, $analysis->suggested_subcategory_id);
        $this->assertNotEmpty($analysis->raw_model_output['severity_reason']);
        $this->assertSame('private', $concern->fresh()->visibility);
    }

    public function test_vawc_safeguarding_steps_are_preserved_even_when_a_playbook_exists(): void
    {
        $playbook = $this->drainagePlaybook();
        DB::table('concern_subcategories')->where('id', 4)->update(['code' => 'VAWC', 'force_private' => true]);
        $playbook->update(['steps_template' => ['Arrange a meeting with all parties.']]);
        Http::fake();
        $concern = Concern::create([
            'title' => 'Confidential assistance', 'description' => 'The details are provided confidentially to staff.',
            'category_id' => 1, 'subcategory_id' => 4,
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        Http::assertNothingSent();
        $analysis = $concern->fresh()->currentAiAnalysis;
        $this->assertSame(['source' => 'safeguarding'], $analysis->raw_model_output['response_plan']);
        $this->assertStringContainsString('VAW Desk', implode(' ', $analysis->prescriptive_steps));
        $this->assertStringNotContainsString('Arrange a meeting', implode(' ', $analysis->prescriptive_steps));
    }

    public function test_report_count_explanations_update_on_linked_reports_without_overriding_staff_severity(): void
    {
        $this->drainagePlaybook();
        $master = Concern::create(['title' => 'Drain blocked', 'description' => 'Water pools in the street.', 'status' => 'ai_processed', 'visibility' => 'public', 'severity' => 'low']);
        ConcernAiAnalysis::create([
            'concern_id' => $master->id, 'is_current' => true, 'suggested_severity' => 'low',
            'raw_model_output' => ['evidence_summary' => ['Reported: water is pooling.']],
        ]);
        $confirmed = Concern::create([
            'title' => 'Clogged drain', 'description' => 'Water pools in the street.', 'status' => 'ai_processed',
            'visibility' => 'public', 'severity' => 'low', 'severity_confirmed' => true,
        ]);
        ConcernAiAnalysis::create(['concern_id' => $confirmed->id, 'is_current' => true, 'suggested_severity' => 'low', 'duplicate_candidate_id' => $master->id]);
        $this->partialMock(ConcernDuplicateMatcher::class, function ($mock) use ($master) {
            $mock->shouldReceive('findMatch')->once()->andReturn(['candidate' => $master, 'similarity' => 0.9, 'reporter_count' => 4]);
        });
        $this->fakeAnalysis(['suggested_category_code' => 'DRAINAGE', 'suggested_subcategory_code' => 'DRAINAGE']);
        $concern = Concern::create(['title' => 'Blocked drain', 'description' => 'Water pools in the street after rain.', 'visibility' => 'public']);

        (new ProcessConcernWithAi($concern))->handle();

        $explanation = $concern->fresh()->currentAiAnalysis->triageExplanation($concern->fresh());
        $this->assertSame('medium', $explanation['base_severity']);
        $this->assertSame(4, $explanation['reporter_count']);
        $this->assertSame('high', $explanation['community_severity']);
        $this->assertSame('high', $explanation['current_severity']);
        $this->assertSame('high', $master->fresh()->severity);
        $this->assertSame(4, $master->fresh()->currentAiAnalysis->raw_model_output['severity_factors']['reporter_count']);
        $this->assertSame(['Reported: water is pooling.'], $master->fresh()->currentAiAnalysis->raw_model_output['evidence_summary']);
        $this->assertSame('low', $confirmed->fresh()->severity);
        $this->assertTrue($confirmed->fresh()->currentAiAnalysis->triageExplanation($confirmed->fresh())['staff_confirmed']);
    }

    public function test_bilingual_matching_requires_close_location_and_the_same_incident_period(): void
    {
        $this->drainagePlaybook();
        $candidate = $this->locatedReport('Clogged drainage beside the basketball court', 'Drainage blocked near the court.', 'resident-1');
        ConcernAiAnalysis::create(['concern_id' => $candidate->id, 'is_current' => true, 'suggested_category_id' => 1, 'suggested_subcategory_id' => 4]);
        $source = $this->locatedReport('Baradong kanal malapit sa court', 'Kanal barado malapit sa basketbolan.', 'resident-2');

        $match = app(ConcernDuplicateMatcher::class)->findMatch($source, 1, 4);

        $this->assertNotNull($match);
        $this->assertSame($candidate->id, $match['candidate']->id);
        $this->assertSame(2, $match['reporter_count']);
        $this->assertContains('drainage', $match['context']['shared_terms']);
        $this->assertSame('includes_submission_time', $match['context']['time_basis']);
        $this->assertSame(0.0, $match['context']['distance_meters']);

        $candidate->update(['incident_occurred_at' => '2026-10-01 08:00:00']);
        $source->update(['incident_occurred_at' => '2026-11-15 08:00:00']);
        $this->assertNull(app(ConcernDuplicateMatcher::class)->findMatch($source, 1, 4));
        $candidate->update(['incident_occurred_at' => '2026-11-15 08:00:00', 'location' => 'POINT(121.1 14.6)']);
        $this->assertNull(app(ConcernDuplicateMatcher::class)->findMatch($source, 1, 4));
    }

    public function test_matching_counts_distinct_residents_in_confirmed_merges_and_keeps_tenants_separate(): void
    {
        $this->drainagePlaybook();
        $candidate = $this->locatedReport('Clogged drainage beside the court', 'Blocked drainage near the court.', 'resident-1');
        ConcernAiAnalysis::create(['concern_id' => $candidate->id, 'is_current' => true, 'suggested_category_id' => 1, 'suggested_subcategory_id' => 4]);
        $merged = $this->locatedReport('Baradong kanal sa court', 'Kanal barado malapit sa court.', 'resident-2');
        $merged->update(['duplicate_of_id' => $candidate->id, 'status' => 'resolved']);
        $source = $this->locatedReport('Baradong kanal sa court', 'Kanal barado malapit sa court.', 'resident-2');

        $this->assertSame(2, app(ConcernDuplicateMatcher::class)->findMatch($source, 1, 4)['reporter_count']);
        $candidate->update(['barangay_id' => 'different-barangay']);
        $this->assertNull(app(ConcernDuplicateMatcher::class)->findMatch($source, 1, 4));
    }

    public function test_clarification_reanalysis_is_private_idempotent_and_keeps_analysis_history(): void
    {
        Http::fake();
        $concern = Concern::create(['title' => 'Need help', 'description' => 'Please assess this concern.', 'status' => 'under_review']);
        ConcernAiAnalysis::create(['concern_id' => $concern->id, 'is_current' => true, 'suggested_severity' => 'medium']);
        $reply = $concern->clarifications()->create(['questions' => ['What happened?'], 'response' => 'There is a fire beside the school gate.', 'answered_at' => now()]);
        $run = ConcernReanalysis::create(['concern_id' => $concern->id, 'clarification_ids' => [$reply->id], 'status' => 'queued']);
        $job = new ProcessConcernWithAi($concern, $run->id);

        $job->handle();
        $job->handle();

        Http::assertNothingSent();
        $this->assertSame('completed', $run->fresh()->status);
        $this->assertSame('critical', $concern->fresh()->severity);
        $this->assertSame(ConcernStatus::UnderReview, $concern->fresh()->status);
        $this->assertSame(2, $concern->aiAnalyses()->count());
        $this->assertSame(1, $concern->aiAnalyses()->where('is_current', true)->count());
        $analysis = $concern->fresh()->currentAiAnalysis;
        $this->assertSame('local_rules', $analysis->raw_model_output['analysis_source']);
        $this->assertSame([$reply->id], $analysis->raw_model_output['included_clarification_ids']);
        $this->assertStringNotContainsString('beside the school gate', json_encode($analysis->raw_model_output));
        $this->assertSame('Please assess this concern.', $concern->fresh()->description);
    }

    public function test_sensitive_replies_force_confidential_handling_and_staff_severity_is_preserved(): void
    {
        Http::fake();
        $concern = Concern::create(['title' => 'Need assistance', 'description' => 'Please help with this concern.', 'visibility' => 'public',
            'status' => 'under_review', 'severity' => 'high', 'severity_confirmed' => true]);
        $reply = $concern->clarifications()->create(['questions' => ['What happened?'], 'response' => 'This is domestic violence and we need confidential assistance.', 'answered_at' => now()]);
        $run = ConcernReanalysis::create(['concern_id' => $concern->id, 'clarification_ids' => [$reply->id], 'status' => 'queued']);

        (new ProcessConcernWithAi($concern, $run->id))->handle();

        Http::assertNothingSent();
        $this->assertSame('private', $concern->fresh()->visibility);
        $this->assertSame('high', $concern->fresh()->severity);
        $this->assertSame('safeguarding', $concern->fresh()->currentAiAnalysis->raw_model_output['response_plan']['source']);
        $this->assertTrue($concern->fresh()->isVawcConcern());
    }

    public function test_reanalysis_will_not_reopen_a_dispatched_concern_and_failures_hide_exception_details(): void
    {
        $concern = Concern::create(['title' => 'Need assistance', 'description' => 'Please help with this concern.', 'status' => 'active']);
        $run = ConcernReanalysis::create(['concern_id' => $concern->id, 'clarification_ids' => [], 'status' => 'queued']);
        (new ProcessConcernWithAi($concern, $run->id))->handle();
        $this->assertSame('failed', $run->fresh()->status);
        $this->assertSame(ConcernStatus::Active, $concern->fresh()->status);
        $second = ConcernReanalysis::create(['concern_id' => $concern->id, 'clarification_ids' => [], 'status' => 'queued']);
        (new ProcessConcernWithAi($concern, $second->id))->failed(new \RuntimeException('Secret exception details'));
        $this->assertSame('failed', $second->fresh()->status);
        $this->assertStringNotContainsString('Secret', $second->fresh()->error_message);
    }

    private function locatedReport(string $title, string $description, string $reporter): Concern
    {
        $concern = Concern::create(['title' => $title, 'description' => $description, 'barangay_id' => 'test-barangay',
            'reporter_id' => $reporter, 'visibility' => 'public', 'status' => 'ai_processed',
            'location' => 'POINT(120.9934 14.5173)', 'address_text' => 'Rizal Street']);
        $concern->forceFill(['created_at' => '2026-11-15 08:00:00'])->save();

        return $concern;
    }

    private function drainagePlaybook(bool $active = true): CategoryPlaybook
    {
        DB::table('concern_categories')->insert(['id' => 1, 'code' => 'DRAINAGE', 'name' => 'Flooding & Drainage', 'is_active' => true]);
        DB::table('concern_subcategories')->insert(['id' => 4, 'category_id' => 1, 'code' => 'DRAINAGE', 'name' => 'Drainage', 'is_active' => true]);

        return CategoryPlaybook::create([
            'subcategory_id' => 4, 'title' => 'Drainage inspection procedure', 'is_active' => $active,
            'steps_template' => [['step' => 1, 'task' => 'Inspect the drainage inlet.'], 'Document the verified conditions.'],
        ]);
    }

    public function test_category_realignment_updates_the_concern_and_routes_by_the_final_category(): void
    {
        DB::table('concern_categories')->insert(['id' => 9, 'code' => 'WASTE', 'name' => 'Solid Waste & Illegal Dumping', 'is_active' => true]);
        $this->fakeAnalysis(['suggested_category_code' => 'WASTE', 'category_realignment_reason' => 'The report describes uncollected garbage rather than road damage.']);
        $concern = Concern::create(['category_id' => 1, 'title' => 'Uncollected garbage', 'description' => 'Garbage has been left beside the street for a week.']);
        (new ProcessConcernWithAi($concern))->handle();
        $fresh = $concern->fresh();
        $this->assertSame(9, $fresh->category_id);
        $this->assertSame(1, $fresh->original_category_id);
        $this->assertSame('environmental', $fresh->routed_department);
        $this->assertSame(['sanitation'], $fresh->routed_roles);
        $this->assertStringContainsString('uncollected garbage', $fresh->category_realignment_reason);
    }

    public function test_ai_realignment_to_vawc_forces_private_even_when_the_ai_requests_public(): void
    {
        DB::table('concern_categories')->insert(['id' => 9, 'code' => 'VAWC', 'name' => 'VAWC & Domestic Disputes', 'is_active' => true]);
        $this->fakeAnalysis(['suggested_category_code' => 'VAWC', 'suggested_visibility' => 'public', 'category_realignment_reason' => 'The report describes a domestic dispute.']);
        $concern = Concern::create(['category_id' => 1, 'title' => 'Confidential assistance request', 'description' => 'Please review the circumstances described in the attached evidence.', 'visibility' => 'public']);
        (new ProcessConcernWithAi($concern))->handle();
        $fresh = $concern->fresh();
        $this->assertSame(9, $fresh->category_id);
        $this->assertTrue($fresh->is_vawc);
        $this->assertSame('private', $fresh->visibility);
        $this->assertSame(['vaw_desk', 'lupon'], $fresh->routed_roles);
        $fresh->update(['visibility' => 'public']);
        $this->assertSame('private', $fresh->fresh()->visibility);
        $this->assertNotContains($fresh->id, Concern::query()->publiclyDiscoverable()->pluck('id')->all());
    }

    public function test_active_emergencies_are_rejected_without_dispatch_instructions_or_routing(): void
    {
        Http::fake();
        foreach (['The house is on fire now', 'Nasusunog ang bahay ngayon', 'There is an ongoing robbery at the shop'] as $text) {
            $concern = Concern::create(['title' => $text, 'description' => 'Please send help immediately.']);
            (new ProcessConcernWithAi($concern))->handle();
            $fresh = $concern->fresh();
            $this->assertSame(ConcernStatus::Rejected, $fresh->status);
            $this->assertSame('out_of_scope', $fresh->scope_status);
            $this->assertStringContainsString('911', $fresh->closed_summary);
            $this->assertSame([], $fresh->currentAiAnalysis->prescriptive_steps);
            $this->assertNull($fresh->routed_department);
            $this->assertSame([], $fresh->routed_roles);
        }
        Http::assertNothingSent();
    }

    public function test_invalid_ai_categories_are_held_for_review(): void
    {
        $this->fakeAnalysis(['suggested_category_code' => 'FAKE_DEPARTMENT']);
        $concern = Concern::create(['category_id' => 1, 'title' => 'Community request', 'description' => 'Please review this general request.']);
        (new ProcessConcernWithAi($concern))->handle();
        $this->assertSame('needs_review', $concern->fresh()->scope_status);
        $this->assertNull($concern->fresh()->routed_department);
    }

    public function test_old_queued_analysis_cannot_overwrite_an_edited_concern(): void
    {
        Http::fake();
        $concern = Concern::create(['title' => 'Original report', 'description' => 'The street needs attention.']);
        $job = new ProcessConcernWithAi($concern);
        $concern->update(['content_revision' => 2, 'title' => 'Updated report']);
        $job->handle();
        $this->assertSame(0, $concern->aiAnalyses()->count());
        Http::assertNothingSent();
    }

    public function test_missing_ai_scope_decision_does_not_approve_a_concern(): void
    {
        $this->fakeAnalysis(['scope_decision' => null]);
        $concern = Concern::create(['category_id' => 1, 'title' => 'Road problem', 'description' => 'The sidewalk needs repairs near the school.']);
        (new ProcessConcernWithAi($concern))->handle();
        $this->assertSame('needs_review', $concern->fresh()->scope_status);
        $this->assertSame(ConcernStatus::UnderReview, $concern->fresh()->status);
    }

    private function fakeAnalysis(array $overrides = []): void
    {
        ConcernCategory::firstOrCreate(['id' => 1], ['code' => 'INFRA', 'name' => 'Road, Utility & Infrastructure', 'is_active' => true]);
        Http::fake(['https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => json_encode(array_replace([
                'detected_language' => 'mixed', 'suggested_visibility' => 'public',
                'suggested_severity' => 'medium', 'severity_confidence' => 0.9,
                'suggested_category_code' => 'INFRA', 'suggested_subcategory_code' => null,
                'scope_decision' => 'in_scope', 'scope_reason' => 'A routine non-emergency concern.', 'category_realignment_reason' => null,
                'report_quality' => 'ready_for_review', 'missing_details' => [], 'follow_up_questions' => [],
                'prescriptive_steps' => ['Barangay staff will inspect the reported location.'],
                'evidence_summary' => [], 'image_assessments' => [], 'uncertainties' => [],
            ], $overrides))]]]]],
        ])]);
    }

    public function test_it_falls_back_to_heuristic_analysis_when_ai_output_is_malformed(): void
    {
        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => ['parts' => [['text' => 'not-json']]],
                ]],
            ]),
        ]);

        $concern = Concern::create([
            'title' => 'Test concern',
            'description' => 'Test description.',
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        $this->assertDatabaseHas('concern_ai_analysis', [
            'concern_id' => $concern->id,
            'is_current' => 1,
        ]);
        $this->assertSame(ConcernStatus::UnderReview, $concern->fresh()->status);
    }

    public function test_it_sends_numbered_uploaded_images_and_persists_their_relevance_assessment(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('concerns/evidence.jpg', 'fake-image-bytes');
        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => json_encode([
                                'detected_language' => 'en',
                                'suggested_visibility' => 'public',
                                'suggested_severity' => 'medium',
                                'severity_confidence' => 0.9,
                                'suggested_category_code' => null,
                                'suggested_subcategory_code' => null,
                                'prescriptive_steps' => ['Inspect the reported location.'],
                                'suggested_duration_hours' => 72,
                                'suggested_due_date' => '2026-11-09',
                                'evidence_summary' => ['The report describes a blocked drain.'],
                                'image_assessments' => [
                                    [
                                        'image_number' => 1,
                                        'relevance' => 'unrelated',
                                        'observation' => 'A dog indoors.',
                                        'reason' => 'The image does not show a drain or flooding.',
                                    ],
                                    [
                                        'image_number' => 9,
                                        'relevance' => 'relevant',
                                        'observation' => 'Invalid image index.',
                                        'reason' => 'This assessment should be discarded.',
                                    ],
                                ],
                                'uncertainties' => [],
                            ]),
                        ]],
                    ],
                ]],
            ]),
        ]);

        $concern = Concern::create([
            'title' => 'Blocked drainage',
            'description' => 'Water is pooling on the street because the drain is blocked.',
        ]);
        DB::table('concern_media')->insert([
            'id' => (string) Str::uuid(),
            'concern_id' => $concern->id,
            'storage_key' => 'concerns/evidence.jpg',
            'mime_type' => 'image/jpeg',
            'sort_order' => 0,
            'created_at' => now(),
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        Http::assertSent(function ($request) {
            $parts = data_get($request->data(), 'contents.0.parts', []);
            $imagePart = collect($parts)->first(fn ($part) => isset($part['inlineData']));

            return str_contains($parts[0]['text'] ?? '', 'Compare EACH image separately')
                && collect($parts)->contains(fn ($part) => ($part['text'] ?? '') === 'Resident attachment image 1. Assess this image against the report narrative.')
                && base64_decode($imagePart['inlineData']['data'] ?? '', true) === 'fake-image-bytes';
        });

        $analysis = ConcernAiAnalysis::where('concern_id', $concern->id)->firstOrFail();
        $this->assertSame(1, $analysis->raw_model_output['images_analyzed_count']);
        $this->assertCount(1, $analysis->raw_model_output['image_assessments']);
        $this->assertSame('unrelated', $analysis->raw_model_output['image_assessments'][0]['relevance']);
        $this->assertSame(1, $analysis->raw_model_output['image_assessments'][0]['image_number']);
    }

    public function test_ai_cannot_make_a_vawc_concern_public(): void
    {
        DB::table('concern_categories')->insert([
            'id' => 3,
            'code' => 'SAFETY',
            'name' => 'Safety',
            'is_active' => true,
        ]);
        DB::table('concern_subcategories')->insert([
            'id' => 6,
            'category_id' => 3,
            'code' => 'VAWC',
            'name' => 'VAWC',
            'is_active' => true,
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => json_encode([
                                'detected_language' => 'en',
                                'suggested_visibility' => 'public',
                                'suggested_severity' => 'high',
                                'severity_confidence' => 0.95,
                                'suggested_category_code' => 'SAFETY',
                                'suggested_subcategory_code' => 'VAWC',
                                'prescriptive_steps' => ['Refer to the VAW Desk'],
                                'suggested_duration_hours' => 12,
                            ]),
                        ]],
                    ],
                ]],
            ]),
        ]);

        $concern = Concern::create([
            'category_id' => 3,
            'subcategory_id' => 6,
            'title' => 'Confidential report',
            'description' => 'A resident requests confidential assistance.',
            'visibility' => 'public',
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        $this->assertSame('private', $concern->fresh()->visibility);
        $this->assertDatabaseHas('concern_ai_analysis', [
            'concern_id' => $concern->id,
            'suggested_visibility' => 'private',
        ]);
    }

    public function test_sensitive_concerns_use_local_analysis_without_sending_data_to_gemini(): void
    {
        Http::fake();

        $concern = Concern::create([
            'title' => 'Domestic violence report',
            'description' => 'A resident requests confidential assistance.',
            'visibility' => 'private',
            'is_blotter_candidate' => true,
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        Http::assertNothingSent();
        $this->assertSame('private', $concern->fresh()->visibility);
        $analysis = ConcernAiAnalysis::where('concern_id', $concern->id)->firstOrFail();
        $this->assertStringContainsString('VAW Desk', implode(' ', $analysis->prescriptive_steps));
        $this->assertStringNotContainsString('Domestic violence report', json_encode($analysis->raw_model_output));
    }

    public function test_ai_cannot_make_a_force_private_noise_concern_public(): void
    {
        DB::table('concern_categories')->insert([
            'id' => 3,
            'code' => 'SAFETY',
            'name' => 'Safety',
            'is_active' => true,
        ]);
        DB::table('concern_subcategories')->insert([
            'id' => 3,
            'category_id' => 3,
            'code' => 'NOISE',
            'name' => 'Noise complaint',
            'force_private' => true,
            'is_active' => true,
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => [
                        'parts' => [[
                            'text' => json_encode([
                                'detected_language' => 'en',
                                'suggested_visibility' => 'public',
                                'suggested_severity' => 'low',
                                'severity_confidence' => 0.95,
                                'suggested_category_code' => 'SAFETY',
                                'suggested_subcategory_code' => 'NOISE',
                                'prescriptive_steps' => ['Refer to Peace & Order'],
                                'suggested_duration_hours' => 12,
                            ]),
                        ]],
                    ],
                ]],
            ]),
        ]);

        $concern = Concern::create([
            'category_id' => 3,
            'title' => 'Late-night noise complaint',
            'description' => 'Loud music continues after curfew.',
            'visibility' => 'public',
        ]);

        (new ProcessConcernWithAi($concern))->handle();

        $freshConcern = $concern->fresh();
        $this->assertSame('private', $freshConcern->visibility);
        $this->assertTrue($freshConcern->isSensitiveConcern());
        $this->assertFalse($freshConcern->isVawcConcern());
    }
}
