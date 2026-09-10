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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $barangay = Barangay::first();
        if (!$barangay) {
            $this->command->error("No Barangay found! Please run DatabaseSeeder first.");
            return;
        }

        BarangaySetting::firstOrCreate(
            ['barangay_id' => $barangay->id],
            ['updated_at' => now()]
        );

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

        $admin = User::updateOrCreate(
            ['email' => 'admin@missionlokal.test'],
            [
                'barangay_id' => $barangay->id,
                'account_id' => 'ADMIN999',
                'role' => UserRole::Admin,
                'first_name' => 'System',
                'last_name' => 'Admin',
                'password' => 'password',
                'is_active' => true,
            ]
        );

        $personnel = User::updateOrCreate(
            ['email' => 'personnel@missionlokal.test'],
            [
                'barangay_id' => $barangay->id,
                'account_id' => 'PER999',
                'role' => UserRole::Personnel,
                'first_name' => 'Timothy',
                'last_name' => 'Personnel',
                'mobile' => '09189999999',
                'password' => 'password',
                'is_active' => true,
            ]
        );
        $personnelRecord = $personnel->personnelProfile()->firstOrCreate(['user_id' => $personnel->id]);

        $resident = User::updateOrCreate(
            ['email' => 'resident@missionlokal.test'],
            [
                'barangay_id' => $barangay->id,
                'account_id' => 'RES999',
                'role' => UserRole::Resident,
                'first_name' => 'Juan',
                'last_name' => 'Resident',
                'mobile' => '09198888888',
                'password' => 'password',
                'is_active' => true,
            ]
        );

        ResidentProfile::updateOrCreate(
            ['user_id' => $resident->id],
            [
                'civic_xp' => 50,
                'verification_status' => VerificationStatus::Approved,
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
                'house_street' => 'Phase 1 Zone 15',
                'barangay_name' => 'Barangay 176',
                'email' => 'resident@missionlokal.test',
                'mobile' => '09198888888',
                'is_claimed' => true,
                'claimed_at' => now(),
                'user_id' => $resident->id,
            ]
        );

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
            'location' => DB::raw("ST_GeomFromText('POINT(14.6507 120.9842)', 4326)"),
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

        $mission = Mission::create([
            'id' => Str::uuid(),
            'barangay_id' => $barangay->id,
            'concern_id' => $concern->id,
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

        $mission->personnel()->syncWithoutDetaching([
            $personnelRecord->id => [
                'id' => (string) Str::uuid(),
                'assigned_by' => $admin->id,
                'status' => 'in_progress',
            ],
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

        $this->publishAnnouncement(
            $barangay->id,
            $admin->id,
            'Community Road Repair Advisory',
            'Phase 1 road repairs will commence this week. Expect slower traffic near the curve of Zone 15.',
            now(),
            'advisory',
        );

        $this->publishAnnouncement(
            $barangay->id,
            $admin->id,
            'Barangay Fiesta 2026',
            'Join the barangay fiesta at the covered court. There will be a morning mass, parlor games, and a community lunch. Residents are invited to wear traditional attire.',
            now('Asia/Manila')->setDate(2026, 9, 19)->setTime(8, 0),
            'event',
        );

        $this->publishAnnouncement(
            $barangay->id,
            $admin->id,
            'Relief Goods Distribution',
            'The barangay hall will distribute relief goods to registered households. Volunteers are needed to pack and hand out goods. Bring a valid ID and your digital barangay ID. Queuing starts at 9:00 AM at the covered court.',
            now('Asia/Manila')->setDate(2026, 9, 15)->setTime(9, 0),
            'volunteer',
        );

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

    private function publishAnnouncement(
        string $barangayId,
        string $createdBy,
        string $title,
        string $body,
        mixed $publishedAt,
        string $kind = 'advisory',
    ): void {
        Announcement::updateOrCreate(
            [
                'barangay_id' => $barangayId,
                'title' => $title,
            ],
            [
                'body' => $body,
                'kind' => $kind,
                'is_published' => true,
                'published_at' => $publishedAt,
                'created_by' => $createdBy,
            ],
        );
    }
}