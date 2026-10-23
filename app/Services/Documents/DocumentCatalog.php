<?php

namespace App\Services\Documents;

use App\Models\DocumentTemplate;

class DocumentCatalog
{
    /**
     * @return array<string, string>
     */
    public static function fields(): array
    {
        return [
            'purpose' => 'Purpose of the request',
            'requesting_office' => 'Office or school asking for the certificate',
            'business_name' => 'Business name',
            'business_nature' => 'Nature of business',
            'business_address' => 'Business address',
            'years_of_residency' => 'Years living in the barangay',
        ];
    }

    public static function ensureForBarangay(string $barangayId): void
    {
        foreach (self::defaults() as $template) {
            DocumentTemplate::query()->firstOrCreate(
                [
                    'barangay_id' => $barangayId,
                    'key' => $template['key'],
                ],
                $template,
            );
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function defaults(): array
    {
        return [
            [
                'key' => 'indigency',
                'name' => 'Certificate of Indigency',
                'sort_order' => 1,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Punong Barangay',
                'resident_fields' => ['purpose'],
                'body' => 'This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, belongs to an indigent family in this barangay. This certification is issued upon request for {{purpose}}.',
            ],
            [
                'key' => 'good_moral',
                'name' => 'Certificate of Good Moral Character',
                'sort_order' => 2,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Punong Barangay',
                'resident_fields' => ['purpose', 'requesting_office'],
                'body' => 'This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, is known in this barangay to be of good moral character. This certification is issued for {{purpose}} and is addressed to {{requesting_office}}.',
            ],
            [
                'key' => 'business_clearance',
                'name' => 'Barangay Business Clearance',
                'sort_order' => 3,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Punong Barangay',
                'resident_fields' => ['business_name', 'business_nature', 'business_address', 'purpose'],
                'body' => 'This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, is cleared to operate {{business_name}}, engaged in {{business_nature}}, located at {{business_address}}. This clearance is issued for {{purpose}}.',
            ],
            [
                'key' => 'residency',
                'name' => 'Certificate of Residency',
                'sort_order' => 4,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Punong Barangay',
                'resident_fields' => ['purpose', 'years_of_residency'],
                'body' => 'This is to certify that {{resident_name}} is a bona fide resident of {{address}}, {{barangay_name}}, and has lived in this barangay for {{years_of_residency}}. This certification is issued for {{purpose}}.',
            ],
            [
                'key' => 'barangay_clearance',
                'name' => 'Barangay Clearance',
                'sort_order' => 5,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Punong Barangay',
                'resident_fields' => ['purpose'],
                'body' => 'This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, is a person of good standing in this barangay. This clearance is issued for {{purpose}} and is valid only for that stated purpose.',
            ],
        ];
    }
}
