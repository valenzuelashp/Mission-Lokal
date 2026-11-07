<?php

namespace Tests\Unit;

use App\Services\CivicRecognition;
use PHPUnit\Framework\TestCase;

class CivicRecognitionTest extends TestCase
{
    public function test_badges_unlock_only_at_their_xp_threshold(): void
    {
        $recognition = new CivicRecognition();

        self::assertSame([], $recognition->badgesFor(59));
        self::assertSame(['civic-spark'], array_column($recognition->badgesFor(60), 'id'));
        self::assertSame(
            ['civic-spark', 'community-helper', 'neighborhood-champion', 'civic-advocate', 'civic-leader'],
            array_column($recognition->badgesFor(100), 'id'),
        );
    }
}