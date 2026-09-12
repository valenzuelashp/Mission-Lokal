<?php

namespace Tests\Feature\Ai;

use App\Enums\ConcernStatus;
use App\Jobs\Ai\ProcessConcernWithAi;
use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Tests\TestCase;

class ProcessConcernWithAiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedSmallInteger('category_id')->nullable();
            $table->uuid('barangay_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('severity')->nullable();
            $table->string('visibility')->nullable();
            $table->string('status')->default('submitted');
            $table->timestamp('ai_processed_at')->nullable();
            $table->timestamps();
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
        ]);
        $this->assertSame(ConcernStatus::AiProcessed, $concern->fresh()->status);
        $this->assertSame('high', $concern->fresh()->severity);
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
}