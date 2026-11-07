<?php

namespace Tests\Unit;

use App\Http\Controllers\Admin\ReportController;
use App\Models\Concern;
use App\Models\ConcernCategory;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class ConcernCivicXpValuesTest extends TestCase
{
    public function test_standard_concern_categories_have_distinct_xp_values(): void
    {
        $controller = new ReportController();
        $method = new ReflectionMethod(ReportController::class, 'calculateCategoryXp');
        $categories = [
            'Public Safety & Order' => 5,
            'Infrastructure & Utilities' => 4,
            'Sanitation & Environment' => 3,
            'Katarungang Pambarangay' => 2,
        ];

        foreach ($categories as $name => $expectedPoints) {
            $category = new ConcernCategory();
            $category->setAttribute('name', $name);
            $concern = new Concern();
            $concern->setRelation('category', $category);

            self::assertSame($expectedPoints, $method->invoke($controller, $concern, 'barangay-id'));
        }
    }
}