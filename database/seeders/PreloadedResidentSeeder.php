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
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Locate the CSV file
        $filePath = database_path('seeders/preloaded_residents.csv');

        if (!File::exists($filePath)) {
            $this->command->error("Could not find the CSV file at: {$filePath}");
            return;
        }

        // 2. Open the file and clean the header row
        $file = fopen($filePath, 'r');
        $header = fgetcsv($file);
        $header[0] = trim($header[0], "\xEF\xBB\xBF"); // Remove invisible BOM characters
        
        // 3. Get the first barangay to link the users to
        $barangay = Barangay::first();
        if (!$barangay) {
            $this->command->error("No Barangay found! Please run your DatabaseSeeder first to create a Barangay.");
            return;
        }

        // 4. Loop through the rows and create records in BOTH tables
        while ($row = fgetcsv($file)) {
            $data = array_combine($header, $row);

            // Step A: Create the offline Census Record
            PreloadedResident::updateOrCreate(
                ['account_id' => $data['account_id']], 
                [
                    'first_name'     => $data['first_name'],
                    'middle_name'    => $data['middle_name'] ?: null,
                    'last_name'      => $data['last_name'],
                    'name_extension' => $data['name_extension'] ?: null,
                    'birthday'       => $data['birthday'],
                    'address'        => $data['address'] ?: null,
                    'email'          => $data['email'] ?: null,
                    'mobile'         => $data['mobile'] ?: null,
                ]
            );

            // Step B: Create the live Shell Account for Logging In
            User::updateOrCreate(
                ['account_id' => $data['account_id']], 
                [
                    'barangay_id'         => $barangay->id,
                    'role'                => UserRole::Resident,
                    
                    // Populate basic name info into the users table
                    'first_name'          => $data['first_name'],
                    'middle_name'         => $data['middle_name'] ?: null,
                    'last_name'           => $data['last_name'],
                    'name_extension'      => $data['name_extension'] ?: null,
                    'birthday'            => $data['birthday'],
                    
                    // FIX: Set the default password exactly to "password"
                    'password'            => Hash::make('password'),
                    
                    // CRITICAL: Set status to unverified so the Middleware traps them!
                    'verification_status' => VerificationStatus::Unverified,
                    'is_active'           => true,
                ]
            );
        }

        fclose($file);
        
        $this->command->info('Preloaded residents AND user shell accounts successfully seeded from CSV!');
    }
}