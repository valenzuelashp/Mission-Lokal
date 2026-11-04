<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const ITEM_IDS = [
        'f70d6f75-ef5e-43f9-ae2d-000000000001',
        'f70d6f75-ef5e-43f9-ae2d-000000000002',
        'f70d6f75-ef5e-43f9-ae2d-000000000003',
        'f70d6f75-ef5e-43f9-ae2d-000000000004',
        'f70d6f75-ef5e-43f9-ae2d-000000000005',
        'f70d6f75-ef5e-43f9-ae2d-000000000006',
        'f70d6f75-ef5e-43f9-ae2d-000000000007',
        'f70d6f75-ef5e-43f9-ae2d-000000000008',
        'f70d6f75-ef5e-43f9-ae2d-000000000009',
        'f70d6f75-ef5e-43f9-ae2d-000000000010',
        'f70d6f75-ef5e-43f9-ae2d-000000000011',
        'f70d6f75-ef5e-43f9-ae2d-000000000012',
        'f70d6f75-ef5e-43f9-ae2d-000000000013',
    ];

    public function up(): void
    {
        $barangayId = DB::table('barangays')->where('code', 'TAMBO')->value('id');
        if (! $barangayId) {
            return;
        }

        $legacyIds = DB::table('library_items')
            ->where('barangay_id', $barangayId)
            ->whereIn('title', [
                'Barangay Health Emergency Response Team (BHERT)',
                'Barangay Hall Administration Desk',
            ])
            ->get(['id', 'metadata'])
            ->filter(function (object $item): bool {
                $metadata = json_decode($item->metadata ?? '[]', true);

                return in_array($metadata['phone'] ?? null, ['0912-345-6789', '0917-888-9999'], true);
            })
            ->pluck('id');

        if ($legacyIds->isNotEmpty()) {
            DB::table('library_items')->whereIn('id', $legacyIds)->delete();
        }

        $items = [
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
        ];

        $documentRequirements = "First Time Jobseekers: First Name, Middle Name, Last Name, Address, Age, Length of Stay, Educational Attainment, Contact Number, Facebook Account, Birthday.\n\nIndigency: First Name, Middle Name, Last Name, Address, Purpose.\n\nBarangay ID: First Name, Middle Name, Last Name, Address, Birthday, Birth Place.\n\nCertification: First Name, Middle Name, Last Name, Address, Purpose.\n\nBarangay Clearance: First Name, Middle Name, Surname, Alias, Address, Gender, Birthday, Age, Birthplace, Status, Citizenship, Purpose.\n\nWorking Permit: Name, Middle Name, Surname, Address, Position.";

        $records = [[
            'id' => self::ITEM_IDS[0],
            'title' => 'Document Request Requirements',
            'type' => 'faq',
            'content' => $documentRequirements,
            'metadata' => json_encode(['subtitle' => 'Details to prepare before submitting a request']),
            'sort_order' => 6,
        ]];

        foreach ($items as $index => [$title, $role, $phone, $type, $icon]) {
            $records[] = [
                'id' => self::ITEM_IDS[$index + 1],
                'title' => $title,
                'type' => $type,
                'content' => '',
                'metadata' => json_encode(['role' => $role, 'phone' => $phone, 'icon' => $icon]),
                'sort_order' => 10 + $index,
            ];
        }

        foreach ($records as $record) {
            $exists = DB::table('library_items')
                ->where('barangay_id', $barangayId)
                ->where('title', $record['title'])
                ->exists();
            if ($exists) {
                continue;
            }

            DB::table('library_items')->insert([
                ...$record,
                'barangay_id' => $barangayId,
                'location' => null,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('library_items')->whereIn('id', self::ITEM_IDS)->delete();
    }
};
