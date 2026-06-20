<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PreloadedResident;
use Illuminate\Support\Facades\File;

class PreloadedResidentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Locate the file exactly where it lives in your folder structure
        $filePath = database_path('seeders/preloaded_residents.csv');

        // 2. Safety check: make sure the file exists
        if (!File::exists($filePath)) {
            $this->command->error("Could not find the CSV file. Please make sure it is saved at: {$filePath}");
            return;
        }

        // 3. Open the file and read the header row
        $file = fopen($filePath, 'r');
        $header = fgetcsv($file);
        
        // CLEANUP: Remove any invisible BOM characters from the very first column
        $header[0] = trim($header[0], "\xEF\xBB\xBF");
        
        // 4. Loop through the remaining rows and insert them
        while ($row = fgetcsv($file)) {
            $data = array_combine($header, $row);

            // updateOrCreate prevents duplicate errors if the seeder runs twice
            PreloadedResident::updateOrCreate(
                ['account_id' => $data['account_id']], 
                [
                    // Updated to match the new split-name structure
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
        }

        fclose($file);
        
        $this->command->info('Preloaded residents successfully seeded from CSV!');
    }
}