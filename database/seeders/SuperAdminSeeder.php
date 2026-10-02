<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@missionlokal.com'],
            [
                'barangay_id' => null,
                'account_id' => 'SUP-001',
                'role' => UserRole::SuperAdmin,
                'is_view_only' => false,
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'password' => Hash::make('SecurePassword123!'),
                'is_active' => true,
            ]
        );
    }
}