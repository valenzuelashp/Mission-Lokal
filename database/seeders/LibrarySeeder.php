<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\LibraryItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        $barangay = Barangay::where('code', 'TAMBO')->first() ?? Barangay::first();

        if (!$barangay) {
            return;
        }

        $items = [
            [
                'id' => (string) Str::uuid(),
                'barangay_id' => $barangay->id,
                'type' => 'emergency',
                'title' => 'Barangay Health Emergency Response Team (BHERT)',
                'content' => 'Call immediately for severe medical emergencies, ambulance requests, or critical infectious triage.',
                'metadata' => [
                    'phone' => '0912-345-6789',
                    'landline' => '(02) 8123-4567',
                    'available' => '24/7',
                ],
                'location' => null,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'barangay_id' => $barangay->id,
                'type' => 'manual',
                'title' => 'Typhoon & Heavy Inundation Preparedness Guide',
                'content' => "1. Prepare your Go-Bag (water, canned food, flashlight, first aid, powerbank).\n2. Familiarize family members with designated evacuation center routes.\n3. Secure roofing sheets, window panels, and loose outdoor debris.\n4. Monitor local announcements via the Mission-Lokal Public Feed.",
                'metadata' => null,
                'location' => null,
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'barangay_id' => $barangay->id,
                'type' => 'evacuation_center',
                'title' => 'Barangay Tambo Central Covered Court',
                'content' => 'Primary evacuation facility during storm surge and flash floods. Equipped with generator sets, clean water supply, and separated comfort rooms.',
                'metadata' => [
                    'capacity' => 180,
                    'facilities' => ['Restrooms', 'Mobile Clinic', 'Community Kitchen', 'Pet Shelter'],
                ],
                'location' => DB::raw("PointFromText('POINT(120.993381 14.517308)', 4326)"),
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'barangay_id' => $barangay->id,
                'type' => 'contact',
                'title' => 'Barangay Hall Administration Desk',
                'content' => 'General public inquiries, barangay clearances, residency certificates, and Katarungang Pambarangay filing scheduling.',
                'metadata' => [
                    'phone' => '0917-888-9999',
                    'office_hours' => 'Mon-Fri 8:00 AM - 5:00 PM',
                ],
                'location' => null,
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'id' => (string) Str::uuid(),
                'barangay_id' => $barangay->id,
                'type' => 'manual',
                'title' => 'Barangay Ordinance No. 04 - Road Safety & Obstruction Clearance',
                'content' => 'Prohibiting illegal vehicle parking along public thoroughfares, commercial sidewalk encroachments, and uncoordinated open trench excavation.',
                'metadata' => null,
                'location' => null,
                'sort_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($items as $item) {
            LibraryItem::updateOrCreate(
                ['barangay_id' => $item['barangay_id'], 'title' => $item['title']],
                $item
            );
        }
    }
}