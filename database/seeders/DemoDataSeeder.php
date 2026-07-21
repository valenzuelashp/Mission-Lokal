<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Barangay;
use App\Models\BarangaySetting;
use App\Models\ResidentProfile;
use App\Models\ProfileEditRequest;
use App\Models\PreloadedResident;
use App\Models\ConcernCategory;
use App\Models\ConcernSubcategory;
use App\Models\CategoryPlaybook;
use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Models\ConcernMedia;
use App\Models\ConcernStatusHistory;
use App\Models\ConcernVote;
use App\Models\Mission;
use App\Models\MissionAssignment;
use App\Models\MissionChecklistItem;
use App\Models\MissionProof;
use App\Models\MissionProofMedia;
use App\Models\MissionStatusHistory;
use App\Models\Blotter;
use App\Models\BlotterMedia;
use App\Models\Announcement;
use App\Models\LibraryItem;
use App\Models\Notification;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Enums\ConcernStatus;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Retrieve Barangay
        $barangay = Barangay::first();
        if (!$barangay) {
            $this->command->error("No Barangay found! Please run DatabaseSeeder first.");
            return;
        }

        // 2. Populate Barangay Settings
        BarangaySetting::firstOrCreate(
            ['barangay_id' => $barangay->id],
            ['updated_at' => now()]
        );

        // 3. Retrieve or Create Categories, Subcategories & Playbooks
        $category = ConcernCategory::first() ?? ConcernCategory::create([
            'barangay_id' => $barangay->id,
            'code' => 'INFRA',
            'name' => 'Infrastructure & Utilities',
            'default_visibility' => 'public',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $subcategory = ConcernSubcategory::first() ?? ConcernSubcategory::create([
            'category_id' => $category->id,
            'code' => 'ROAD_POTHOLE',
            'name' => 'Pothole / Road Damage',
            'force_private' => false,
        ]);

        $playbook = CategoryPlaybook::first() ?? CategoryPlaybook::create([
            'id' => Str::uuid(),
            'subcategory_id' => $subcategory->id,
            'title' => 'Standard Pothole Repair Protocol',
            'steps_template' => json_encode([
                ['step' => 1, 'task' => 'Inspect reported location and measure dimensions.'],
                ['step' => 2, 'task' => 'Apply asphalt patch and take photo.']
            ]),
            'default_duration_hours' => 24,
            'default_due_days' => 3,
            'is_active' => true,
        ]);

        // 4. Create System Users (Admin, Personnel, Resident)
        $admin = User::updateOrCreate(
            ['email' => 'admin@missionlokal.test'],
            [
                'id' => Str::uuid(),
                'barangay_id' => $barangay->id,
                'account_id' => 'ADMIN999',
                'role' => UserRole::Admin,
                'first_name' => 'System',
                'last_name' => 'Admin',
                'password' => Hash::make('password'),
                'verification_status' => VerificationStatus::Approved,
                'is_active' => true,
            ]
        );

        $personnel = User::updateOrCreate(
            ['email' => 'personnel@missionlokal.test'],
            [
                'id' => Str::uuid(),
                'barangay_id' => $barangay->id,
                'account_id' => 'PER999',
                'role' => UserRole::Personnel,
                'first_name' => 'Timothy',
                'last_name' => 'Personnel',
                'mobile' => '09189999999',
                'password' => Hash::make('password'),
                'verification_status' => VerificationStatus::Approved,
                'is_active' => true,
            ]
        );

        $resident = User::updateOrCreate(
            ['email' => 'resident@missionlokal.test'],
            [
                'id' => Str::uuid(),
                'barangay_id' => $barangay->id,
                'account_id' => 'RES999',
                'role' => UserRole::Resident,
                'first_name' => 'Juan',
                'last_name' => 'Resident',
                'mobile' => '09198888888',
                'password' => Hash::make('password'),
                'verification_status' => VerificationStatus::Approved,
                'civic_xp' => 50,
                'is_active' => true,
            ]
        );

        // 5. Populate Profiles & Requests
        ResidentProfile::updateOrCreate(
            ['user_id' => $resident->id],
            [
                'birthday' => '1992-04-12',
                'address' => 'Phase 1 Zone 15, Barangay 176',
                'digital_id_code' => 'ML-RES-9999',
                'government_id_storage_key' => 'demo/gov_id.jpg',
            ]
        );

        ProfileEditRequest::create([
            'id' => Str::uuid(),
            'user_id' => $resident->id,
            'requested_changes' => json_encode(['mobile' => '09198888888']),
            'status' => 'pending',
        ]);

        PreloadedResident::updateOrCreate(
            ['account_id' => 'RES999'],
            [
                'first_name' => 'Juan',
                'middle_name' => null,
                'last_name' => 'Resident',
                'name_extension' => null,
                'birthday' => '1992-04-12',
                'address' => 'Phase 1 Zone 15',
                'email' => 'resident@missionlokal.test',
                'mobile' => '09198888888',
                'is_claimed' => true,
                'claimed_at' => now(),
                'user_id' => $resident->id,
            ]
        );

        // 6. Populate Concerns & Associated Tables
        $concern = Concern::create([
            'id' => Str::uuid(),
            'barangay_id' => $barangay->id,
            'reporter_id' => $resident->id,
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'title' => 'Severe pothole causing traffic hazards',
            'description' => 'A large deep pothole has formed right at the curve of Phase 1 road.',
            'visibility' => 'public',
            'severity' => 'critical',
            'severity_confirmed' => true,
            'status' => ConcernStatus::Active,
            'address_text' => 'Phase 1 Curve, Zone 15',
            'location' => DB::raw("ST_GeomFromText('POINT(120.9842 14.6507)', 4326)"),
        ]);

        ConcernAiAnalysis::create([
            'id' => Str::uuid(),
            'concern_id' => $concern->id,
            'is_current' => true,
            'detected_language' => 'en',
            'suggested_category_id' => $category->id,
            'suggested_subcategory_id' => $subcategory->id,
            'suggested_visibility' => 'public',
            'suggested_severity' => 'critical',
            'severity_confidence' => 0.950,
            'processed_at' => now(),
        ]);

        ConcernMedia::create([
            'id' => Str::uuid(),
            'concern_id' => $concern->id,
            'storage_key' => 'concerns/pothole_sample.jpg',
            'mime_type' => 'image/jpeg',
            'sort_order' => 0,
            'created_at' => now(),
        ]);

        ConcernStatusHistory::create([
            'concern_id' => $concern->id,
            'from_status' => 'submitted',
            'to_status' => 'active',
            'actor_id' => $admin->id,
            'note' => 'Approved and verified by admin.',
            'created_at' => now(),
        ]);

        ConcernVote::create([
            'concern_id' => $concern->id,
            'user_id' => $resident->id,
            'vote' => 1,
        ]);

        // 7. Populate Missions & Associated Tables
        $mission = Mission::create([
            'id' => Str::uuid(),
            'barangay_id' => $barangay->id,
            'concern_id' => $concern->id,
            'assigned_to' => $personnel->id,
            'playbook_id' => $playbook->id,
            'created_by' => $admin->id,
            'status' => 'in_progress',
            'due_date' => now()->addDays(2),
            'is_overdue' => false,
            'is_escalated' => false,
        ]);

        MissionAssignment::create([
            'id' => Str::uuid(),
            'mission_id' => $mission->id,
            'personnel_id' => $personnel->id,
            'assigned_by' => $admin->id,
            'assigned_at' => now(),
        ]);

        MissionChecklistItem::create([
            'id' => Str::uuid(),
            'mission_id' => $mission->id,
            'step_order' => 1,
            'description' => 'Inspect reported location and measure dimensions.',
            'is_completed' => true,
            'completed_at' => now(),
            'completed_by' => $personnel->id,
        ]);

        $proof = MissionProof::create([
            'id' => Str::uuid(),
            'mission_id' => $mission->id,
            'submitted_by' => $personnel->id,
            'notes' => 'Area inspected and patch work in progress.',
            'submitted_at' => now(),
        ]);

        MissionProofMedia::create([
            'id' => Str::uuid(),
            'proof_id' => $proof->id,
            'storage_key' => 'proofs/pothole_fixed.jpg',
            'mime_type' => 'image/jpeg',
            'caption' => 'Asphalt application complete',
            'created_at' => now(),
        ]);

        MissionStatusHistory::create([
            'mission_id' => $mission->id,
            'from_status' => 'assigned',
            'to_status' => 'in_progress',
            'actor_id' => $personnel->id,
            'note' => 'Started fieldwork.',
            'created_at' => now(),
        ]);

        // 8. Populate Blotters & Media
        $blotter = Blotter::create([
            'id' => Str::uuid(),
            'barangay_id' => $barangay->id,
            'concern_id' => $concern->id,
            'type' => 'two_party',
            'complainant_id' => $resident->id,
            'respondent_name' => 'Juan Dela Cruz',
            'narrative' => 'Disagreement regarding shared property boundary.',
            'incident_at' => now()->subDays(2),
            'incident_address' => 'Phase 1 Zone 15',
            'ticket_number' => 'BLT-9991',
            'status' => 'filed',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        BlotterMedia::create([
            'id' => Str::uuid(),
            'blotter_id' => $blotter->id,
            'storage_key' => 'blotters/statement.pdf',
            'mime_type' => 'application/pdf',
            'created_at' => now(),
        ]);

        // 9. Populate Announcements, Library Items & Notifications
        Announcement::create([
            'id' => Str::uuid(),
            'barangay_id' => $barangay->id,
            'title' => 'Community Road Repair Advisory',
            'body' => 'Phase 1 road repairs will commence this week.',
            'is_published' => true,
            'published_at' => now(),
            'created_by' => $admin->id,
        ]);

        LibraryItem::create([
            'id' => Str::uuid(),
            'barangay_id' => $barangay->id,
            'type' => 'manual',
            'title' => 'Barangay Ordinance No. 04 - Road Safety',
            'content' => 'Guidelines on maintaining clear public roadways.',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Notification::create([
            'id' => Str::uuid(),
            'user_id' => $personnel->id,
            'channel' => 'in_app',
            'event_type' => 'mission_assigned',
            'title' => 'New Mission Assigned',
            'body' => 'You have been assigned to handle pothole repairs.',
            'is_read' => false,
            'sent_at' => now(),
        ]);

        $this->command->info('All database tables successfully seeded!');
    }
}