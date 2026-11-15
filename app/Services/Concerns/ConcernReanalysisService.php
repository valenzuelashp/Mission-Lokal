<?php

namespace App\Services\Concerns;

use App\Models\Concern;
use App\Models\ConcernReanalysis;

class ConcernReanalysisService
{
    public function availability(Concern $concern): array
    {
        $answered = $concern->clarifications()->whereNotNull('answered_at')->pluck('id')->all();
        $runs = ConcernReanalysis::query()->where('concern_id', $concern->id)->orderByDesc('created_at')->orderByDesc('id')->get();
        $active = $runs->first(fn ($run) => in_array($run->status, ['queued', 'processing'], true));
        $included = $runs->where('status', 'completed')->flatMap(fn ($run) => $run->clarification_ids)->unique()->all();

        return [
            'can_reanalyse' => $concern->isAwaitingStaffDecision() && $active === null && array_diff($answered, $included) !== [],
            'status' => $active?->status ?? $runs->first()?->status,
            'error' => $runs->first()?->error_message,
            'answered_ids' => $answered,
        ];
    }
}
