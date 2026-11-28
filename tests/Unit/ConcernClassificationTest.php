<?php

namespace Tests\Unit;

use App\Enums\ConcernCategoryCode;
use App\Services\Concerns\ConcernClassification;
use PHPUnit\Framework\TestCase;

class ConcernClassificationTest extends TestCase
{
    public function test_nine_categories_have_exact_labels_helpers_and_routing(): void
    {
        $this->assertCount(9, ConcernCategoryCode::options());
        $this->assertSame('Traffic & Vehicle Violations', ConcernCategoryCode::Traffic->label());
        $this->assertSame('Utility & Infrastructure', ConcernCategoryCode::Drainage->department()->label());
        $this->assertSame(['public_works'], ConcernCategoryCode::Infrastructure->roles());
        $this->assertSame(['vaw_desk', 'lupon'], ConcernCategoryCode::Vawc->roles());
        $this->assertSame(['routed_department' => 'admin_triage', 'routed_roles' => ['admin']], ConcernCategoryCode::Other->routing());
        foreach (ConcernCategoryCode::cases() as $category) {
            $this->assertNotEmpty($category->description());
        }
    }

    public function test_emergency_screening_understands_timing_and_negation(): void
    {
        $screen = new ConcernClassification;
        foreach (['The house is on fire right now', 'Nasusunog ang bahay namin', 'An ongoing robbery near the shop', 'May holdap ngayon', 'He cannot breathe', 'Someone is drowning'] as $text) {
            $this->assertTrue($screen->isActiveEmergency($text), $text);
        }
        foreach (['There is no active fire', 'The fire was extinguished yesterday', 'Exposed wires are a fire hazard', 'Clogged drainage needs cleaning', 'Non-life-threatening animal bites', 'A robbery last week', 'Walang sunog ngayon'] as $text) {
            $this->assertFalse($screen->isActiveEmergency($text), $text);
        }
    }

    public function test_local_classification_covers_routine_english_and_filipino_reports(): void
    {
        $classifier = new ConcernClassification;
        foreach (['Illegal parking' => 'TRAFFIC', 'Tambak na basura' => 'WASTE', 'Maingay na videoke' => 'NOISE', 'Domestic abuse' => 'VAWC', 'Sirang ilaw sa kalsada' => 'INFRA', 'Baradong kanal' => 'DRAINAGE', 'Stray dogs' => 'ANIMALS', 'Broken equipment in the barangay hall' => 'PROPERTY'] as $text => $expected) {
            $this->assertSame($expected, $classifier->category($text, '')?->value);
        }
    }
}
