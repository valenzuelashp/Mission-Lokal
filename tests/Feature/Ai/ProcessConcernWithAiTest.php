<?php

namespace Tests\Feature\Ai;

use App\Enums\ConcernStatus;
use App\Jobs\Ai\ProcessConcernWithAi;
use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProcessConcernWithAiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedSmallInteger('category_id')->nullable();
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->uuid('barangay_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('severity')->nullable();
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

        Schema::create('concern_ai_analysis', function (Blueprint $table) {
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
    }

    protected function tearDown(): void
    {
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
        \App\Models\ConcernCategory::create([
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
            app(\App\Services\Concerns\ConcernResolutionDeadline::class)->deadlineFor($concern, 'high')->toDateString(),
            ConcernAiAnalysis::where('concern_id', $concern->id)->first()->suggested_due_date->toDateString(),
        );
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
        $this->assertSame(ConcernStatus::AiProcessed, $concern->fresh()->status);
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