<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\LibraryItem;
use App\Support\MapHelpers;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        $barangay = Barangay::where('code', 'TAMBO')->first();

        if (! $barangay) {
            return;
        }

        $legacyIds = LibraryItem::query()
            ->where('barangay_id', $barangay->id)
            ->whereIn('title', [
                'Barangay Health Emergency Response Team (BHERT)',
                'Barangay Hall Administration Desk',
            ])
            ->get(['id', 'metadata'])
            ->filter(fn (LibraryItem $item) => in_array(
                $item->metadata['phone'] ?? null,
                ['0912-345-6789', '0917-888-9999'],
                true,
            ))
            ->pluck('id');

        if ($legacyIds->isNotEmpty()) {
            LibraryItem::query()->whereIn('id', $legacyIds)->delete();
        }

        $items = [
            [
                'type' => 'manual',
                'title' => 'Typhoon & Heavy Inundation Preparedness Guide',
                'content' => "1. Prepare your Go-Bag (water, canned food, flashlight, first aid, powerbank).\n2. Familiarize family members with designated evacuation center routes.\n3. Secure roofing sheets, window panels, and loose outdoor debris.\n4. Monitor local announcements via the Mission-Lokal Public Feed.",
                'metadata' => null,
                'location' => null,
                'sort_order' => 2,
            ],
            [
                'type' => 'evacuation_center',
                'title' => 'Barangay Tambo Central Covered Court',
                'content' => 'Primary evacuation facility during storm surge and flash floods. Equipped with generator sets, clean water supply, and separated comfort rooms.',
                'metadata' => [
                    'capacity' => 180,
                    'facilities' => ['Restrooms', 'Mobile Clinic', 'Community Kitchen', 'Pet Shelter'],
                ],
                'location' => MapHelpers::pointFromLatLng(14.517308, 120.993381),
                'sort_order' => 3,
            ],
            [
                'type' => 'manual',
                'title' => 'Barangay Ordinance No. 04 - Road Safety & Obstruction Clearance',
                'content' => 'Prohibiting illegal vehicle parking along public thoroughfares, commercial sidewalk encroachments, and uncoordinated open trench excavation.',
                'metadata' => null,
                'location' => null,
                'sort_order' => 5,
            ],
            [
                'type' => 'faq',
                'title' => 'Document Request Requirements',
                'content' => "First Time Jobseekers: First Name, Middle Name, Last Name, Address, Age, Length of Stay, Educational Attainment, Contact Number, Facebook Account, Birthday.\n\nIndigency: First Name, Middle Name, Last Name, Address, Purpose.\n\nBarangay ID: First Name, Middle Name, Last Name, Address, Birthday, Birth Place.\n\nCertification: First Name, Middle Name, Last Name, Address, Purpose.\n\nBarangay Clearance: First Name, Middle Name, Surname, Alias, Address, Gender, Birthday, Age, Birthplace, Status, Citizenship, Purpose.\n\nWorking Permit: Name, Middle Name, Surname, Address, Position.",
                'metadata' => ['subtitle' => 'Details to prepare before submitting a request'],
                'location' => null,
                'sort_order' => 6,
            ],
        ];

        foreach ([
            ['Emergency', 'National Emergency Hotline', '911', 'emergency', 'police'],
            ['HEMS Ambulance', 'Ambulance', '(02) 8826-7464', 'emergency', 'health'],
            ['Pque. Fire Central - Hotline 1', 'Fire Department', '(02) 8826-9131', 'emergency', 'fire'],
            ['Police Station Tambo/Solaire', 'Police Station', '(02) 8887-1437', 'emergency', 'police'],
            ['Pque. Fire Central - Hotline 2', 'Fire Department', '(02) 8826-3176', 'emergency', 'fire'],
            ['Emergency Operation Center', 'Emergency Operations', '(0961) 096-6249', 'emergency', 'office'],
            ['Barangay Landline', 'Barangay Hall', '(02) 8654-0596', 'contact', 'office'],
            ['Brgy Mobile (Globe)', 'Barangay Hall - Globe', '(0977) 723-2933', 'contact', 'office'],
            ['Brgy Mobile (Smart)', 'Barangay Hall - Smart', '(0960) 254-7401', 'contact', 'office'],
            ['Brgy Health Center', 'Health Center', '(02) 8403-4910', 'contact', 'health'],
            ['Maynilad', 'Water service hotline', '1626', 'contact', 'office'],
            ['Meralco', 'Electric service hotline', '16211', 'contact', 'office'],
        ] as $index => [$title, $role, $phone, $type, $icon]) {
            $items[] = [
                'type' => $type,
                'title' => $title,
                'content' => '',
                'metadata' => ['role' => $role, 'phone' => $phone, 'icon' => $icon],
                'location' => null,
                'sort_order' => 10 + $index,
            ];
        }

        foreach ($items as $item) {
            LibraryItem::updateOrCreate(
                ['barangay_id' => $barangay->id, 'title' => $item['title']],
                [
                    ...$item,
                    'id' => (string) Str::uuid(),
                    'barangay_id' => $barangay->id,
                    'is_active' => true,
                ],
            );
        }
    }
}
