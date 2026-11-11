<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\AnalyticsController;
use App\Models\Mission;
use App\Models\User;
use App\Services\DashboardAnalytics;
use App\Support\MissionWorkload;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Support\Header;
use Tests\TestCase;

class DashboardAnalyticsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-11 12:00:00');
        CarbonImmutable::setTestNow('2026-11-11 12:00:00');

        Schema::create('concern_categories', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
        });
        Schema::create('concerns', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('barangay_id')->nullable();
            $table->string('category_id')->nullable();
            $table->string('severity')->nullable();
            $table->timestamp('created_at');
        });
        Schema::create('missions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('barangay_id')->nullable();
            $table->string('concern_id');
            $table->string('status');
            $table->string('department')->nullable();
            $table->date('due_date')->nullable();
            $table->boolean('is_overdue')->default(false);
            $table->timestamp('created_at');
            $table->timestamp('verified_at')->nullable();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('missions');
        Schema::dropIfExists('concerns');
        Schema::dropIfExists('concern_categories');
        Carbon::setTestNow();
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    public function test_default_and_preset_periods_include_today_and_use_the_application_timezone(): void
    {
        $analytics = new DashboardAnalytics;
        foreach ([null => 30, '7' => 7, '90' => 90] as $range => $days) {
            $request = Request::create('/admin/analytics', 'GET', $range ? ['analytics_range' => (string) $range] : []);
            $period = $analytics->period($request);

            self::assertSame(CarbonImmutable::today()->subDays($days - 1)->toDateString(), $period['start']);
            self::assertSame('2026-11-11', $period['end']);
            self::assertSame(config('app.timezone'), $period['timezone']);
        }
    }

    public function test_filters_reject_invalid_ranges_dates_and_excessive_spans(): void
    {
        $invalid = [
            ['analytics_range' => '365'],
            ['analytics_range' => 'custom'],
            ['analytics_range' => 'custom', 'analytics_start' => '2026-02-30', 'analytics_end' => '2026-03-02'],
            ['analytics_range' => 'custom', 'analytics_start' => '2026-11-03', 'analytics_end' => '2026-11-01'],
            ['analytics_range' => 'custom', 'analytics_start' => '2026-11-11', 'analytics_end' => '2026-11-12'],
            ['analytics_range' => 'custom', 'analytics_start' => '2025-01-01', 'analytics_end' => '2026-11-11'],
        ];

        foreach ($invalid as $filters) {
            try {
                (new DashboardAnalytics)->period(Request::create('/admin/analytics', 'GET', $filters));
                self::fail('Invalid analytics filters were accepted: '.json_encode($filters));
            } catch (ValidationException $exception) {
                self::assertNotEmpty($exception->errors());
            }
        }
    }

    public function test_analytics_has_its_own_admin_protected_route(): void
    {
        $route = app('router')->getRoutes()->getByName('admin.analytics');

        self::assertNotNull($route);
        self::assertSame('admin/analytics', $route->uri());
        self::assertSame(AnalyticsController::class.'@index', $route->getActionName());
        self::assertContains('auth', $route->middleware());
        self::assertContains('role:admin', $route->middleware());
    }

    public function test_analytics_page_and_partial_reload_work_without_dashboard_queue_tables(): void
    {
        $this->concern('a', '2026-11-10 12:00:00');
        $this->concern('a', '2026-10-01 12:00:00');
        $admin = new User;
        $admin->setAttribute('barangay_id', 'a');

        foreach ([false, true] as $partial) {
            $request = Request::create('/admin/analytics', 'GET', ['analytics_range' => '7']);
            $request->setUserResolver(fn () => $admin);
            $request->headers->set(Header::INERTIA, 'true');
            if ($partial) {
                $request->headers->set(Header::PARTIAL_COMPONENT, 'Admin/Analytics');
                $request->headers->set(Header::PARTIAL_ONLY, 'analytics');
            }

            $response = app(AnalyticsController::class)->index($request, app(DashboardAnalytics::class));
            $page = $response->toResponse($request)->getData(true);

            self::assertSame('Admin/Analytics', $page['component']);
            self::assertSame('2026-11-05', $page['props']['analytics']['period']['start']);
            self::assertSame(1, $page['props']['analytics']['summary']['reports_received']);
            self::assertArrayNotHasKey('stats', $page['props']);
            self::assertArrayNotHasKey('incidents', $page['props']);
        }
    }

    public function test_aggregates_include_day_boundaries_and_isolate_barangays_and_mission_ownership(): void
    {
        DB::table('concern_categories')->insert(['id' => 'safety', 'name' => 'Public safety']);
        $first = $this->concern('a', '2026-11-01 00:00:00', 'critical', 'safety');
        $last = $this->concern('a', '2026-11-03 23:59:59.999', 'high', 'safety');
        $this->concern('a', '2026-11-02 12:00:00', null);
        $old = $this->concern('a', '2026-10-31 23:59:59');
        $this->concern('a', '2026-11-04 00:00:00');
        $foreign = $this->concern('b', '2026-11-02 12:00:00');

        $this->mission('a', $first, 'verified', '2026-11-01 00:00:00', '2026-11-03 00:00:00');
        $this->mission('a', $old, 'verified', '2026-10-31 12:00:00', '2026-11-02 12:00:00');
        $this->mission('a', $last, 'completed', '2026-11-03 23:59:59.999');
        $this->mission('a', $old, 'in_progress', '2026-11-02 12:00:00');
        $this->mission('a', $old, 'verified', '2026-10-30 00:00:00', '2026-11-04 00:00:00');
        $this->mission('b', $foreign, 'verified', '2026-11-01 00:00:00', '2026-11-02 12:00:00');
        $this->mission('a', $foreign, 'verified', '2026-11-01 00:00:00', '2026-11-02 12:00:00');
        $this->mission('b', $first, 'verified', '2026-11-01 00:00:00', '2026-11-02 12:00:00');

        $data = $this->analytics('a');

        self::assertSame([
            'reports_received' => 3,
            'missions_created' => 3,
            'missions_verified' => 2,
            'average_verification_hours' => 48.0,
        ], $data['summary']);
        self::assertSame([
            ['date' => '2026-11-01', 'reports' => 1, 'verified' => 0],
            ['date' => '2026-11-02', 'reports' => 1, 'verified' => 1],
            ['date' => '2026-11-03', 'reports' => 1, 'verified' => 1],
        ], $data['trend']);
        self::assertSame([
            ['name' => 'Public safety', 'count' => 2],
            ['name' => 'Unclassified', 'count' => 1],
        ], $data['categories']);
        self::assertSame(['critical' => 1, 'high' => 1, 'medium' => 0, 'low' => 0, 'unclassified' => 1], array_column($data['severities'], 'count', 'severity'));
        self::assertSame(['assigned' => 0, 'acknowledged' => 0, 'in_progress' => 1, 'completed' => 1, 'verified' => 1, 'cancelled' => 0], array_column($data['statuses'], 'count', 'status'));
    }

    public function test_empty_periods_have_zero_filled_days_and_no_fabricated_average(): void
    {
        $data = $this->analytics('empty');

        self::assertSame(0, $data['summary']['reports_received']);
        self::assertSame(0, $data['summary']['missions_created']);
        self::assertSame(0, $data['summary']['missions_verified']);
        self::assertNull($data['summary']['average_verification_hours']);
        self::assertCount(3, $data['trend']);
        self::assertSame(0, array_sum(array_column($data['trend'], 'reports')));
        self::assertSame(0, array_sum(array_column($data['trend'], 'verified')));
        self::assertSame([], $data['categories']);
    }

    public function test_missing_tenant_does_not_expose_unassigned_records(): void
    {
        $concern = $this->concern(null, '2026-11-01 00:00:00');
        $this->mission(null, $concern, 'verified', '2026-11-01 00:00:00', '2026-11-02 00:00:00');

        $data = $this->analytics(null);
        self::assertSame(0, $data['summary']['reports_received']);
        self::assertSame(0, $data['summary']['missions_created']);
        self::assertSame(0, $data['summary']['missions_verified']);
    }

    public function test_single_day_periods_include_the_last_second_and_ignore_invalid_durations(): void
    {
        $concern = $this->concern('a', '2026-11-01 23:59:59.999', 'unknown');
        $this->mission('a', $concern, 'verified', '2026-11-02 00:00:00', '2026-11-01 23:59:59.999');
        $service = new DashboardAnalytics;
        $period = $service->period(Request::create('/admin/analytics', 'GET', [
            'analytics_range' => 'custom', 'analytics_start' => '2026-11-01', 'analytics_end' => '2026-11-01',
        ]));
        $data = $service->forBarangay('a', $period);

        self::assertCount(1, $data['trend']);
        self::assertSame(1, $data['summary']['reports_received']);
        self::assertSame(1, $data['summary']['missions_verified']);
        self::assertNull($data['summary']['average_verification_hours']);
        self::assertSame(1, $data['severities'][4]['count']);
    }

    public function test_comparisons_use_the_preceding_equal_length_period_and_exclude_other_barangays(): void
    {
        $first = $this->concern('a', '2026-10-29 00:00:00');
        $last = $this->concern('a', '2026-10-31 23:59:59.999');
        $this->concern('a', '2026-10-28 23:59:59.999');
        $current = $this->concern('a', '2026-11-01 00:00:00');
        $foreign = $this->concern('b', '2026-10-30 12:00:00');

        $this->mission('a', $first, 'verified', '2026-10-29 00:00:00', '2026-10-30 00:00:00');
        $this->mission('a', $last, 'verified', '2026-10-30 00:00:00', '2026-10-31 00:00:00');
        $this->mission('a', $current, 'verified', '2026-11-01 00:00:00', '2026-11-01 12:00:00');
        $this->mission('b', $foreign, 'verified', '2026-10-29 00:00:00', '2026-10-30 00:00:00');
        $this->mission('a', $foreign, 'verified', '2026-10-29 00:00:00', '2026-10-30 00:00:00');

        $data = $this->analytics('a');

        self::assertSame(['start' => '2026-10-29', 'end' => '2026-10-31'], $data['comparison']['period']);
        self::assertSame([
            'reports_received' => 2,
            'missions_created' => 2,
            'missions_verified' => 2,
            'average_verification_hours' => 24.0,
        ], $data['comparison']['summary']);
        self::assertSame([
            'reports_received' => 1,
            'missions_created' => 1,
            'missions_verified' => 1,
            'average_verification_hours' => 12.0,
        ], $data['summary']);
    }

    public function test_empty_previous_periods_return_zero_counts_and_no_average(): void
    {
        $data = $this->analytics('a');

        self::assertSame([
            'reports_received' => 0,
            'missions_created' => 0,
            'missions_verified' => 0,
            'average_verification_hours' => null,
        ], $data['comparison']['summary']);
        self::assertSame(['active' => 0, 'overdue' => 0, 'awaiting_verification' => 0], $data['workload']['totals']);
        self::assertSame([], $data['workload']['departments']);
    }

    public function test_current_workload_uses_exclusive_buckets_normalizes_departments_and_ignores_the_date_filter(): void
    {
        $concern = $this->concern('a', '2026-10-01 00:00:00');
        $foreign = $this->concern('b', '2026-10-01 00:00:00');
        $this->mission('a', $concern, 'assigned', '2026-10-01 00:00:00', null, 'Environmental', '2026-11-12');
        $this->mission('a', $concern, 'acknowledged', '2026-10-01 00:00:00', null, ' Environmental ', '2026-11-11');
        $this->mission('a', $concern, 'in_progress', '2026-10-01 00:00:00', null, 'environmental', '2026-11-10');
        $this->mission('a', $concern, 'completed', '2026-10-01 00:00:00', null, 'Environmental', '2026-11-01', true);
        $this->mission('a', $concern, 'assigned', '2026-10-01 00:00:00');
        $this->mission('a', $concern, 'assigned', '2026-10-01 00:00:00', null, 'maintenance', null, true);
        $this->mission('a', $concern, 'verified', '2026-10-01 00:00:00', '2026-10-02 00:00:00', 'Environmental', '2026-11-01', true);
        $this->mission('a', $concern, 'cancelled', '2026-10-01 00:00:00', null, 'Environmental', '2026-11-01', true);
        $this->mission('b', $foreign, 'assigned', '2026-10-01 00:00:00', null, 'Environmental', null, true);
        $this->mission('a', $foreign, 'completed', '2026-10-01 00:00:00', null, 'Environmental');
        $this->mission('b', $concern, 'completed', '2026-10-01 00:00:00', null, 'Environmental');

        $data = $this->analytics('a');
        self::assertSame(0, $data['summary']['missions_created']);
        self::assertSame(['active' => 3, 'overdue' => 2, 'awaiting_verification' => 1], $data['workload']['totals']);
        self::assertSame([
            ['name' => 'Environmental', 'active' => 2, 'overdue' => 1, 'awaiting_verification' => 1, 'total' => 4],
            ['name' => 'Maintenance', 'active' => 0, 'overdue' => 1, 'awaiting_verification' => 0, 'total' => 1],
            ['name' => 'Unassigned', 'active' => 1, 'overdue' => 0, 'awaiting_verification' => 0, 'total' => 1],
        ], $data['workload']['departments']);

        $service = new DashboardAnalytics;
        $otherPeriod = $service->period(Request::create('/admin/analytics', 'GET', ['analytics_range' => '7']));
        self::assertSame($data['workload'], $service->forBarangay('a', $otherPeriod)['workload']);
        self::assertSame(['active' => 0, 'overdue' => 0, 'awaiting_verification' => 0], $this->analytics(null)['workload']['totals']);
    }

    public function test_mission_queue_past_due_classification_matches_workload_buckets(): void
    {
        foreach (['assigned', 'acknowledged', 'in_progress'] as $status) {
            self::assertTrue(MissionWorkload::isPastDue(new Mission(['status' => $status, 'due_date' => '2026-11-10'])));
            self::assertFalse(MissionWorkload::isPastDue(new Mission(['status' => $status, 'due_date' => '2026-11-11'])));
            self::assertFalse(MissionWorkload::isPastDue(new Mission(['status' => $status, 'due_date' => null])));
            self::assertTrue(MissionWorkload::isPastDue(new Mission(['status' => $status, 'due_date' => null, 'is_overdue' => true])));
        }
        foreach (['completed', 'verified', 'cancelled'] as $status) {
            self::assertFalse(MissionWorkload::isPastDue(new Mission(['status' => $status, 'due_date' => '2026-11-01', 'is_overdue' => true])));
        }
        self::assertFalse(MissionWorkload::isPastDue(null));
    }

    private function analytics(?string $barangayId): array
    {
        $service = new DashboardAnalytics;

        return $service->forBarangay($barangayId, $service->period(Request::create('/admin/analytics', 'GET', [
            'analytics_range' => 'custom', 'analytics_start' => '2026-11-01', 'analytics_end' => '2026-11-03',
        ])));
    }

    private function concern(?string $barangayId, string $created, ?string $severity = 'low', ?string $category = null): string
    {
        $id = (string) Str::uuid();
        DB::table('concerns')->insert([
            'id' => $id, 'barangay_id' => $barangayId, 'created_at' => $created,
            'severity' => $severity, 'category_id' => $category,
        ]);

        return $id;
    }

    private function mission(?string $barangayId, string $concernId, string $status, string $created, ?string $verified = null, ?string $department = null, ?string $dueDate = null, bool $overdue = false): void
    {
        DB::table('missions')->insert([
            'id' => (string) Str::uuid(), 'barangay_id' => $barangayId, 'concern_id' => $concernId,
            'status' => $status, 'created_at' => $created, 'verified_at' => $verified,
            'department' => $department, 'due_date' => $dueDate, 'is_overdue' => $overdue,
        ]);
    }
}
