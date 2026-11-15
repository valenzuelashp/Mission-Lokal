<?php

namespace App\Services\Concerns;

use App\Models\Concern;
use Carbon\CarbonImmutable;

class ConcernHotspotAnalytics
{
    public function forBarangay(?string $barangayId, CarbonImmutable $start, CarbonImmutable $endExclusive): array
    {
        if (! $barangayId) {
            return ['totals' => ['reports' => 0, 'incidents' => 0, 'named_areas' => 0, 'unnamed_reports' => 0], 'rows' => []];
        }
        $scope = fn () => Concern::query()->publiclyDiscoverable()->where('barangay_id', $barangayId)
            ->whereNotIn('status', ['spam', 'rejected'])->with(['category', 'subcategory', 'currentAiAnalysis.suggestedCategory', 'currentAiAnalysis.suggestedSubcategory']);
        $reports = $scope()->where('created_at', '>=', $start)->where('created_at', '<', $endExclusive)->get()
            ->reject(fn ($report) => $report->isSensitiveConcern());
        $known = $reports->keyBy('id');
        $pendingIds = $reports->pluck('duplicate_of_id')->filter()->unique()->values();
        for ($depth = 0; $depth < 20 && $pendingIds->isNotEmpty(); $depth++) {
            $parents = $scope()->whereIn('id', $pendingIds->reject(fn ($id) => $known->has($id)))->get()
                ->reject(fn ($parent) => $parent->isSensitiveConcern());
            foreach ($parents as $parent) {
                $known->put($parent->id, $parent);
            }
            $pendingIds = $parents->pluck('duplicate_of_id')->filter()->unique()->values();
        }
        $context = new ConcernIncidentContext;
        $groups = $allIncidents = $namedAreas = [];
        $unnamed = 0;
        foreach ($reports as $report) {
            $root = $report;
            $seen = [];
            while ($root->duplicate_of_id && $known->has($root->duplicate_of_id)) {
                if (isset($seen[$root->id])) {
                    $root = $report;
                    break;
                }
                $seen[$root->id] = true;
                $root = $known->get($root->duplicate_of_id);
            }
            $area = $context->areaLabel($root->address_text) ?? $context->areaLabel($report->address_text);
            $category = $root->currentAiAnalysis?->suggestedCategory ?? $root->category;
            $categoryName = $category && ($category->barangay_id === null || $category->barangay_id === $barangayId) ? $category->name : 'Unclassified';
            $topic = $context->topic($root->title.' '.$root->description);
            $areaKey = mb_strtolower($area ?? 'Location not yet named');
            $key = hash('sha256', $areaKey."\0".$categoryName."\0".$topic);
            $groups[$key] ??= ['key' => $key, 'area' => $area ?? 'Location not yet named', 'category' => $categoryName,
                'topic' => $topic, 'reports' => 0, 'incident_ids' => [], 'reporter_ids' => [], 'open_ids' => [], 'last_reported_at' => null];
            $group = &$groups[$key];
            $group['reports']++;
            $group['incident_ids'][$root->id] = $allIncidents[$root->id] = true;
            if ($report->reporter_id) {
                $group['reporter_ids'][$report->reporter_id] = true;
            }
            if (in_array($root->status->value, ['ai_processed', 'under_review', 'active'], true)) {
                $group['open_ids'][$root->id] = true;
            }
            $reportedAt = $report->created_at?->toIso8601String();
            if ($reportedAt && ($group['last_reported_at'] === null || $reportedAt > $group['last_reported_at'])) {
                $group['last_reported_at'] = $reportedAt;
            }
            if ($area === null) {
                $unnamed++;
            } else {
                $namedAreas[$areaKey] = true;
            }
            unset($group);
        }
        $rows = array_map(static function ($group) {
            $group['incidents'] = count($group['incident_ids']);
            $group['unique_reporters'] = count($group['reporter_ids']);
            $group['open_incidents'] = count($group['open_ids']);
            unset($group['incident_ids'], $group['reporter_ids'], $group['open_ids']);

            return $group;
        }, array_values($groups));
        usort($rows, fn ($a, $b) => ($b['reports'] <=> $a['reports']) ?: ($b['incidents'] <=> $a['incidents']) ?: strcasecmp($a['area'], $b['area']));

        return ['totals' => ['reports' => $reports->count(), 'incidents' => count($allIncidents), 'named_areas' => count($namedAreas), 'unnamed_reports' => $unnamed], 'rows' => $rows];
    }
}
