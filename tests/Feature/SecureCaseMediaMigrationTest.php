<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecureCaseMediaMigrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedSmallInteger('category_id')->nullable();
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->string('visibility')->default('public');
            $table->boolean('is_blotter_candidate')->default(false);
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('address_text')->nullable();
        });
        Schema::create('concern_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->string('storage_key');
        });
        Schema::create('missions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
        });
        Schema::create('mission_proof', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id');
        });
        Schema::create('mission_proof_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('proof_id');
            $table->string('storage_key');
        });
        Schema::create('mission_resolution_posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('mission_id');
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
        });

        Storage::fake('public');
        Storage::fake('local');
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('mission_resolution_posts');
        Schema::dropIfExists('mission_proof_media');
        Schema::dropIfExists('mission_proof');
        Schema::dropIfExists('missions');
        Schema::dropIfExists('concern_media');
        Schema::dropIfExists('concerns');

        parent::tearDown();
    }

    public function test_it_removes_all_case_media_from_public_storage(): void
    {
        $concernId = '00000000-0000-4000-8000-000000000001';
        $concernMediaId = '00000000-0000-4000-8000-000000000002';
        $missionId = '00000000-0000-4000-8000-000000000003';
        $proofId = '00000000-0000-4000-8000-000000000004';
        $proofMediaId = '00000000-0000-4000-8000-000000000005';

        DB::table('concerns')->insert([
            'id' => $concernId,
            'visibility' => 'public',
            'title' => 'Public concern',
            'description' => 'Public concern description.',
        ]);
        DB::table('concern_media')->insert([
            'id' => $concernMediaId,
            'concern_id' => $concernId,
            'storage_key' => 'concerns/old-report.jpg',
        ]);
        DB::table('missions')->insert([
            'id' => $missionId,
            'concern_id' => $concernId,
        ]);
        DB::table('mission_proof')->insert([
            'id' => $proofId,
            'mission_id' => $missionId,
        ]);
        DB::table('mission_proof_media')->insert([
            'id' => $proofMediaId,
            'proof_id' => $proofId,
            'storage_key' => 'proofs/old-proof.jpg',
        ]);
        Storage::disk('public')->put('concerns/old-report.jpg', 'report image');
        Storage::disk('public')->put('proofs/old-proof.jpg', 'proof image');

        $migration = require database_path('migrations/2026_10_31_000001_secure_private_case_media.php');
        $migration->up();

        $reportPath = DB::table('concern_media')->where('id', $concernMediaId)->value('storage_key');
        $proofPath = DB::table('mission_proof_media')->where('id', $proofMediaId)->value('storage_key');

        $this->assertStringStartsWith('private/concerns/', $reportPath);
        $this->assertStringStartsWith('private/proofs/', $proofPath);
        Storage::disk('public')->assertMissing('concerns/old-report.jpg');
        Storage::disk('public')->assertMissing('proofs/old-proof.jpg');
        Storage::disk('local')->assertExists($reportPath);
        Storage::disk('local')->assertExists($proofPath);
    }
}
