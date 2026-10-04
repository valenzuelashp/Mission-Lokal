<?php

namespace Database\Seeders;

use App\Enums\ConcernStatus;
use App\Enums\MissionStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Announcement;
use App\Models\Barangay;
use App\Models\BarangaySetting;
use App\Models\Blotter;
use App\Models\CategoryPlaybook;
use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Models\ConcernCategory;
use App\Models\ConcernDuplicateLink;
use App\Models\ConcernMedia;
use App\Models\ConcernStatusHistory;
use App\Models\ConcernSubcategory;
use App\Models\ConcernVote;
use App\Models\Mission;
use App\Models\MissionAssignment;
use App\Models\MissionChecklistItem;
use App\Models\MissionProof;
use App\Models\MissionProofMedia;
use App\Models\MissionStatusHistory;
use App\Models\Notification;
use App\Models\Personnel;
use App\Models\ProfileEditRequest;
use App\Models\ResidentProfile;
use App\Models\ResidentRegistration;
use App\Models\User;
use App\Services\LocalIdentifier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ComprehensiveSystemSeeder extends Seeder
{
    public function run(): void
    {
        // =========================================================================
        // 1. BARANGAYS & SETTINGS
        // =========================================================================
        $tambo = Barangay::updateOrCreate(
            ['code' => 'TAMBO'],
            [
                'id' => 'a2e442ed-bf25-4193-b5d1-03b81c6c5340',
                'name' => 'Barangay Tambo',
                'house_street' => 'Quirino Avenue',
                'city' => 'Parañaque',
                'province' => 'Metro Manila',
                'contact_phone' => '09171234567',
                'contact_email' => 'barangay@demo.local',
                'office_hours' => ['weekdays' => '8:00 AM – 5:00 PM', 'saturday' => '8:00 AM – 12:00 PM'],
                'is_active' => true,
            ]
        );

        $b36 = Barangay::updateOrCreate(
            ['code' => 'CLCN-B36'],
            [
                'id' => 'a2e45218-df32-4bdd-b397-bba9d81905c2',
                'name' => 'Barangay 36',
                'house_street' => '239 Marulas A.',
                'city' => 'Caloocan',
                'province' => 'Metro Manila',
                'contact_phone' => '09187654321',
                'contact_email' => 'b36@caloocan.gov.ph',
                'office_hours' => ['weekdays' => '8:00 AM – 5:00 PM'],
                'is_active' => true,
            ]
        );

        foreach ([$tambo, $b36] as $brgy) {
            BarangaySetting::updateOrCreate(
                ['barangay_id' => $brgy->id],
                [
                    'ack_timeout_hours' => 4,
                    'duplicate_geo_radius_m' => 200,
                    'duplicate_time_window_h' => 72,
                    'auto_sms_nearby_radius_m' => 1500,
                    'max_personnel_sms_per_mission' => 3,
                    'civic_xp_per_valid_report' => 10,
                    'civic_xp_per_resolution' => 5,
                    'civic_xp_per_upvote' => 2,
                    'location_fuzz_meters' => 50,
                    'sms_sender_id' => 'BRGY_MSG',
                    'updated_at' => now(),
                ]
            );
        }

        // =========================================================================
        // 2. CONCERN CATEGORIES, SUBCATEGORIES, & PLAYBOOKS
        // =========================================================================
        $catData = [
            ['id' => 1, 'code' => 'INFRA', 'name' => 'Infrastructure & Utilities', 'default_visibility' => 'public', 'sort_order' => 1],
            ['id' => 2, 'code' => 'SANI', 'name' => 'Sanitation & Environment', 'default_visibility' => 'public', 'sort_order' => 2],
            ['id' => 3, 'code' => 'SEC', 'name' => 'Peace & Order', 'default_visibility' => 'private', 'sort_order' => 3],
            ['id' => 4, 'code' => 'OTHER', 'name' => 'Other Concerns', 'default_visibility' => 'public', 'sort_order' => 4],
        ];

        foreach ($catData as $c) {
            ConcernCategory::updateOrCreate(['id' => $c['id']], [
                'barangay_id' => null,
                'code' => $c['code'],
                'name' => $c['name'],
                'default_visibility' => $c['default_visibility'],
                'sort_order' => $c['sort_order'],
                'is_active' => true,
            ]);
        }

        $subData = [
            ['id' => 1, 'category_id' => 1, 'code' => 'ROAD_POTHOLE', 'name' => 'Pothole / Road Damage', 'force_private' => false],
            ['id' => 2, 'category_id' => 2, 'code' => 'GARBAGE', 'name' => 'Uncollected Garbage', 'force_private' => false],
            ['id' => 3, 'category_id' => 3, 'code' => 'NOISE', 'name' => 'Noise Complaint (Videoke/Party)', 'force_private' => true],
            ['id' => 4, 'category_id' => 1, 'code' => 'DRAINAGE', 'name' => 'Clogged Drainage / Flooding', 'force_private' => false],
            ['id' => 5, 'category_id' => 1, 'code' => 'STREET_LIGHT', 'name' => 'Street Light Malfunction', 'force_private' => false],
            ['id' => 6, 'category_id' => 3, 'code' => 'VAWC', 'name' => 'VAWC & Domestic Conflict', 'force_private' => true],
        ];

        foreach ($subData as $s) {
            ConcernSubcategory::updateOrCreate(['id' => $s['id']], [
                'category_id' => $s['category_id'],
                'code' => $s['code'],
                'name' => $s['name'],
                'force_private' => $s['force_private'],
                'is_active' => true,
            ]);
        }

        $playbooks = [
            [
                'id' => 'a2e442ee-ec92-43a6-b5ea-e5e91d17d48e',
                'subcategory_id' => 1,
                'title' => 'Standard Pothole Repair Protocol',
                'steps_template' => [
                    ['step' => 1, 'task' => 'Inspect reported location and measure dimensions.'],
                    ['step' => 2, 'task' => 'Secure area with traffic cones and warning signs.'],
                    ['step' => 3, 'task' => 'Apply asphalt patch or concrete sealant.'],
                    ['step' => 4, 'task' => 'Capture after-repair photo proof and clear roadway.'],
                ],
                'default_duration_hours' => 24,
                'default_due_days' => 3,
            ],
            [
                'id' => 'a2e442ee-ee58-4496-bbf5-206113addc1f',
                'subcategory_id' => 2,
                'title' => 'Municipal Waste Retrieval Protocol',
                'steps_template' => [
                    ['step' => 1, 'task' => 'Verify uncollected waste volume and exact street address.'],
                    ['step' => 2, 'task' => 'Dispatch sanitation truck or pushcart collection crew.'],
                    ['step' => 3, 'task' => 'Sanitize collection point with lime/bleach spray.'],
                ],
                'default_duration_hours' => 12,
                'default_due_days' => 1,
            ],
            [
                'id' => 'a2e442ee-f0d1-452b-b23a-9772c9c6bff4',
                'subcategory_id' => 3,
                'title' => 'Community Noise Abatement Response',
                'steps_template' => [
                    ['step' => 1, 'task' => 'Dispatch Barangay Tanod on patrol to the identified location.'],
                    ['step' => 2, 'task' => 'Conduct audio measurement or site inspection.'],
                    ['step' => 3, 'task' => 'Issue official verbal warning and record violator details.'],
                ],
                'default_duration_hours' => 2,
                'default_due_days' => 1,
            ],
            [
                'id' => (string) Str::uuid(),
                'subcategory_id' => 4,
                'title' => 'Drainage Declogging Protocol',
                'steps_template' => [
                    ['step' => 1, 'task' => 'Inspect drainage inlet and check water stagnation level.'],
                    ['step' => 2, 'task' => 'Remove silt, plastics, and debris using shovels and rods.'],
                    ['step' => 3, 'task' => 'Test drainage outflow and document cleared culvert.'],
                ],
                'default_duration_hours' => 18,
                'default_due_days' => 2,
            ],
        ];

        foreach ($playbooks as $p) {
            CategoryPlaybook::updateOrCreate(['id' => $p['id']], [
                'subcategory_id' => $p['subcategory_id'],
                'title' => $p['title'],
                'steps_template' => $p['steps_template'],
                'default_duration_hours' => $p['default_duration_hours'],
                'default_due_days' => $p['default_due_days'],
                'is_active' => true,
            ]);
        }

        // =========================================================================
        // 3. USERS, PROFILES, & PERSONNEL
        // =========================================================================
        // A. Admins
        $admin1 = User::updateOrCreate(['email' => 'admin@demo.local'], [
            'id' => 'a2e442ee-244d-4477-99ec-78bfd6b1f038',
            'barangay_id' => $tambo->id,
            'account_id' => 'TAMBO_ADM_0001',
            'role' => UserRole::Admin,
            'is_view_only' => false,
            'first_name' => 'System',
            'last_name' => 'Admin',
            'password' => Hash::make('password'),
            'profile_edit_status' => 'none',
            'is_active' => true,
            'last_login_at' => now(),
        ]);

        $admin2 = User::updateOrCreate(['email' => 'admin@missionlokal.test'], [
            'id' => 'a2e442ef-55aa-41a6-893c-9a1199212c88',
            'barangay_id' => $tambo->id,
            'account_id' => 'TAMBO_ADM_0999',
            'role' => UserRole::Admin,
            'is_view_only' => false,
            'first_name' => 'Triage',
            'last_name' => 'Admin',
            'password' => Hash::make('password'),
            'profile_edit_status' => 'none',
            'is_active' => true,
        ]);

        // B. Personnel Users & Profiles
        $personnelUsers = [
            [
                'id' => 'a2e442ee-84ec-46a8-ac84-1313f5379b93',
                'account_id' => 'TAMBO_PER_0001',
                'first_name' => 'Mateo',
                'middle_name' => 'Talon',
                'last_name' => 'Tanod',
                'name_extension' => 'Jr.',
                'email' => 'personnel@demo.local',
                'mobile' => '09181234567',
                'category' => 'tanod',
                'birthday' => '1987-03-12',
            ],
            [
                'id' => 'a2e442ef-b692-42d0-9339-7c92b030774d',
                'account_id' => 'TAMBO_PER_0999',
                'first_name' => 'Timothy',
                'middle_name' => 'Ramos',
                'last_name' => 'Personnel',
                'name_extension' => null,
                'email' => 'personnel@missionlokal.test',
                'mobile' => '09189999999',
                'category' => 'public_works',
                'birthday' => '1991-08-22',
            ],
            [
                'id' => (string) Str::uuid(),
                'account_id' => 'TAMBO_PER_1001',
                'first_name' => 'Eduardo',
                'middle_name' => 'Cruz',
                'last_name' => 'Dela Rosa',
                'name_extension' => null,
                'email' => 'eduardo.lupon@demo.local',
                'mobile' => '09185551234',
                'category' => 'lupon',
                'birthday' => '1979-11-05',
            ],
            [
                'id' => (string) Str::uuid(),
                'account_id' => 'TAMBO_PER_1002',
                'first_name' => 'Elena',
                'middle_name' => 'Santos',
                'last_name' => 'Morales',
                'name_extension' => null,
                'email' => 'elena.vaw@demo.local',
                'mobile' => '09184449876',
                'category' => 'vaw_desk',
                'birthday' => '1984-06-19',
            ],
            [
                'id' => (string) Str::uuid(),
                'account_id' => 'TAMBO_PER_1003',
                'first_name' => 'Rogelio',
                'middle_name' => 'Bautista',
                'last_name' => 'Serrano',
                'name_extension' => null,
                'email' => 'rogelio.sanitation@demo.local',
                'mobile' => '09183332211',
                'category' => 'sanitation',
                'birthday' => '1990-09-15',
            ],
        ];

        $createdPersonnelIds = [];

        foreach ($personnelUsers as $pu) {
            $u = User::updateOrCreate(['account_id' => $pu['account_id']], [
                'id' => $pu['id'],
                'barangay_id' => $tambo->id,
                'role' => UserRole::Personnel,
                'is_view_only' => false,
                'first_name' => $pu['first_name'],
                'middle_name' => $pu['middle_name'],
                'last_name' => $pu['last_name'],
                'name_extension' => $pu['name_extension'],
                'email' => $pu['email'],
                'mobile' => $pu['mobile'],
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);

            $pProfile = Personnel::updateOrCreate(['user_id' => $u->id], [
                'id' => (string) Str::uuid(),
                'birthday' => $pu['birthday'],
                'category' => $pu['category'],
                'registered_zone' => DB::raw("PointFromText('POINT(120.993381 14.517308)', 4326)"),
                'last_known_location' => DB::raw("PointFromText('POINT(120.993381 14.517308)', 4326)"),
                'location_updated_at' => now(),
                'sms_enabled' => 1,
                'is_active' => 1,
            ]);

            $createdPersonnelIds[] = $pProfile->id;
        }

        // C. Resident Users & Profiles
        $residentUsers = [
            [
                'id' => 'a2e442ee-e8c5-425c-8da9-7ec8ca22392a',
                'account_id' => 'TAMBO_RES_0001',
                'first_name' => 'Maria',
                'middle_name' => 'Clara',
                'last_name' => 'Resident',
                'name_extension' => null,
                'email' => 'resident@demo.local',
                'mobile' => '09191234567',
                'birthday' => '1985-05-15',
                'address' => '124 Quirino Avenue, Tambo',
                'house_street' => '124 Quirino Ave',
                'digital_id_code' => 'TAMBO_RES_0001',
            ],
            [
                'id' => 'a2e442f0-1cd6-4a6f-bce1-82d41e56773f',
                'account_id' => 'TAMBO_RES_0999',
                'first_name' => 'Juan',
                'middle_name' => 'Felipe',
                'last_name' => 'Dela Cruz',
                'name_extension' => null,
                'email' => 'resident@missionlokal.test',
                'mobile' => '09198888888',
                'birthday' => '1992-04-12',
                'address' => 'Phase 1 Zone 15, Tambo',
                'house_street' => 'Block 4 Lot 10',
                'digital_id_code' => 'TAMBO_RES_0999',
            ],
            [
                'id' => (string) Str::uuid(),
                'account_id' => 'TAMBO_RES_1005',
                'first_name' => 'Carmela',
                'middle_name' => 'Valdez',
                'last_name' => 'Ocampo',
                'name_extension' => null,
                'email' => 'carmela.ocampo@gmail.com',
                'mobile' => '09197771234',
                'birthday' => '1996-01-28',
                'address' => 'Sitio Sto. Niño, Tambo',
                'house_street' => 'Lot 18 Sitio Sto. Niño',
                'digital_id_code' => 'TAMBO_RES_1005',
            ],
            [
                'id' => (string) Str::uuid(),
                'account_id' => 'TAMBO_RES_1006',
                'first_name' => 'Danilo',
                'middle_name' => 'Gomez',
                'last_name' => 'Perez',
                'name_extension' => 'Jr.',
                'email' => 'danilo.perez@yahoo.com',
                'mobile' => '09196667890',
                'birthday' => '1981-10-10',
                'address' => 'Riverside Compound, Zone 12',
                'house_street' => 'Riverside Comp. #4',
                'digital_id_code' => 'TAMBO_RES_1006',
            ],
        ];

        $residentObjects = [];

        foreach ($residentUsers as $ru) {
            $u = User::updateOrCreate(['account_id' => $ru['account_id']], [
                'id' => $ru['id'],
                'barangay_id' => $tambo->id,
                'role' => UserRole::Resident,
                'is_view_only' => false,
                'first_name' => $ru['first_name'],
                'middle_name' => $ru['middle_name'],
                'last_name' => $ru['last_name'],
                'name_extension' => $ru['name_extension'],
                'email' => $ru['email'],
                'mobile' => $ru['mobile'],
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);

            ResidentProfile::updateOrCreate(['user_id' => $u->id], [
                'civic_xp' => 50,
                'verification_status' => 'approved',
                'birthday' => $ru['birthday'],
                'house_street' => $ru['house_street'],
                'barangay_name' => 'Tambo',
                'city' => 'Parañaque',
                'province' => 'Metro Manila',
                'address' => $ru['address'],
                'digital_id_code' => $ru['digital_id_code'],
                'government_id_storage_key' => 'demo/ids/gov_id.jpg',
            ]);

            $residentObjects[] = $u;
        }

        // Profile Edit Request
        ProfileEditRequest::create([
            'id' => (string) Str::uuid(),
            'user_id' => $residentObjects[1]->id,
            'requested_changes' => json_encode(['mobile' => '09198888888']),
            'status' => 'pending',
            'created_at' => now()->subDay(),
        ]);

        // Resident Registration (Walk-in application)
        ResidentRegistration::updateOrCreate(['email' => 'ric.resident@gmail.com'], [
            'barangay_id' => $tambo->id,
            'first_name' => 'Ricardo',
            'middle_name' => 'Alcantara',
            'last_name' => 'Montes',
            'name_extension' => null,
            'birthday' => '1995-12-04',
            'house_street' => '232 Sampaguita St.',
            'barangay_name' => 'Tambo',
            'city' => 'Parañaque',
            'province' => 'Metro Manila',
            'email' => 'ric.resident@gmail.com',
            'mobile' => '09193338877',
            'government_id_path' => 'demo/ids/ricardo_id.jpg',
            'consent_given_at' => now(),
        ]);

        // =========================================================================
        // 4. CONCERNS, DUPLICATES, & AI TRIAGE
        // =========================================================================
        // Concern 1 (Master / Active Pothole)
        $masterConcern = Concern::updateOrCreate(['id' => '71478b56-9f7c-41e5-a5d9-ea0cc5f47fa4'], [
            'barangay_id' => $tambo->id,
            'reporter_id' => $residentObjects[1]->id,
            'title' => 'Severe pothole causing traffic hazards on curve',
            'description' => 'A large deep pothole has formed right at the curve of Phase 1 road near the basketball court. Tricycles and motorbikes frequently swerve into oncoming lanes.',
            'category_id' => 1,
            'subcategory_id' => 1,
            'visibility' => 'public',
            'severity' => 'critical',
            'severity_confirmed' => 1,
            'status' => ConcernStatus::Active,
            'location' => DB::raw("PointFromText('POINT(120.993381 14.517308)', 4326)"),
            'address_text' => 'Phase 1 Curve, Zone 15, Tambo',
            'is_blotter_candidate' => 0,
            'duplicate_of_id' => null,
            'ai_processed_at' => now()->subHours(12),
            'staff_reviewed_by' => $admin1->id,
            'staff_reviewed_at' => now()->subHours(10),
            'created_at' => now()->subDay(),
            'updated_at' => now()->subHours(10),
        ]);

        // Concern 2 (Merged Duplicate of Concern 1)
        $duplicateConcern = Concern::create([
            'id' => (string) Str::uuid(),
            'barangay_id' => $tambo->id,
            'reporter_id' => $residentObjects[2]->id,
            'title' => 'Malalim na butas sa kalsada malapit sa court',
            'description' => 'Napakalalim po ng lubak dito sa kanto ng court. Muntik na may sumemplang na nagmomotor kaninang umaga.',
            'category_id' => 1,
            'subcategory_id' => 1,
            'visibility' => 'public',
            'severity' => 'high',
            'severity_confirmed' => 1,
            'status' => ConcernStatus::Resolved,
            'location' => DB::raw("PointFromText('POINT(120.993420 14.517350)', 4326)"),
            'address_text' => 'Kanto ng Covered Court, Phase 1, Tambo',
            'is_blotter_candidate' => 0,
            'duplicate_of_id' => $masterConcern->id,
            'ai_processed_at' => now()->subHours(8),
            'staff_reviewed_by' => $admin1->id,
            'staff_reviewed_at' => now()->subHours(6),
            'closed_summary' => 'Merged as duplicate into master ticket: Severe pothole causing traffic hazards on curve',
            'created_at' => now()->subHours(9),
            'updated_at' => now()->subHours(6),
        ]);

        // Concern 3 (Standalone Active - Garbage Dump)
        $garbageConcern = Concern::create([
            'id' => (string) Str::uuid(),
            'barangay_id' => $tambo->id,
            'reporter_id' => $residentObjects[0]->id,
            'title' => 'Uncollected garbage pile attracting stray dogs along Quirino',
            'description' => 'Tons of uncollected kitchen waste left uncollected for three consecutive days. Stray dogs have torn the garbage bags.',
            'category_id' => 2,
            'subcategory_id' => 2,
            'visibility' => 'public',
            'severity' => 'high',
            'severity_confirmed' => 1,
            'status' => ConcernStatus::Active,
            'location' => DB::raw("PointFromText('POINT(120.991500 14.515200)', 4326)"),
            'address_text' => 'Opposite 124 Quirino Avenue, Tambo',
            'is_blotter_candidate' => 0,
            'duplicate_of_id' => null,
            'ai_processed_at' => now()->subHours(5),
            'staff_reviewed_by' => $admin1->id,
            'staff_reviewed_at' => now()->subHours(4),
            'created_at' => now()->subHours(6),
            'updated_at' => now()->subHours(4),
        ]);

        // Concern 4 (Under Review - Night Videoke)
        $noiseConcern = Concern::create([
            'id' => (string) Str::uuid(),
            'barangay_id' => $tambo->id,
            'reporter_id' => $residentObjects[3]->id,
            'title' => 'Excessive late-night videoke noise past curfew',
            'description' => 'Loud singing and bass amplifiers operating continuously past 1:00 AM on a weekday night despite resident reminders.',
            'category_id' => 3,
            'subcategory_id' => 3,
            'visibility' => 'private',
            'severity' => 'low',
            'severity_confirmed' => 0,
            'status' => ConcernStatus::UnderReview,
            'location' => DB::raw("PointFromText('POINT(120.992200 14.516100)', 4326)"),
            'address_text' => 'Compound #3, Riverside Alley, Zone 12',
            'is_blotter_candidate' => 1,
            'duplicate_of_id' => null,
            'ai_processed_at' => now()->subHours(2),
            'created_at' => now()->subHours(3),
            'updated_at' => now()->subHours(2),
        ]);

        // Concern Duplicate Link Audit
        ConcernDuplicateLink::create([
            'id' => (string) Str::uuid(),
            'primary_concern_id' => $masterConcern->id,
            'linked_concern_id' => $duplicateConcern->id,
            'link_type' => 'merge',
            'created_by' => $admin1->id,
            'created_at' => now()->subHours(6),
        ]);

        // AI Analyses
        ConcernAiAnalysis::create([
            'id' => 'ed77bd24-b964-47a1-85b6-2bc255f4ba01',
            'concern_id' => $masterConcern->id,
            'is_current' => 1,
            'detected_language' => 'en',
            'suggested_category_id' => 1,
            'suggested_subcategory_id' => 1,
            'suggested_visibility' => 'public',
            'suggested_severity' => 'critical',
            'severity_confidence' => 0.950,
            'prescriptive_steps' => [
                'Inspect reported pothole dimensions and depth.',
                'Secure road section with warning cones.',
                'Apply asphalt binder and compact surface.',
            ],
            'suggested_due_date' => now()->addDays(2)->toDateString(),
            'suggested_duration_hours' => 24,
            'processed_at' => now()->subHours(12),
        ]);

        ConcernAiAnalysis::create([
            'id' => (string) Str::uuid(),
            'concern_id' => $duplicateConcern->id,
            'is_current' => 1,
            'detected_language' => 'fil',
            'suggested_category_id' => 1,
            'suggested_subcategory_id' => 1,
            'suggested_visibility' => 'public',
            'suggested_severity' => 'high',
            'severity_confidence' => 0.920,
            'duplicate_candidate_id' => $masterConcern->id,
            'duplicate_similarity' => 0.8950,
            'raw_model_output' => ['recommended_action' => 'merge', 'action_reason' => 'Spatial overlap <45m and identical incident context.'],
            'processed_at' => now()->subHours(8),
        ]);

        // Media & Votes
        ConcernMedia::create([
            'id' => '38a96731-6a54-4673-a63f-a95d1d8268c8',
            'concern_id' => $masterConcern->id,
            'storage_key' => 'concerns/pothole_sample.jpg',
            'mime_type' => 'image/jpeg',
            'sort_order' => 0,
            'created_at' => now()->subDay(),
        ]);

        ConcernVote::updateOrCreate(
            ['concern_id' => $masterConcern->id, 'user_id' => $residentObjects[0]->id],
            ['vote' => 1, 'created_at' => now()->subHours(10), 'updated_at' => now()->subHours(10)]
        );

        ConcernVote::updateOrCreate(
            ['concern_id' => $masterConcern->id, 'user_id' => $residentObjects[2]->id],
            ['vote' => 1, 'created_at' => now()->subHours(7), 'updated_at' => now()->subHours(7)]
        );

        // Status Histories
        ConcernStatusHistory::create([
            'concern_id' => $masterConcern->id,
            'from_status' => 'submitted',
            'to_status' => 'active',
            'actor_id' => $admin1->id,
            'note' => 'Admin verified incident and escalated to active mission.',
            'created_at' => now()->subHours(10),
        ]);

        ConcernStatusHistory::create([
            'concern_id' => $duplicateConcern->id,
            'from_status' => 'submitted',
            'to_status' => 'resolved',
            'actor_id' => $admin1->id,
            'note' => 'Merged as duplicate into master ticket ' . $masterConcern->id,
            'created_at' => now()->subHours(6),
        ]);

        // =========================================================================
        // 5. MISSIONS, PROOFS, & ASSIGNMENTS
        // =========================================================================
        $mission = Mission::updateOrCreate(['id' => '9b80b270-5cc0-4d8b-a477-c9e36d93e85d'], [
            'barangay_id' => $tambo->id,
            'concern_id' => $masterConcern->id,
            'playbook_id' => 'a2e442ee-ec92-43a6-b5ea-e5e91d17d48e',
            'due_date' => now()->addDays(2)->toDateString(),
            'estimated_duration_hours' => 24,
            'status' => MissionStatus::InProgress,
            'is_overdue' => 0,
            'is_escalated' => 0,
            'acknowledged_at' => now()->subHours(9),
            'completed_at' => null,
            'verified_at' => null,
            'verified_by' => null,
            'created_by' => $admin1->id,
            'created_at' => now()->subHours(10),
            'updated_at' => now()->subHours(9),
        ]);

        // Assign personnel to mission
        DB::table('mission_personnel')->updateOrInsert(
            ['mission_id' => $mission->id, 'personnel_id' => $createdPersonnelIds[1]],
            [
                'id' => (string) Str::uuid(),
                'assigned_by' => $admin1->id,
                'status' => 'in_progress',
                'acknowledged_at' => now()->subHours(9),
                'completed_at' => null,
                'created_at' => now()->subHours(10),
                'updated_at' => now()->subHours(9),
            ]
        );

        MissionAssignment::create([
            'id' => (string) Str::uuid(),
            'mission_id' => $mission->id,
            'personnel_id' => $personnelUsers[1]['id'],
            'assigned_by' => $admin1->id,
            'assigned_at' => now()->subHours(10),
        ]);

        MissionChecklistItem::create([
            'id' => (string) Str::uuid(),
            'mission_id' => $mission->id,
            'step_order' => 1,
            'description' => 'Inspect reported location and measure dimensions.',
            'is_completed' => 1,
            'completed_at' => now()->subHours(8),
            'completed_by' => $personnelUsers[1]['id'],
        ]);

        MissionChecklistItem::create([
            'id' => (string) Str::uuid(),
            'mission_id' => $mission->id,
            'step_order' => 2,
            'description' => 'Secure area with traffic cones and warning signs.',
            'is_completed' => 1,
            'completed_at' => now()->subHours(7),
            'completed_by' => $personnelUsers[1]['id'],
        ]);

        MissionChecklistItem::create([
            'id' => (string) Str::uuid(),
            'mission_id' => $mission->id,
            'step_order' => 3,
            'description' => 'Apply asphalt patch or concrete sealant.',
            'is_completed' => 0,
            'completed_at' => null,
            'completed_by' => null,
        ]);

        $proof = MissionProof::create([
            'id' => (string) Str::uuid(),
            'mission_id' => $mission->id,
            'submitted_by' => $personnelUsers[1]['id'],
            'notes' => 'Traffic cones deployed. Asphalt mix being transported to site.',
            'submitted_at' => now()->subHours(7),
        ]);

        MissionProofMedia::create([
            'id' => (string) Str::uuid(),
            'proof_id' => $proof->id,
            'storage_key' => 'proofs/pothole_fixed.jpg',
            'mime_type' => 'image/jpeg',
            'caption' => 'Cones stationed around pothole',
            'created_at' => now()->subHours(7),
        ]);

        MissionStatusHistory::create([
            'mission_id' => $mission->id,
            'from_status' => 'assigned',
            'to_status' => 'in_progress',
            'actor_id' => $personnelUsers[1]['id'],
            'note' => 'Personnel arrived at Phase 1 curve.',
            'created_at' => now()->subHours(9),
        ]);

        // =========================================================================
        // 6. BLOTTERS
        // =========================================================================
        $blotter = Blotter::create([
            'id' => '0738a753-af7e-4555-9d76-abea99013b53',
            'barangay_id' => $tambo->id,
            'concern_id' => $noiseConcern->id,
            'type' => 'two_party',
            'complainant_id' => $residentObjects[3]->id,
            'respondent_name' => 'Armando Castro',
            'narrative' => 'Complainant reported constant videoke operations at residential dwelling exceeding permitted barangay decibel levels.',
            'incident_at' => now()->subDays(1),
            'incident_location' => DB::raw("PointFromText('POINT(120.992200 14.516100)', 4326)"),
            'incident_address' => 'Compound #3, Riverside Alley, Tambo',
            'relief_sought' => 'Formal barangay conciliation and cessation of late-night sound amplification.',
            'witnesses' => ['Eduardo Ramos', 'Leticia Morales'],
            'signature_ack_at' => now()->subHours(20),
            'ticket_number' => 'TAMBO_BLT_9991',
            'status' => 'filed',
            'hearing_scheduled_at' => now()->addDays(3),
            'approved_by' => $admin1->id,
            'approved_at' => now()->subHours(18),
            'created_at' => now()->subDay(),
            'updated_at' => now()->subHours(18),
        ]);

        // =========================================================================
        // 7. ANNOUNCEMENTS & VOLUNTEERS
        // =========================================================================
        $announcement1 = Announcement::create([
            'id' => (string) Str::uuid(),
            'barangay_id' => $tambo->id,
            'title' => 'Oplan Kalinisan: Community Drainage Clean-Up Drive',
            'body' => 'Join your fellow residents this Saturday 7:00 AM at the Barangay Covered Court as we declog waterways and clean our community streets before the monsoon season.',
            'kind' => 'advisory',
            'cover_image_url' => 'announcements/clean_up.jpg',
            'is_published' => 1,
            'published_at' => now()->subDays(2),
            'event_at' => now()->addDays(5),
            'created_by' => $admin1->id,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        Announcement::create([
            'id' => (string) Str::uuid(),
            'barangay_id' => $tambo->id,
            'title' => 'Scheduled Water Service Interruption Advisory',
            'body' => 'Maynilad advisory: Temporary water service interruption on Wednesday 10:00 PM to Thursday 6:00 AM due to network pipe maintenance along Quirino Avenue.',
            'kind' => 'advisory',
            'is_published' => 1,
            'published_at' => now()->subHours(6),
            'event_at' => null,
            'created_by' => $admin1->id,
            'created_at' => now()->subHours(6),
            'updated_at' => now()->subHours(6),
        ]);

        DB::table('announcement_volunteers')->insert([
            'id' => (string) Str::uuid(),
            'announcement_id' => $announcement1->id,
            'user_id' => $residentObjects[0]->id,
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        // =========================================================================
        // 8. NOTIFICATIONS & AUDIT LOGS
        // =========================================================================
        Notification::create([
            'id' => (string) Str::uuid(),
            'user_id' => $residentObjects[1]->id,
            'channel' => 'in_app',
            'event_type' => 'concern_active',
            'title' => 'Concern Active: Field Unit Dispatched',
            'body' => 'A mission has been deployed to address your road pothole report.',
            'payload' => ['concern_id' => $masterConcern->id],
            'is_read' => 0,
            'created_at' => now()->subHours(10),
            'updated_at' => now()->subHours(10),
        ]);

        Notification::create([
            'id' => (string) Str::uuid(),
            'user_id' => $residentObjects[2]->id,
            'channel' => 'in_app',
            'event_type' => 'concern_merged',
            'title' => 'Report Grouped with Ongoing Ticket',
            'body' => 'Your report was verified and bundled with an ongoing ticket: "' . $masterConcern->title . '".',
            'payload' => ['concern_id' => $duplicateConcern->id, 'master_concern_id' => $masterConcern->id],
            'is_read' => 0,
            'created_at' => now()->subHours(6),
            'updated_at' => now()->subHours(6),
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $tambo->id,
            'actor_id' => $admin1->id,
            'action' => 'CONFIRM_AI_ESCALATE',
            'entity_type' => 'Mission',
            'entity_id' => $mission->id,
            'metadata' => json_encode(['details' => 'Confirmed AI verdict: Escalated report into field mission']),
            'ip_address' => inet_pton('127.0.0.1'),
            'created_at' => now()->subHours(10),
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $tambo->id,
            'actor_id' => $admin1->id,
            'action' => 'CONFIRM_AI_MERGE',
            'entity_type' => 'Concern',
            'entity_id' => $duplicateConcern->id,
            'metadata' => json_encode(['details' => 'Merged duplicate report into master ID ' . $masterConcern->id]),
            'ip_address' => inet_pton('127.0.0.1'),
            'created_at' => now()->subHours(6),
        ]);

        $this->command->info('Mission-Lokal comprehensive schema successfully seeded across all tables!');
    }
}