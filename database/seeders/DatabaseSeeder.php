<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Barangay;
use App\Models\BarangaySetting;
use App\Models\User;
use App\Models\ConcernCategory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed default concern categories first to prevent foreign key constraint violations
        $categories = [
            ['id' => 1, 'code' => 'INFRA', 'name' => 'Infrastructure & Utilities', 'default_visibility' => 'public', 'sort_order' => 1, 'is_active' => true],
            ['id' => 2, 'code' => 'SANI', 'name' => 'Sanitation & Environment', 'default_visibility' => 'public', 'sort_order' => 2, 'is_active' => true],
            ['id' => 3, 'code' => 'SEC', 'name' => 'Peace & Order', 'default_visibility' => 'private', 'sort_order' => 3, 'is_active' => true],
            ['id' => 4, 'code' => 'OTHER', 'name' => 'Other Concerns', 'default_visibility' => 'public', 'sort_order' => 4, 'is_active' => true],
        ];

        foreach ($categories as $category) {
            ConcernCategory::query()->updateOrCreate(
                ['id' => $category['id']],
                $category
            );
        }

        $barangay = Barangay::query()->create([
            'code' => 'demo-barangay',
            'name' => 'Demo Barangay',
            'contact_phone' => '09171234567',
            'contact_email' => 'barangay@demo.local',
            'office_hours' => [
                'weekdays' => '8:00 AM – 5:00 PM',
            ],
            'is_active' => true,
        ]);

        BarangaySetting::query()->create([
            'barangay_id' => $barangay->id,
            'updated_at' => now(),
        ]);

        $admin = User::query()->create([
            'barangay_id' => $barangay->id,
            'account_id' => 'ADMIN001',
            'role' => UserRole::Admin,
            'first_name' => 'System', 
            'middle_name' => null,    
            'last_name' => 'Admin',   
            'name_extension' => null,    
            'email' => 'admin@demo.local',
            'password' => 'password',
        ]);
        // Admin extension/profile handling if applicable, or left as user identity hub

        $personnel = User::query()->create([
            'barangay_id' => $barangay->id,
            'account_id' => 'PER001',
            'role' => UserRole::Personnel,
            'first_name' => 'Barangay', 
            'middle_name' => 'Talon',    
            'last_name' => 'Personnel',   
            'name_extension' => 'Jr.',  
            'email' => 'personnel@demo.local',
            'mobile' => '09181234567',
            'password' => 'password',
        ]);
        
        $personnel->personnelProfile()->create([
            'is_active' => true,
        ]);

        // Resident shell user creation (removed verification_status from here)
        $resident = User::query()->create([
            'barangay_id' => $barangay->id,
            'account_id' => 'RES001',
            'role' => UserRole::Resident,
            'first_name' => 'Barangay', 
            'middle_name' => null,    
            'last_name' => 'Resident',   
            'name_extension' => 'III',   
            'email' => 'resident@demo.local',
            'mobile' => '09191234567',
            'password' => 'password',
        ]);

        // Anchor profile attributes, civic_xp, and verification_status strictly inside resident_profiles
        $resident->residentProfile()->create([
            'civic_xp' => 50, // Updated default resident civic xp to 50
            'verification_status' => VerificationStatus::Approved,
            'birthday' => '1985-05-15',
            'address' => 'Barangay Hall, Demo Barangay',
            'digital_id_code' => 'ML-ID-' . strtoupper(substr($resident->id ?? '12345678', 0, 8)),
            'government_id_storage_key' => 'demo/ids/gov_id.jpg',
        ]);
        
        $this->call([
            BlueprintCategorySeeder::class,
            LibrarySeeder::class,
            PreloadedResidentSeeder::class,
            DemoDataSeeder::class,         
        ]);
    }
}