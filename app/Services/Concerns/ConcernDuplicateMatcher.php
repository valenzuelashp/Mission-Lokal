<?php

namespace App\Services\Concerns;

use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Container\Container;

class ConcernDuplicateMatcher
{
    private const MIN_TEXT_SIMILARITY = 0.5;

    private const ACTIVE_STATUSES = ['ai_processed', 'under_review', 'active'];

    public function findMatch(Concern $concern, int $categoryId, ?int $subcategoryId): ?array
    {
        $context = new ConcernIncidentContext;
        if ($concern->visibility !== 'public' || $concern->isSensitiveConcern() || ! Schema::hasColumn('concerns', 'location')) {
            return null;
        }
        $point = $context->point($concern);
        if ($point === null) {
            return null;
        }
        $window = $context->windowHours($context->topic($concern->title.' '.$concern->description));
        $when = $context->occurredAt($concern);
        $timeColumn = Schema::hasColumn('concerns', 'incident_occurred_at') ? 'COALESCE(incident_occurred_at, created_at)' : 'created_at';
        $query = Concern::query()->publiclyDiscoverable()
            ->where('barangay_id', $concern->barangay_id)->where('id', '!=', $concern->id)
            ->whereNull('duplicate_of_id')->whereIn('status', self::ACTIVE_STATUSES)
            ->whereRaw($timeColumn.' BETWEEN ? AND ?', [$when->subHours($window), $when->addHours($window)])
            ->whereHas('currentAiAnalysis', function ($query) use ($categoryId, $subcategoryId) {
                $query->where('suggested_category_id', $categoryId);
                $subcategoryId === null ? $query->whereNull('suggested_subcategory_id') : $query->where('suggested_subcategory_id', $subcategoryId);
            })
            ->whereDoesntHave('currentAiAnalysis', fn ($query) => $query->whereNotNull('duplicate_candidate_id'))
            ->with(['currentAiAnalysis', 'subcategory']);
        if (in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            $query->select('concerns.*')->selectRaw('ST_X(location) as context_x, ST_Y(location) as context_y');
        }
        $bestMatch = null;
        foreach ($query->get() as $candidate) {
            if ($candidate->isSensitiveConcern() || $candidate->currentAiAnalysis?->reportQuality() === 'possible_spam') {
                continue;
            }
            $match = $this->compareIncident($concern, $candidate, $point);
            if ($match !== null && ($bestMatch === null || $match['similarity'] > $bestMatch['similarity'])) {
                $bestMatch = [...$match, 'candidate' => $candidate];
            }
        }
        if ($bestMatch === null) {
            return null;
        }
        $candidate = $bestMatch['candidate'];
        $linkedReporterIds = Concern::query()->publiclyDiscoverable()->where('barangay_id', $concern->barangay_id)
            ->where(function ($query) use ($candidate) {
                $query->where('id', $candidate->id)
                    ->orWhere(fn ($query) => $query->where('duplicate_of_id', $candidate->id)->whereNotIn('status', ['spam', 'rejected']))
                    ->orWhere(fn ($query) => $query->whereIn('status', self::ACTIVE_STATUSES)
                        ->whereHas('currentAiAnalysis', fn ($analysis) => $analysis->where('duplicate_candidate_id', $candidate->id)));
            })->pluck('reporter_id');
        $reporterCount = collect([$concern->reporter_id, $candidate->reporter_id])
            ->merge($linkedReporterIds)
            ->filter()
            ->unique()
            ->count();

        return [
            'candidate' => $candidate,
            'similarity' => $bestMatch['similarity'],
            'reporter_count' => $reporterCount,
            'context' => $bestMatch['context'],
        ];
    }

    public function compareIncident(Concern $concern, Concern $candidate, ?array $point = null): ?array
    {
        $context = new ConcernIncidentContext;
        $first = $point ?? $context->point($concern);
        $second = $context->point($candidate);
        if ($first === null || $second === null) {
            return null;
        }
        $distance = $context->distanceMeters($first, $second);
        $maximumDistance = Container::getInstance()->bound('config') ? (float) config('concerns.duplicate_distance_meters', 75) : 75;
        $topic = $context->topic($concern->title.' '.$concern->description);
        $candidateTopic = $context->topic($candidate->title.' '.$candidate->description);
        $window = min($context->windowHours($topic), $context->windowHours($candidateTopic));
        $timeGap = abs($context->occurredAt($concern)->diffInSeconds($context->occurredAt($candidate))) / 3600;
        $similarity = $this->textSimilarity($concern->title, $concern->description, $candidate->title, $candidate->description);
        if (($topic !== 'other' && $candidateTopic !== 'other' && $topic !== $candidateTopic)
            || $distance > $maximumDistance || $timeGap > $window || $similarity < self::MIN_TEXT_SIMILARITY) {
            return null;
        }

        return ['similarity' => $similarity, 'context' => [
            'distance_meters' => round($distance, 1), 'time_gap_hours' => round($timeGap, 1), 'window_hours' => $window,
            'shared_terms' => array_values(array_intersect($context->tokens($concern->title.' '.$concern->description), $context->tokens($candidate->title.' '.$candidate->description))),
            'time_basis' => $concern->incident_occurred_at && $candidate->incident_occurred_at ? 'incident_time' : 'includes_submission_time',
            'area' => $context->areaLabel($candidate->address_text),
        ]];
    }

    public function textSimilarity(string $title, string $description, string $candidateTitle, string $candidateDescription): float
    {
        $context = new ConcernIncidentContext;
        $tokens = $context->tokens($title . ' ' . $description);
        $candidateTokens = $context->tokens($candidateTitle . ' ' . $candidateDescription);
        $sharedTokens = array_intersect($tokens, $candidateTokens);

        if (count($sharedTokens) < 2 || !$tokens || !$candidateTokens) {
            return 0.0;
        }

        return round((2 * count($sharedTokens)) / (count($tokens) + count($candidateTokens)), 4);
    }

    public function severityForReporterCount(int $reporterCount): ?string
    {
        return match (true) {
            $reporterCount >= 7 => 'critical',
            $reporterCount >= 4 => 'high',
            $reporterCount >= 2 => 'medium',
            default => null,
        };
    }

    public function raiseMatchedIncidentSeverity(Concern $candidate, string $crowdSeverity, ?int $reporterCount = null): void
    {
        $linkedIds = ConcernAiAnalysis::query()
            ->where('duplicate_candidate_id', $candidate->id)
            ->where('is_current', true)
            ->pluck('concern_id');
        $incidentReports = Concern::query()
            ->where('barangay_id', $candidate->barangay_id)
            ->where(function ($query) use ($candidate, $linkedIds) {
                $query->where('id', $candidate->id)->orWhereIn('id', $linkedIds);
            })
            ->where('visibility', 'public')
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->with('currentAiAnalysis')
            ->get();

        foreach ($incidentReports as $report) {
            $baseSeverity = $report->currentAiAnalysis?->suggested_severity ?? $report->severity;
            $severity = $report->severity_confirmed ? $report->severity : $this->higherSeverity($baseSeverity, $crowdSeverity);

            if ($severity !== $report->severity) {
                $report->update(['severity' => $severity]);
            }

            if ($reporterCount !== null && $report->currentAiAnalysis) {
                $raw = $report->currentAiAnalysis->raw_model_output ?? [];
                $raw['severity_factors'] = [
                    'base_severity' => $baseSeverity,
                    'community_severity' => $crowdSeverity,
                    'reporter_count' => $reporterCount,
                    'final_severity' => $severity,
                    'staff_confirmed' => (bool) $report->severity_confirmed,
                    'updated_at' => now()->toIso8601String(),
                ];
                $report->currentAiAnalysis->update(['raw_model_output' => $raw]);
            }
        }
    }

    public function higherSeverity(?string $first, ?string $second): string
    {
        $rank = ['low' => 1, 'medium' => 2, 'high' => 3, 'critical' => 4];
        $first = isset($rank[$first ?? '']) ? $first : 'medium';
        $second = isset($rank[$second ?? '']) ? $second : $first;

        return $rank[$first] >= $rank[$second] ? $first : $second;
    }

}
