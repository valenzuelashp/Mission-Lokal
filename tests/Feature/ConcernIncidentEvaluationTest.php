<?php

namespace Tests\Feature;

use App\Models\Concern;
use App\Services\Concerns\ConcernDuplicateMatcher;
use App\Services\Concerns\ConcernIncidentContext;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class ConcernIncidentEvaluationTest extends TestCase
{
    public function test_synthetic_bilingual_and_incident_context_regression_cases(): void
    {
        $data = json_decode(file_get_contents(base_path('tests/Fixtures/concern-incident-cases.json')), true, 512, JSON_THROW_ON_ERROR);
        $matcher = new ConcernDuplicateMatcher;
        foreach ($data['cases'] as $case) {
            $reports = [];
            foreach (['first', 'second'] as $side) {
                $input = $case[$side];
                $reports[] = (new Concern)->forceFill(['title' => $input['title'], 'description' => $input['description'],
                    'context_x' => $input['lng'], 'context_y' => $input['lat'], 'created_at' => $input['reported_at'],
                    'incident_occurred_at' => $input['incident_at']]);
            }
            $predicted = $case['first']['category'] === $case['second']['category']
                && $case['first']['subcategory'] === $case['second']['subcategory']
                && $matcher->compareIncident($reports[0], $reports[1]) !== null;
            $this->assertSame($case['expected_duplicate'], $predicted, $case['id']);
        }
        $this->assertFalse($data['reviewed_by_barangay']);
    }

    public function test_evaluation_command_outputs_metrics_without_claiming_field_validation(): void
    {
        $this->assertSame(0, Artisan::call('concerns:evaluate-incidents', ['--json' => true]));
        $result = json_decode(Artisan::output(), true, 512, JSON_THROW_ON_ERROR);
        $this->assertFalse($result['reviewed_by_barangay']);
        $this->assertSame(0, $result['false_positives']);
        $this->assertSame(0, $result['false_negatives']);
        $this->artisan('concerns:evaluate-incidents', ['file' => 'missing-incident-dataset.json'])->assertExitCode(1);
    }

    public function test_location_labels_normalize_streets_and_keep_unnamed_locations_explicit(): void
    {
        $context = new ConcernIncidentContext;
        $this->assertSame('Rizal Street', $context->areaLabel('Near 123 Rizal St., Tambo'));
        $this->assertSame('Mabini Road', $context->areaLabel('Community Court, Mabini Rd.'));
        $this->assertNull($context->areaLabel('Coordinates: 14.5173, 120.9934'));
        $this->assertNull($context->areaLabel(null));
        $this->assertNull((new ConcernDuplicateMatcher)->compareIncident(new Concern(['title' => 'Baha', 'description' => 'Baha sa tulay']), new Concern(['title' => 'Flooding', 'description' => 'Flooding near bridge'])));
    }
}
