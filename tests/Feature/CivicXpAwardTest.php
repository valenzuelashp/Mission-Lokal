<?php

namespace Tests\Feature;

use App\Models\ResidentProfile;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class CivicXpAwardTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::dropIfExists('civic_xp_events');
        Schema::dropIfExists('resident_badges');
        Schema::dropIfExists('resident_profiles');
        Schema::dropIfExists('barangays');
        Schema::create('barangays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code');
        });
        Schema::create('resident_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->unsignedInteger('civic_xp')->default(50);
            $table->timestamps();
        });
        Schema::create('resident_badges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('badge_key');
            $table->string('name');
            $table->unsignedSmallInteger('threshold');
            $table->unsignedSmallInteger('earned_xp');
            $table->timestamp('earned_at');
            $table->unique(['user_id', 'badge_key']);
        });
        Schema::create('civic_xp_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('barangay_id');
            $table->string('action');
            $table->integer('points');
            $table->string('reference_type');
            $table->char('reference_id', 36);
            $table->timestamp('created_at');
            $table->unique(['user_id', 'action', 'reference_type', 'reference_id']);
        });
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_valid_reports_can_award_multiple_times_per_day_but_only_once_per_concern(): void
    {
        Carbon::setTestNow('2026-11-07 10:00:00');
        $profile = ResidentProfile::query()->create([
            'user_id' => (string) Str::uuid(),
            'civic_xp' => 50,
        ]);
        $barangayId = (string) Str::uuid();

        $firstConcernId = (string) Str::uuid();
        $profile->awardXp('valid_report', 5, 'concern', $firstConcernId, $barangayId);
        $profile->awardXp('valid_report', 5, 'concern', $firstConcernId, $barangayId);
        $profile->awardXp('valid_report', 3, 'concern', (string) Str::uuid(), $barangayId);

        self::assertSame(58, (int) $profile->fresh()->civic_xp);
        self::assertSame(2, DB::table('civic_xp_events')->where('user_id', $profile->user_id)->count());

        $spamConcernId = (string) Str::uuid();
        $profile->penalize('report_spam', 15, 'concern', $spamConcernId, $barangayId);
        $profile->penalize('report_spam', 15, 'concern', $spamConcernId, $barangayId);

        self::assertSame(43, (int) $profile->fresh()->civic_xp);
        self::assertSame(-15, (int) DB::table('civic_xp_events')->where('action', 'report_spam')->value('points'));
    }

    public function test_monthly_xp_is_capped_and_badges_are_permanent(): void
    {
        Carbon::setTestNow('2026-11-07 10:00:00');
        $profile = ResidentProfile::query()->create([
            'user_id' => (string) Str::uuid(),
            'civic_xp' => 99,
        ]);

        $profile->awardXp('valid_report', 2, 'concern', (string) Str::uuid(), (string) Str::uuid());

        self::assertSame(100, (int) $profile->fresh()->civic_xp);
        self::assertSame(1, (int) DB::table('civic_xp_events')->where('user_id', $profile->user_id)->value('points'));
        self::assertSame(5, DB::table('resident_badges')->where('user_id', $profile->user_id)->count());

        Artisan::call('civic-xp:monthly-reset');

        self::assertSame(50, (int) $profile->fresh()->civic_xp);
        self::assertSame(5, DB::table('resident_badges')->where('user_id', $profile->user_id)->count());
    }
}