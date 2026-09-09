<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PreloadedResident;
use App\Models\User;
use App\Models\Barangay;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class PreloadedResidentSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = database_path('seeders/preloaded_residents.csv');

        if (!File::exists($filePath)) {
            $this->command->error("Could not find the CSV file at: {$filePath}");
            return;
        }

        $file = fopen($filePath, 'r');
        $header = fgetcsv($file);
        $header[0] = trim($header[0], "\xEF\xBB\xBF"); 
        
        $barangay = Barangay::first();
        if (!$barangay) {
            $this->command->error("No Barangay found! Please run your DatabaseSeeder first to create a Barangay.");
            return;
        }

        while ($row = fgetcsv($file)) {
            $data = array_combine($header, $row);
            $address = trim($data['address'] ?? '');
            $addressParts = array_map('trim', explode(',', $address, 2));

            PreloadedResident::updateOrCreate(
                ['account_id' => $data['account_id']], 
                [
                    'first_name'     => $data['first_name'],
                    'middle_name'    => $data['middle_name'] ?: null,
                    'last_name'      => $data['last_name'],
                    'name_extension' => $data['name_extension'] ?: null,
                    'birthday'       => $data['birthday'],
                    'house_street'   => $addressParts[0] ?: null,
                    'barangay_name'  => $addressParts[1] ?? null,
                    'email'          => $data['email'] ?: null,
                    'mobile'         => $data['mobile'] ?: null,
                ]
            );

            // Removed verification_status from User array
            $user = User::updateOrCreate(
                ['account_id' => $data['account_id']], 
                [
                    'barangay_id'         => $barangay->id,
                    'role'                => UserRole::Resident,
                    'first_name'          => $data['first_name'],
                    'middle_name'         => $data['middle_name'] ?: null,
                    'last_name'           => $data['last_name'],
                    'name_extension'      => $data['name_extension'] ?: null,
                    'email'               => $data['email'] ?: null,
                    'mobile'              => $data['mobile'] ?: null,
                    'password'            => Hash::make('password'),
                    'is_active'           => true,
                ]
            );
            
            // Verification status is set safely inside the residentProfile relationship
            $user->residentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'verification_status' => VerificationStatus::Unverified,
                    'birthday' => $data['birthday'],
                    'address'  => $data['address'] ?: null,
                ]
            );
        }

        fclose($file);
        
        $this->command->info('Preloaded residents AND user shell accounts successfully seeded from CSV!');
    }
}