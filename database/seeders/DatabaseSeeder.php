<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Barangay;
use App\Models\BarangaySetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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

        User::query()->create([
            'barangay_id' => $barangay->id,
            'account_id' => 'ADMIN001',
            'role' => UserRole::Admin,
            'first_name' => 'System', 
            'middle_name' => null,    
            'last_name' => 'Admin',   
            'name_extension' => null,    
            'email' => 'admin@demo.local',
            'password' => 'password',
            'verification_status' => VerificationStatus::Approved,
        ]);

        User::query()->create([
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
            'verification_status' => VerificationStatus::Approved,
        ]);

        // Capture the core testing Resident profile block
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
            'verification_status' => VerificationStatus::Approved,
            'civic_xp' => 25,
        ]);

        // Anchor the profile data strictly inside resident_profiles
        $resident->residentProfile()->create([
            'birthday' => '1985-05-15',
            'address' => 'Barangay Hall, Demo Barangay',
            'digital_id_code' => 'ML-ID-' . strtoupper(substr($resident->id ?? '12345678', 0, 8)),
            'government_id_storage_key' => 'demo/ids/gov_id.jpg',
        ]);
        
        $this->call([
            BlueprintCategorySeeder::class,
            LibrarySeeder::class,
        ]);
    }
}