<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\ResidentController;
use App\Http\Controllers\Resident\ProfileController;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Support\Header;
use Inertia\Response as InertiaResponse;
use Tests\TestCase;

class AdminCivicRecognitionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::dropIfExists('resident_badges');
        Schema::dropIfExists('resident_profiles');
        Schema::dropIfExists('users');
        Schema::dropIfExists('barangays');
        Schema::dropIfExists('civic_xp_monthly_rankings');

        Schema::create('barangays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code');
            $table->string('name');
            $table->timestamps();
        });
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id')->nullable();
            $table->string('account_id');
            $table->string('role');
            $table->string('first_name');
            $table->string('last_name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('resident_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->unsignedInteger('civic_xp')->default(50);
            $table->string('verification_status');
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
        });
        Schema::create('civic_xp_monthly_rankings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->uuid('user_id');
            $table->char('month', 7);
            $table->string('account_id');
            $table->string('resident_name');
            $table->unsignedSmallInteger('civic_xp');
            $table->unsignedInteger('rank_position');
            $table->json('badges');
            $table->timestamp('snapshot_at');
            $table->unique(['barangay_id', 'month', 'user_id']);
        });
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        Schema::dropIfExists('resident_badges');
        Schema::dropIfExists('civic_xp_events');
        Schema::dropIfExists('civic_xp_monthly_rankings');
        Schema::dropIfExists('resident_profiles');
        Schema::dropIfExists('users');
        Schema::dropIfExists('barangays');
        parent::tearDown();
    }

    public function test_civic_ranking_maps_residents_and_persisted_badges(): void
    {
        Carbon::setTestNow('2026-11-07 10:00:00');
        $barangayId = (string) Str::uuid();
        $admin = new User();
        $admin->setAttribute('barangay_id', $barangayId);
        $residentId = (string) Str::uuid();
        $badgeId = (string) Str::uuid();

        DB::table('barangays')->insert([
            'id' => $barangayId,
            'code' => 'TEST-01',
            'name' => 'Test Barangay',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id' => $residentId,
            'barangay_id' => $barangayId,
            'account_id' => 'RES-001',
            'role' => 'resident',
            'first_name' => 'Civic',
            'last_name' => 'Leader',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('resident_profiles')->insert([
            'user_id' => $residentId,
            'civic_xp' => 50,
            'verification_status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $inactiveForMonthId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $inactiveForMonthId,
            'barangay_id' => $barangayId,
            'account_id' => 'RES-003',
            'role' => 'resident',
            'first_name' => 'No',
            'last_name' => 'Activity',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('resident_profiles')->insert([
            'user_id' => $inactiveForMonthId,
            'civic_xp' => 50,
            'verification_status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('resident_badges')->insert([
            'id' => $badgeId,
            'user_id' => $residentId,
            'badge_key' => 'civic-spark',
            'name' => 'Civic Spark',
            'threshold' => 60,
            'earned_xp' => 60,
            'earned_at' => Carbon::parse('2026-10-15 12:00:00'),
        ]);
        DB::table('civic_xp_events')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $residentId,
            'barangay_id' => $barangayId,
            'action' => 'valid_report',
            'points' => 15,
            'reference_type' => 'concern',
            'reference_id' => (string) Str::uuid(),
            'created_at' => Carbon::parse('2026-10-16 12:00:00'),
        ]);

        $request = Request::create('/admin/civic-recognition?month=2026-10');
        $request->headers->set(Header::INERTIA, 'true');
        $request->setUserResolver(fn () => $admin);
        $response = app(ResidentController::class)->civicRecognition($request);
        $page = $response->toResponse($request)->getData(true);

        self::assertInstanceOf(InertiaResponse::class, $response);
        self::assertSame('2026-10', $page['props']['month']);
        self::assertSame('reconstructed', $page['props']['ranking_source']);
        self::assertTrue($page['props']['ranking_has_activity']);
        self::assertCount(1, $page['props']['residents']);
        self::assertSame(65, $page['props']['residents'][0]['civic_xp']);
        self::assertSame('Civic Spark', $page['props']['residents'][0]['badges'][0]['name']);
        self::assertSame(1, DB::table('civic_xp_monthly_rankings')->where('month', '2026-10')->count());

        $archivedResponse = app(ResidentController::class)->civicRecognition($request);
        $archivedPage = $archivedResponse->toResponse($request)->getData(true);
        self::assertSame('snapshot', $archivedPage['props']['ranking_source']);
        self::assertSame(65, $archivedPage['props']['residents'][0]['civic_xp']);

        $adminCertificateRequest = Request::create('/admin/civic-recognition/'.$residentId.'/certificate', 'GET', [
            'month' => '2026-10',
            'badge_id' => $badgeId,
        ]);
        $adminCertificateRequest->setUserResolver(fn () => $admin);
        $adminCertificate = app(ResidentController::class)->civicCertificate($adminCertificateRequest, $residentId);
        self::assertStringStartsWith('%PDF-', $adminCertificate->getContent());

        $resident = User::query()->findOrFail($residentId);
        $residentCertificateRequest = Request::create('/profile/civic-certificates/'.$badgeId);
        $residentCertificateRequest->setUserResolver(fn () => $resident);
        $residentCertificate = app(ProfileController::class)->civicCertificateForBadge($residentCertificateRequest, $badgeId);
        self::assertStringStartsWith('%PDF-', $residentCertificate->getContent());
    }

    public function test_month_selector_has_a_twelve_month_range_without_xp_history(): void
    {
        Carbon::setTestNow('2026-11-07 10:00:00');
        $barangayId = (string) Str::uuid();
        $admin = new User();
        $admin->setAttribute('barangay_id', $barangayId);
        DB::table('users')->insert([
            'id' => (string) Str::uuid(),
            'barangay_id' => $barangayId,
            'account_id' => 'RES-004',
            'role' => 'resident',
            'first_name' => 'Baseline',
            'last_name' => 'Only',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $baselineResident = DB::table('users')->where('account_id', 'RES-004')->value('id');
        DB::table('resident_profiles')->insert([
            'user_id' => $baselineResident,
            'civic_xp' => 50,
            'verification_status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $request = Request::create('/admin/civic-recognition');
        $request->headers->set(Header::INERTIA, 'true');
        $request->setUserResolver(fn () => $admin);

        $response = app(ResidentController::class)->civicRecognition($request);
        $page = $response->toResponse($request)->getData(true);

        self::assertCount(12, $page['props']['months']);
        self::assertSame('2025-12', $page['props']['months'][0]['value']);
        self::assertSame('2026-11', $page['props']['months'][11]['value']);
        self::assertFalse($page['props']['ranking_has_activity']);
        self::assertSame([], $page['props']['residents']);
    }

    public function test_monthly_reset_archives_the_closed_month_before_resetting_xp(): void
    {
        Carbon::setTestNow('2026-11-01 00:01:00');
        $barangayId = (string) Str::uuid();
        $residentId = (string) Str::uuid();

        DB::table('barangays')->insert([
            'id' => $barangayId,
            'code' => 'TEST-02',
            'name' => 'Archive Test Barangay',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('users')->insert([
            'id' => $residentId,
            'barangay_id' => $barangayId,
            'account_id' => 'RES-002',
            'role' => 'resident',
            'first_name' => 'Archive',
            'last_name' => 'Resident',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('resident_profiles')->insert([
            'user_id' => $residentId,
            'civic_xp' => 68,
            'verification_status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('civic_xp_events')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $residentId,
            'barangay_id' => $barangayId,
            'action' => 'valid_report',
            'points' => 18,
            'reference_type' => 'concern',
            'reference_id' => (string) Str::uuid(),
            'created_at' => Carbon::parse('2026-10-15 12:00:00'),
        ]);

        Artisan::call('civic-xp:monthly-reset');

        $snapshot = DB::table('civic_xp_monthly_rankings')
            ->where('barangay_id', $barangayId)
            ->where('month', '2026-10')
            ->first();
        self::assertNotNull($snapshot);
        self::assertSame(68, (int) $snapshot->civic_xp);
        self::assertSame(50, (int) DB::table('resident_profiles')->where('user_id', $residentId)->value('civic_xp'));
    }
}