<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\LibraryItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        // First, find the demo barangay we created in the main DatabaseSeeder
        $barangay = Barangay::where('code', 'demo-barangay')->first();

        if (!$barangay) {
            return; // If the barangay doesn't exist, stop the script safely
        }

        // 1. Create an Emergency Contact
        LibraryItem::query()->create([
            'barangay_id' => $barangay->id,
            'type' => 'emergency',
            'title' => 'Barangay Health Emergency Response Team (BHERT)',
            'content' => 'Call immediately for severe medical emergencies or suspected COVID-19 cases.',
            'metadata' => [
                'phone' => '0912-345-6789',
                'landline' => '(02) 8123-4567',
                'available' => '24/7',
            ],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // 2. Create a Disaster Manual
        LibraryItem::query()->create([
            'barangay_id' => $barangay->id,
            'type' => 'manual',
            'title' => 'Typhoon Preparedness Guide',
            'content' => "1. Prepare your Go-Bag.\n2. Know your designated evacuation center.\n3. Secure loose items around your house.\n4. Stay tuned to local radio or the barangay public feed for updates.",
            'metadata' => null, // Metadata is optional
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // 3. Create an Evacuation Center with Map Coordinates
        LibraryItem::query()->create([
            'barangay_id' => $barangay->id,
            'type' => 'evacuation_center',
            'title' => 'Barangay Covered Court',
            'content' => 'Primary evacuation center for flooding. Capacity: 150 families. Pet friendly.',
            'metadata' => [
                'capacity' => 150,
                'facilities' => ['Restrooms', 'Community Kitchen', 'Clinic'],
            ],
            // Maps require a special MySQL function to save the point correctly
            'location' => DB::raw("ST_GeomFromText('POINT(120.9842 14.5995)', 4326)"),
            'sort_order' => 3,
            'is_active' => true,
        ]);
    }
}