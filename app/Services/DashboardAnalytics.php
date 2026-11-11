<?php

namespace App\Services;

use App\Enums\MissionStatus;
use App\Enums\PersonnelDepartment;
use App\Support\MissionWorkload;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DashboardAnalytics
{
    public function period(Request $request): array
    {
        $validated = $request->validate([
            'analytics_range' => ['nullable', 'in:7,30,90,custom'],
            'analytics_start' => ['required_if:analytics_range,custom', 'nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'analytics_end' => ['required_if:analytics_range,custom', 'nullable', 'date_format:Y-m-d', 'before_or_equal:today', 'after_or_equal:analytics_start'],
        ]);

        $range = $validated['analytics_range'] ?? '30';
        $today = CarbonImmutable::today();
        $end = $range === 'custom' ? CarbonImmutable::parse($validated['analytics_end']) : $today;
        $start = $range === 'custom'
            ? CarbonImmutable::parse($validated['analytics_start'])
            : $end->subDays((int) $range - 1);

        if ($start->diffInDays($end) > 365) {
            throw ValidationException::withMessages([
                'analytics_end' => 'Choose a date range of 366 days or fewer.',
            ]);
        }

        return [
            'range' => $range,
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'today' => $today->toDateString(),
            'timezone' => config('app.timezone'),
        ];
    }

    public function forBarangay(?string $barangayId, array $period): array
    {
        $start = CarbonImmutable::parse($period['start'])->startOfDay();
        $endExclusive = CarbonImmutable::parse($period['end'])->addDay()->startOfDay();
        $allConcerns = DB::table('concerns')
            ->where('concerns.barangay_id', $barangayId)
            ->when(! $barangayId, fn ($query) => $query->whereRaw('1 = 0'));
        $concerns = (clone $allConcerns)
            ->where('concerns.created_at', '>=', $start)
            ->where('concerns.created_at', '<', $endExclusive);
        $missions = DB::table('missions')
            ->where('missions.barangay_id', $barangayId)
            ->when(! $barangayId, fn ($query) => $query->whereRaw('1 = 0'))
            ->whereExists(function ($query) use ($barangayId) {
                $query->selectRaw('1')->from('concerns')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->where('concerns.barangay_id', $barangayId);
            });

        $reportDays = (clone $concerns)
            ->selectRaw('DATE(concerns.created_at) as day, COUNT(*) as total')
            ->groupByRaw('DATE(concerns.created_at)')->pluck('total', 'day');
        $verified = (clone $missions)
            ->where('missions.status', MissionStatus::Verified->value)
            ->where('missions.verified_at', '>=', $start)
            ->where('missions.verified_at', '<', $endExclusive);
        $verifiedDays = (clone $verified)
            ->selectRaw('DATE(missions.verified_at) as day, COUNT(*) as total')
            ->groupByRaw('DATE(missions.verified_at)')->pluck('total', 'day');

        $trend = [];
        for ($day = $start; $day->lt($endExclusive); $day = $day->addDay()) {
            $date = $day->toDateString();
            $trend[] = [
                'date' => $date,
                'reports' => (int) ($reportDays[$date] ?? 0),
                'verified' => (int) ($verifiedDays[$date] ?? 0),
            ];
        }

        $statusCounts = (clone $missions)->where('missions.created_at', '>=', $start)
            ->where('missions.created_at', '<', $endExclusive)
            ->selectRaw('missions.status, COUNT(*) as total')->groupBy('missions.status')->pluck('total', 'status');
        $statuses = collect(MissionStatus::cases())->map(fn (MissionStatus $status) => [
            'status' => $status->value,
            'count' => (int) ($statusCounts[$status->value] ?? 0),
        ])->all();

        $categories = (clone $concerns)
            ->leftJoin('concern_categories', 'concerns.category_id', '=', 'concern_categories.id')
            ->selectRaw("COALESCE(concern_categories.name, 'Unclassified') as name, COUNT(*) as count")
            ->groupBy('concern_categories.name')->orderByDesc('count')->orderBy('name')
            ->get()->map(fn ($row) => ['name' => $row->name, 'count' => (int) $row->count])->all();

        $severityCounts = (clone $concerns)->selectRaw('severity, COUNT(*) as total')
            ->groupBy('severity')->pluck('total', 'severity');
        $severities = collect(['critical', 'high', 'medium', 'low'])->map(fn ($severity) => [
            'severity' => $severity,
            'count' => (int) ($severityCounts[$severity] ?? 0),
        ])->all();
        $severities[] = [
            'severity' => 'unclassified',
            'count' => (int) $reportDays->sum() - array_sum(array_column($severities, 'count')),
        ];

        $days = (int) $start->diffInDays($endExclusive);
        $previousStart = $start->subDays($days);
        $previousVerified = (clone $missions)
            ->where('missions.status', MissionStatus::Verified->value)
            ->where('missions.verified_at', '>=', $previousStart)
            ->where('missions.verified_at', '<', $start);

        return [
            'period' => $period,
            'summary' => [
                'reports_received' => (int) $reportDays->sum(),
                'missions_created' => (int) $statusCounts->sum(),
                'missions_verified' => (int) $verifiedDays->sum(),
                'average_verification_hours' => $this->averageVerificationHours($verified),
            ],
            'comparison' => [
                'period' => [
                    'start' => $previousStart->toDateString(),
                    'end' => $start->subDay()->toDateString(),
                ],
                'summary' => [
                    'reports_received' => (clone $allConcerns)->where('concerns.created_at', '>=', $previousStart)
                        ->where('concerns.created_at', '<', $start)->count(),
                    'missions_created' => (clone $missions)->where('missions.created_at', '>=', $previousStart)
                        ->where('missions.created_at', '<', $start)->count(),
                    'missions_verified' => (clone $previousVerified)->count(),
                    'average_verification_hours' => $this->averageVerificationHours($previousVerified),
                ],
            ],
            'workload' => $this->currentWorkload($missions),
            'trend' => $trend,
            'statuses' => $statuses,
            'categories' => $categories,
            'severities' => $severities,
        ];
    }

    private function averageVerificationHours(Builder $verified): ?float
    {
        // Stream timestamps to keep memory bounded and work across database drivers.
        $totalHours = 0;
        $timedMissions = 0;
        foreach ((clone $verified)->select('missions.created_at', 'missions.verified_at')->cursor() as $mission) {
            if (! $mission->created_at) {
                continue;
            }
            $created = CarbonImmutable::parse($mission->created_at);
            $verifiedAt = CarbonImmutable::parse($mission->verified_at);
            if ($created->lte($verifiedAt)) {
                $totalHours += $created->diffInSeconds($verifiedAt) / 3600;
                $timedMissions++;
            }
        }

        return $timedMissions ? round($totalHours / $timedMissions, 1) : null;
    }

    private function currentWorkload(Builder $missions): array
    {
        $asOf = CarbonImmutable::now();
        $groups = (clone $missions)
            ->whereIn('missions.status', [...MissionWorkload::ACTIVE_STATUSES, MissionStatus::Completed->value])
            ->select('missions.department')
            ->selectRaw('CASE WHEN missions.status = ? THEN ? WHEN missions.is_overdue = ? OR missions.due_date < ? THEN ? ELSE ? END as bucket', [
                MissionStatus::Completed->value, 'awaiting_verification', true, $asOf->toDateString(), 'overdue', 'active',
            ])
            ->selectRaw('COUNT(*) as total')
            ->groupBy('missions.department', 'bucket')->get();

        $departments = [];
        $totals = ['active' => 0, 'overdue' => 0, 'awaiting_verification' => 0];
        foreach ($groups as $group) {
            $name = trim((string) $group->department);
            foreach (PersonnelDepartment::cases() as $department) {
                if ($name === $department->value || strcasecmp($name, $department->label()) === 0) {
                    $name = $department->label();
                    break;
                }
            }
            $name = $name !== '' ? $name : 'Unassigned';
            $departments[$name] ??= ['name' => $name, ...array_fill_keys(array_keys($totals), 0), 'total' => 0];
            $count = (int) $group->total;
            $departments[$name][$group->bucket] += $count;
            $departments[$name]['total'] += $count;
            $totals[$group->bucket] += $count;
        }

        $departments = array_values($departments);
        usort($departments, fn ($a, $b) => ($b['total'] <=> $a['total']) ?: strcasecmp($a['name'], $b['name']));

        return ['as_of' => $asOf->toIso8601String(), 'totals' => $totals, 'departments' => $departments];
    }
}
