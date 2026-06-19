<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ConcernCategory;
use App\Models\ConcernSubcategory;
use App\Models\CategoryPlaybook;

class BlueprintCategorySeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. INFRASTRUCTURE & UTILITIES
        // ==========================================
        $infra = ConcernCategory::create([
            'barangay_id' => null,
            'code' => 'INFRA',
            'name' => 'Infrastructure & Utilities',
            'default_visibility' => 'public',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $pothole = ConcernSubcategory::create([
            'category_id' => $infra->id,
            'code' => 'ROAD_POTHOLE',
            'name' => 'Pothole / Road Damage',
            'force_private' => false,
        ]);

        CategoryPlaybook::create([
            'subcategory_id' => $pothole->id,
            'title' => 'Standard Pothole Repair Protocol',
            'steps_template' => [
                ['step' => 1, 'task' => 'Inspect reported location and measure dimensions.'],
                ['step' => 2, 'task' => 'Secure area with traffic cones.'],
                ['step' => 3, 'task' => 'Apply asphalt patch and take after-repair photo.']
            ],
            'default_duration_hours' => 24,
            'default_due_days' => 3,
        ]);

        // ==========================================
        // 2. SANITATION & ENVIRONMENT
        // ==========================================
        $sani = ConcernCategory::create([
            'barangay_id' => null,
            'code' => 'SANI',
            'name' => 'Sanitation & Environment',
            'default_visibility' => 'public',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $garbage = ConcernSubcategory::create([
            'category_id' => $sani->id,
            'code' => 'GARBAGE',
            'name' => 'Uncollected Garbage',
            'force_private' => false,
        ]);

        CategoryPlaybook::create([
            'subcategory_id' => $garbage->id,
            'title' => 'Waste Retrieval Protocol',
            'steps_template' => [
                ['step' => 1, 'task' => 'Contact assigned garbage truck driver for the zone.'],
                ['step' => 2, 'task' => 'Retrieve uncollected waste.']
            ],
            'default_duration_hours' => 12,
            'default_due_days' => 1,
        ]);

        // ==========================================
        // 3. PEACE & ORDER
        // ==========================================
        $peace = ConcernCategory::create([
            'barangay_id' => null,
            'code' => 'SEC',
            'name' => 'Peace & Order',
            'default_visibility' => 'private', // Private to protect reporters
            'sort_order' => 3,
            'is_active' => true,
        ]);

        $noise = ConcernSubcategory::create([
            'category_id' => $peace->id,
            'code' => 'NOISE',
            'name' => 'Noise Complaint (Videoke/Party)',
            'force_private' => true, 
        ]);

        CategoryPlaybook::create([
            'subcategory_id' => $noise->id,
            'title' => 'Noise Abatement Response',
            'steps_template' => [
                ['step' => 1, 'task' => 'Dispatch Barangay Tanod to the location.'],
                ['step' => 2, 'task' => 'Issue verbal warning to lower volume.']
            ],
            'default_duration_hours' => 2,
            'default_due_days' => 1,
        ]);
    }
}