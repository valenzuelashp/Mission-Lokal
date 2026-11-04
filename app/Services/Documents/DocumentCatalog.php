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
            'first_name' => 'First Name',
            'middle_name' => 'Middle Name',
            'last_name' => 'Last Name',
            'surname' => 'Surname',
            'address' => 'Address',
            'age' => 'Age',
            'length_of_stay' => 'Length of Stay',
            'education_attainment' => 'Educational Attainment',
            'contact_number' => 'Contact Number',
            'facebook_account' => 'Facebook Account',
            'birthday' => 'Birthday',
            'birthplace' => 'Birth Place',
            'birth_place' => 'Birth Place',
            'alias' => 'Alias',
            'gender' => 'Gender',
            'civil_status' => 'Status',
            'citizenship' => 'Citizenship',
            'name' => 'Name',
            'position' => 'Position',
        ];
    }

    public static function ensureForBarangay(string $barangayId): void
    {
        foreach (self::defaults() as $template) {
            $existing = DocumentTemplate::query()->firstOrCreate(
                [
                    'barangay_id' => $barangayId,
                    'key' => $template['key'],
                ],
                $template,
            );

            if ($existing->wasRecentlyCreated || ! $existing->is_system) {
                continue;
            }

            $requiredFields = $template['resident_fields'];
            $currentFields = $existing->resident_fields ?? [];
            $mergedFields = array_values(array_unique([
                ...$requiredFields,
                ...array_diff($currentFields, $requiredFields),
            ]));
            if ($mergedFields !== $currentFields) {
                $existing->update(['resident_fields' => $mergedFields]);
            }

            $previous = self::previousBodies()[$template['key']] ?? [];
            if (! in_array($existing->body, $previous, true)) {
                continue;
            }

            $existing->update([
                'name' => $template['name'],
                'body' => $template['body'],
                'signatory_title' => $template['signatory_title'],
            ]);
        }
    }

    /**
     * Bodies shipped before the letterhead format. Untouched copies are replaced.
     *
     * @return array<string, list<string>>
     */
    private static function previousBodies(): array
    {
        return [
            'indigency' => [
                'This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, belongs to an indigent family in this barangay. This certification is issued upon request for {{purpose}}.',
            ],
            'good_moral' => [
                'This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, is known in this barangay to be of good moral character. This certification is issued for {{purpose}} and is addressed to {{requesting_office}}.',
            ],
            'business_clearance' => [
                'This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, is cleared to operate {{business_name}}, engaged in {{business_nature}}, located at {{business_address}}. This clearance is issued for {{purpose}}.',
            ],
            'residency' => [
                'This is to certify that {{resident_name}} is a bona fide resident of {{address}}, {{barangay_name}}, and has lived in this barangay for {{years_of_residency}}. This certification is issued for {{purpose}}.',
            ],
            'barangay_clearance' => [
                'This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, is a person of good standing in this barangay. This clearance is issued for {{purpose}} and is valid only for that stated purpose.',
            ],
        ];
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
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => ['first_name', 'middle_name', 'last_name', 'address', 'purpose'],
                'body' => "This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, belongs to an indigent family in this barangay.\n\nThis certification is being issued upon the request of {{resident_name}} for {{purpose}}.",
            ],
            [
                'key' => 'good_moral',
                'name' => 'Certificate of Good Moral Character',
                'sort_order' => 2,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => ['purpose', 'requesting_office'],
                'body' => "This is to certify that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, is known in this barangay to be of good moral character.\n\nThis certification is being issued upon the request of {{resident_name}} for {{purpose}}, and is addressed to {{requesting_office}}.",
            ],
            [
                'key' => 'business_clearance',
                'name' => 'Barangay Business Clearance',
                'sort_order' => 3,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => ['business_name', 'business_nature', 'business_address', 'purpose'],
                'body' => "This is to certify that a Barangay Business Clearance is hereby granted and issued to {{business_name}}, owned by {{resident_name}} of {{address}}, {{barangay_name}}, to conduct {{business_nature}} at {{business_address}}.\n\nThis certification is being issued upon the request of {{resident_name}} for {{purpose}}.\n\nFurthermore, this barangay interposes no objection for this activity.",
            ],
            [
                'key' => 'residency',
                'name' => 'Certificate of Residency',
                'sort_order' => 4,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => ['purpose', 'years_of_residency'],
                'body' => "This is to certify that {{resident_name}} is a bona fide resident of {{address}}, {{barangay_name}}, and has lived in this barangay for {{years_of_residency}}.\n\nThis certification is being issued upon the request of {{resident_name}} for {{purpose}}.",
            ],
            [
                'key' => 'barangay_clearance',
                'name' => 'Barangay Clearance Certificate',
                'sort_order' => 5,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => [
                    'first_name', 'middle_name', 'surname', 'alias', 'address', 'gender',
                    'birthday', 'age', 'birthplace', 'civil_status', 'citizenship', 'purpose',
                ],
                'body' => "This is to certify that a Barangay Clearance Certificate is hereby granted and issued to {{resident_name}}, a resident of {{address}}, {{barangay_name}}.\n\nThis certification is being issued upon the request of {{resident_name}} for {{purpose}}.\n\nFurthermore, this barangay interposes no objection for this purpose.",
            ],
            [
                'key' => 'first_time_jobseeker',
                'name' => 'First Time Jobseeker Certificate',
                'sort_order' => 6,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => [
                    'first_name', 'middle_name', 'last_name', 'address', 'age', 'length_of_stay',
                    'education_attainment', 'contact_number', 'facebook_account', 'birthday',
                ],
                'body' => "This certifies that {{resident_name}}, a resident of {{address}}, {{barangay_name}}, has requested a First Time Jobseeker Certificate.",
            ],
            [
                'key' => 'barangay_id',
                'name' => 'Barangay ID Application',
                'sort_order' => 7,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => ['first_name', 'middle_name', 'last_name', 'address', 'birthday', 'birth_place'],
                'body' => "This records the Barangay ID application of {{resident_name}}, a resident of {{address}}, {{barangay_name}}.",
            ],
            [
                'key' => 'certification',
                'name' => 'Barangay Certification',
                'sort_order' => 8,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => ['first_name', 'middle_name', 'last_name', 'address', 'purpose'],
                'body' => "This certification is issued to {{resident_name}}, a resident of {{address}}, {{barangay_name}}, upon request for {{purpose}}.",
            ],
            [
                'key' => 'working_permit',
                'name' => 'Working Permit Application',
                'sort_order' => 9,
                'is_system' => true,
                'is_enabled' => true,
                'signatory_title' => 'Barangay Chairman',
                'resident_fields' => ['name', 'middle_name', 'surname', 'address', 'position'],
                'body' => "This records the Working Permit application of {{resident_name}}, a resident of {{address}}, {{barangay_name}}, for the position of {{position}}.",
            ],
        ];
    }
}
