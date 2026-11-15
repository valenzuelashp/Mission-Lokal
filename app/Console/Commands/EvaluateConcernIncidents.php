<?php

namespace App\Console\Commands;

use App\Models\Concern;
use App\Services\Concerns\ConcernDuplicateMatcher;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class EvaluateConcernIncidents extends Command
{
    protected $signature = 'concerns:evaluate-incidents {file? : Path to a labeled JSON dataset} {--json : Output only the result as JSON}';

    protected $description = 'Evaluate incident matching against supplied labels without calling external AI or changing reports.';

    public function handle(ConcernDuplicateMatcher $matcher): int
    {
        $path = $this->argument('file') ?: base_path('tests/Fixtures/concern-incident-cases.json');
        if (! File::isFile($path)) {
            $this->error('The evaluation dataset could not be found.');

            return self::FAILURE;
        }
        try {
            $data = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable $exception) {
            $this->error('The evaluation dataset must contain valid JSON.');

            return self::FAILURE;
        }
        $rules = [
            'label_source' => ['required', 'string'], 'reviewed_by_barangay' => ['required', 'boolean'],
            'cases' => ['required', 'array', 'min:1', 'max:1000'], 'cases.*.id' => ['required', 'string', 'distinct'],
            'cases.*.expected_duplicate' => ['required', 'boolean'],
        ];
        foreach (['first', 'second'] as $side) {
            $prefix = 'cases.*.'.$side.'.';
            $rules[$prefix.'title'] = ['required', 'string', 'max:255'];
            $rules[$prefix.'description'] = ['present', 'nullable', 'string', 'max:5000'];
            $rules[$prefix.'category'] = ['required', 'string'];
            $rules[$prefix.'subcategory'] = ['present', 'nullable', 'string'];
            $rules[$prefix.'lat'] = ['required', 'numeric', 'between:-90,90'];
            $rules[$prefix.'lng'] = ['required', 'numeric', 'between:-180,180'];
            $rules[$prefix.'reported_at'] = ['required', 'date'];
            $rules[$prefix.'incident_at'] = ['present', 'nullable', 'date'];
        }
        $validator = Validator::make(is_array($data) ? $data : [], $rules);
        if ($validator->fails()) {
            $this->error('The dataset does not match the required format.');
            foreach ($validator->errors()->all() as $error) {
                $this->line($error);
            }

            return self::FAILURE;
        }
        $counts = ['true_positives' => 0, 'true_negatives' => 0, 'false_positives' => 0, 'false_negatives' => 0];
        $mismatches = [];
        foreach ($data['cases'] as $case) {
            $first = $case['first'];
            $second = $case['second'];
            $predicted = $first['category'] === $second['category'] && $first['subcategory'] === $second['subcategory']
                && $matcher->compareIncident($this->report($first), $this->report($second)) !== null;
            $expected = (bool) $case['expected_duplicate'];
            $key = $predicted ? ($expected ? 'true_positives' : 'false_positives') : ($expected ? 'false_negatives' : 'true_negatives');
            $counts[$key]++;
            if ($predicted !== $expected) {
                $mismatches[] = ['id' => $case['id'], 'expected_duplicate' => $expected, 'predicted_duplicate' => $predicted];
            }
        }
        $precision = $counts['true_positives'] + $counts['false_positives'];
        $recall = $counts['true_positives'] + $counts['false_negatives'];
        $p = $precision ? $counts['true_positives'] / $precision : null;
        $r = $recall ? $counts['true_positives'] / $recall : null;
        $result = ['label_source' => $data['label_source'], 'reviewed_by_barangay' => $data['reviewed_by_barangay'],
            'cases' => count($data['cases']), ...$counts, 'precision' => $p, 'recall' => $r,
            'f1' => 2 * $counts['true_positives'] + $counts['false_positives'] + $counts['false_negatives'] > 0
                ? 2 * $counts['true_positives'] / (2 * $counts['true_positives'] + $counts['false_positives'] + $counts['false_negatives']) : null,
            'mismatches' => $mismatches];
        if ($this->option('json')) {
            $this->line(json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        } else {
            if (! $data['reviewed_by_barangay']) {
                $this->warn('Synthetic or unreviewed labels: these results are not a field accuracy estimate.');
            }
            $this->table(['Metric', 'Result'], array_map(fn ($key, $value) => [$key, $value === null ? 'Not defined' : $value], array_keys($counts), array_values($counts)));
            $this->line('Precision: '.($p === null ? 'not defined' : number_format($p * 100, 1).'%').'; recall: '.($r === null ? 'not defined' : number_format($r * 100, 1).'%'));
            foreach ($mismatches as $case) {
                $this->line('Review case: '.$case['id']);
            }
        }

        return self::SUCCESS;
    }

    private function report(array $data): Concern
    {
        return (new Concern)->forceFill(['title' => $data['title'], 'description' => $data['description'] ?? '',
            'context_x' => $data['lng'], 'context_y' => $data['lat'], 'created_at' => $data['reported_at'],
            'incident_occurred_at' => $data['incident_at']]);
    }
}
