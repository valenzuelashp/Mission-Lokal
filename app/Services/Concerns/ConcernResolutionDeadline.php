<?php

namespace App\Services\Concerns;

use App\Models\Concern;
use Carbon\CarbonImmutable;

class ConcernResolutionDeadline
{
    public function workingDaysFor(Concern $concern, ?string $severity = null): int
    {
        $severity ??= $concern->severity;

        if ($severity === 'critical') {
            return 20;
        }

        $categoryName = strtolower($concern->category?->name ?? '');
        $summary = strtolower($categoryName.' '.$concern->title.' '.$concern->description);

        if (
            $severity === 'high'
            || $concern->is_blotter_candidate
            || preg_match('/\b(blotter|mediation|neighborhood conflict|community conflict)\b/', $summary)
        ) {
            return 7;
        }

        return 3;
    }

    public function deadlineFor(Concern $concern, ?string $severity = null): CarbonImmutable
    {
        $deadline = CarbonImmutable::parse($concern->created_at ?? now())->startOfDay();
        $workingDays = $this->workingDaysFor($concern, $severity);
        $countedDays = 0;

        while ($countedDays < $workingDays) {
            $deadline = $deadline->addDay();

            if ($deadline->isWeekday()) {
                $countedDays++;
            }
        }

        return $deadline;
    }

    public function durationHoursForConcern(Concern $concern, ?string $severity = null): int
    {
        return $this->workingDaysFor($concern, $severity) * 24;
    }
}