<?php

namespace App\Services\Concerns;

use App\Models\CategoryPlaybook;

class ConcernResponsePlan
{
    public function forSubcategory(?int $subcategoryId): ?array
    {
        if ($subcategoryId === null) {
            return null;
        }

        $playbooks = CategoryPlaybook::query()
            ->where('subcategory_id', $subcategoryId)
            ->where('is_active', true)
            ->orderBy('id')
            ->get();

        foreach ($playbooks as $playbook) {
            $steps = $this->normalizeSteps($playbook->steps_template);
            if ($steps === []) {
                continue;
            }

            // Keep the procedure intact while making the responsible actor clear
            // when the same steps are shown to residents after staff approval.
            $steps = array_map(fn (string $step) => preg_match('/^(?:the\b|assigned\b|barangay\b|only authorized\b)/i', $step)
                ? $step : 'Assigned barangay personnel: '.$step, $steps);

            return [
                'prescriptive_steps' => $steps,
                'response_plan' => [
                    'source' => 'playbook',
                    'playbook_id' => $playbook->id,
                    'playbook_title' => $playbook->title,
                    'subcategory_id' => $subcategoryId,
                ],
            ];
        }

        return null;
    }

    public function normalizeSteps(mixed $steps): array
    {
        if (! is_array($steps)) {
            return [];
        }

        $normalized = [];
        foreach ($steps as $step) {
            if (is_array($step)) {
                $step = collect(['task', 'step', 'title', 'instruction', 'action'])
                    ->map(fn ($key) => $step[$key] ?? null)
                    ->first(fn ($value) => is_string($value) && trim($value) !== '');
            }
            if (is_string($step) && trim($step) !== '') {
                $normalized[] = trim($step);
            }
        }

        return $normalized;
    }

    public function safeguardingSteps(): array
    {
        return [
            'Only authorized VAW Desk personnel should handle this case through the barangay\'s confidential safeguarding process.',
            'Assess immediate safety discreetly; do not contact the alleged perpetrator or attempt mediation as part of this mission.',
            'Record only necessary operational details in the restricted case record; do not collect identifying photos unless required by protocol and safe to do so.',
        ];
    }

    public function defaultSteps(): array
    {
        return [
            'The assigned barangay personnel will inspect and verify the reported issue at the recorded location.',
            'The responsible barangay desk will determine the appropriate action or referral after verifying the conditions.',
            'Assigned personnel will document the action taken and submit the required resolution notes and safe supporting evidence.',
        ];
    }
}
