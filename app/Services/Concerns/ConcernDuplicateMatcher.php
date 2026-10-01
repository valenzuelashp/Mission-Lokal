<?php

namespace App\Services\Concerns;

use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ConcernDuplicateMatcher
{
    private const MAX_DISTANCE_METERS = 75;

    private const MIN_TEXT_SIMILARITY = 0.5;

    private const ACTIVE_STATUSES = ['ai_processed', 'under_review', 'active'];

    private const STOP_WORDS = [
        'a', 'an', 'and', 'ang', 'at', 'but', 'by', 'for', 'from', 'here', 'in', 'is', 'it',
        'na', 'ng', 'of', 'on', 'or', 'po', 'sa', 'the', 'there', 'this', 'to', 'with',
        'yung', 'mga', 'may', 'please', 'reported', 'report', 'problem', 'issue', 'concern',
    ];

    public function findMatch(Concern $concern, int $categoryId, ?int $subcategoryId): ?array
    {
        if (DB::getDriverName() !== 'mysql' || !Schema::hasColumn('concerns', 'location')) {
            return null;
        }

        $location = DB::selectOne(
            'SELECT ST_X(location) AS lat, ST_Y(location) AS lng FROM concerns WHERE id = ?',
            [$concern->id],
        );

        if (!$location || $location->lat === null || $location->lng === null) {
            return null;
        }

        $point = sprintf('POINT(%F %F)', (float) $location->lat, (float) $location->lng);
        $candidates = Concern::query()
            ->where('barangay_id', $concern->barangay_id)
            ->where('id', '!=', $concern->id)
            ->whereNull('duplicate_of_id')
            ->where('visibility', 'public')
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->whereHas('currentAiAnalysis', function ($query) use ($categoryId, $subcategoryId) {
                $query->where('suggested_category_id', $categoryId);
                $subcategoryId === null
                    ? $query->whereNull('suggested_subcategory_id')
                    : $query->where('suggested_subcategory_id', $subcategoryId);
            })
            ->whereDoesntHave('currentAiAnalysis', fn ($query) => $query->whereNotNull('duplicate_candidate_id'))
            ->whereRaw(
                'ST_Distance_Sphere(location, ST_GeomFromText(?, 4326)) <= ?',
                [$point, self::MAX_DISTANCE_METERS],
            )
            ->with('currentAiAnalysis')
            ->get();

        $matches = $candidates
            ->map(fn (Concern $candidate) => [
                'concern' => $candidate,
                'similarity' => $this->textSimilarity(
                    $concern->title,
                    $concern->description,
                    $candidate->title,
                    $candidate->description,
                ),
            ])
            ->filter(fn (array $match) => $match['similarity'] >= self::MIN_TEXT_SIMILARITY)
            ->sortByDesc('similarity')
            ->values();

        if ($matches->isEmpty()) {
            return null;
        }

        $bestMatch = $matches->first();
        $candidate = $bestMatch['concern'];
        $linkedReporterIds = DB::table('concern_ai_analysis')
            ->join('concerns', 'concerns.id', '=', 'concern_ai_analysis.concern_id')
            ->where('concern_ai_analysis.duplicate_candidate_id', $candidate->id)
            ->where('concern_ai_analysis.is_current', true)
            ->where('concerns.visibility', 'public')
            ->whereIn('concerns.status', self::ACTIVE_STATUSES)
            ->pluck('concerns.reporter_id');
        $reporterCount = collect([$concern->reporter_id, $candidate->reporter_id])
            ->merge($linkedReporterIds)
            ->filter()
            ->unique()
            ->count();

        return [
            'candidate' => $candidate,
            'similarity' => $bestMatch['similarity'],
            'reporter_count' => $reporterCount,
        ];
    }

    public function textSimilarity(string $title, string $description, string $candidateTitle, string $candidateDescription): float
    {
        $tokens = array_unique($this->tokens($title . ' ' . $description));
        $candidateTokens = array_unique($this->tokens($candidateTitle . ' ' . $candidateDescription));
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

    public function raiseMatchedIncidentSeverity(Concern $candidate, string $crowdSeverity): void
    {
        $linkedIds = ConcernAiAnalysis::query()
            ->where('duplicate_candidate_id', $candidate->id)
            ->where('is_current', true)
            ->pluck('concern_id');
        $incidentReports = Concern::query()
            ->where(function ($query) use ($candidate, $linkedIds) {
                $query->where('id', $candidate->id)->orWhereIn('id', $linkedIds);
            })
            ->where('visibility', 'public')
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->with('currentAiAnalysis')
            ->get();

        foreach ($incidentReports as $report) {
            if ($report->severity_confirmed) {
                continue;
            }

            $baseSeverity = $report->currentAiAnalysis?->suggested_severity ?? $report->severity;
            $severity = $this->higherSeverity($baseSeverity, $crowdSeverity);

            if ($severity !== $report->severity) {
                $report->update(['severity' => $severity]);
            }
        }
    }

    public function higherSeverity(?string $first, ?string $second): string
    {
        $rank = ['low' => 1, 'medium' => 2, 'high' => 3, 'critical' => 4];
        $first = isset($rank[$first ?? '']) ? $first : 'medium';
        $second = isset($rank[$second ?? '']) ? $second : 'medium';

        return $rank[$first] >= $rank[$second] ? $first : $second;
    }

    private function tokens(string $text): array
    {
        $words = preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return array_values(array_filter(
            $words,
            fn (string $word) => mb_strlen($word) > 2 && !in_array($word, self::STOP_WORDS, true),
        ));
    }
}