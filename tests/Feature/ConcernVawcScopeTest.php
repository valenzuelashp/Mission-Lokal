<?php

namespace Tests\Feature;

use App\Models\Concern;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class ConcernVawcScopeTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('visibility')->default('public');
            $table->string('status')->default('ai_processed');
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->boolean('is_blotter_candidate')->default(false);
        });
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->string('code');
            $table->boolean('force_private')->default(false);
        });
        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('concern_id');
            $table->unsignedSmallInteger('suggested_subcategory_id')->nullable();
            $table->boolean('is_current')->default(true);
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('concern_ai_analysis');
        Schema::dropIfExists('concern_subcategories');
        Schema::dropIfExists('concerns');

        parent::tearDown();
    }

    public function test_non_vawc_private_reports_are_not_filtered_as_vawc(): void
    {
        DB::table('concern_subcategories')->insert([
            ['id' => 3, 'code' => 'NOISE'],
            ['id' => 6, 'code' => 'VAWC'],
        ]);

        $noiseId = $this->createConcern('Private videoke complaint', 'Loud music past curfew.', 3, true);
        $directVawcId = $this->createConcern('Confidential report', 'Details withheld.', 6, true);
        $aiVawcId = $this->createConcern('Confidential report', 'Details withheld.', null, true);
        DB::table('concern_ai_analysis')->insert([
            'id' => (string) Str::uuid(),
            'concern_id' => $aiVawcId,
            'suggested_subcategory_id' => 6,
            'is_current' => true,
        ]);
        $textVawcId = $this->createConcern('Domestic violence concern', 'Details withheld.', null, false);

        $visibleConcernIds = Concern::query()->whereNotVawc()->pluck('id')->all();

        $this->assertSame([$noiseId], $visibleConcernIds);
        $this->assertNotContains($directVawcId, $visibleConcernIds);
        $this->assertNotContains($aiVawcId, $visibleConcernIds);
        $this->assertNotContains($textVawcId, $visibleConcernIds);
    }

    public function test_public_discovery_waits_for_ai_triage_and_excludes_force_private_cases(): void
    {
        DB::table('concern_subcategories')->insert([
            ['id' => 3, 'code' => 'NOISE', 'force_private' => true],
        ]);

        $pendingId = $this->createConcern('Pending report', 'Awaiting local triage.', null, false);
        DB::table('concerns')->where('id', $pendingId)->update(['status' => 'submitted']);
        $publicId = $this->createConcern('Public report', 'A pothole needs repair.', null, false);
        $privateId = $this->createConcern('Private report', 'Details withheld.', null, false);
        DB::table('concerns')->where('id', $privateId)->update(['visibility' => 'private']);
        $forcePrivateId = $this->createConcern('Noise report', 'A private noise report.', 3, false);

        $visibleIds = Concern::query()->publiclyDiscoverable()->pluck('id')->all();

        $this->assertSame([$publicId], $visibleIds);
        $this->assertNotContains($pendingId, $visibleIds);
        $this->assertNotContains($privateId, $visibleIds);
        $this->assertNotContains($forcePrivateId, $visibleIds);
    }

    public function test_local_vawc_detection_recognizes_common_sensitive_phrasing(): void
    {
        $this->assertTrue(Concern::isVawcReport(null, 'Domestic conflict', 'A resident needs help.'));
        $this->assertTrue(Concern::isVawcReport(null, 'May pananakit sa asawa', 'Kailangan ng tulong.'));
        $this->assertTrue(Concern::isVawcReport(null, 'Sexual assault report', 'Details withheld.'));
    }

    private function createConcern(string $title, string $description, ?int $subcategoryId, bool $isBlotterCandidate): string
    {
        $id = (string) Str::uuid();
        DB::table('concerns')->insert([
            'id' => $id,
            'title' => $title,
            'description' => $description,
            'subcategory_id' => $subcategoryId,
            'is_blotter_candidate' => $isBlotterCandidate,
        ]);

        return $id;
    }
}
