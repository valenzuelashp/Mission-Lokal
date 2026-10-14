<?php

namespace Tests\Unit;

use App\Models\Concern;
use App\Services\Concerns\ConcernResolutionDeadline;
use Carbon\CarbonImmutable;
use Tests\TestCase;

class ConcernResolutionDeadlineTest extends TestCase
{
    public function test_it_assigns_working_day_limits_from_severity_and_case_type(): void
    {
        $policy = new ConcernResolutionDeadline();

        $this->assertSame(3, $policy->workingDaysFor(new Concern(['severity' => 'medium'])));
        $this->assertSame(7, $policy->workingDaysFor(new Concern(['severity' => 'high'])));
        $this->assertSame(20, $policy->workingDaysFor(new Concern(['severity' => 'critical'])));

        $blotter = new Concern(['severity' => 'low', 'title' => 'Standard blotter case']);
        $this->assertSame(7, $policy->workingDaysFor($blotter));
    }

    public function test_it_counts_weekdays_from_the_received_date(): void
    {
        $concern = new Concern(['severity' => 'low']);
        $concern->created_at = CarbonImmutable::parse('2026-10-16');

        $this->assertSame('2026-10-21', app(ConcernResolutionDeadline::class)->deadlineFor($concern)->toDateString());
    }

    public function test_it_maps_case_type_to_the_ai_hour_limits(): void
    {
        $policy = new ConcernResolutionDeadline();

        $this->assertSame(72, $policy->durationHoursForConcern(new Concern(['severity' => 'medium'])));
        $this->assertSame(168, $policy->durationHoursForConcern(new Concern(['severity' => 'high'])));
        $this->assertSame(480, $policy->durationHoursForConcern(new Concern(['severity' => 'critical'])));
        $this->assertSame(168, $policy->durationHoursForConcern(new Concern([
            'severity' => 'low',
            'title' => 'Standard blotter case',
        ])));
    }
}