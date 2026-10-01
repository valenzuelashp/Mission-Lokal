<?php

namespace Tests\Unit;

use App\Services\Concerns\ConcernDuplicateMatcher;
use PHPUnit\Framework\TestCase;

class ConcernDuplicateMatcherTest extends TestCase
{
    public function test_it_scores_repeated_descriptions_higher_than_different_problems_in_the_same_category(): void
    {
        $matcher = new ConcernDuplicateMatcher();

        $repeatScore = $matcher->textSimilarity(
            'Broken street light near Rizal Street',
            'The lamp is dark and the pole is leaning.',
            'Street light broken on Rizal Street',
            'The lamp remains dark and the pole leans.',
        );
        $differentProblemScore = $matcher->textSimilarity(
            'Garbage dumped beside the public market',
            'Several bags block the drainage by the market entrance.',
            'Loud music from a videoke late at night',
            'Speakers disturb residents after midnight near the barangay hall.',
        );

        $this->assertGreaterThanOrEqual(0.5, $repeatScore);
        $this->assertLessThan(0.5, $differentProblemScore);
    }

    public function test_it_raises_severity_as_distinct_residents_report_the_same_incident(): void
    {
        $matcher = new ConcernDuplicateMatcher();

        $this->assertNull($matcher->severityForReporterCount(1));
        $this->assertSame('medium', $matcher->severityForReporterCount(2));
        $this->assertSame('high', $matcher->severityForReporterCount(4));
        $this->assertSame('critical', $matcher->severityForReporterCount(7));
        $this->assertSame('critical', $matcher->higherSeverity('critical', 'medium'));
    }
}