<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PreloadedResident;
use App\Models\User;
use App\Models\Barangay;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use Illuminate\Support\Facades\File;

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

        $demoApprovedIds = ['RES001', 'RES002', 'RES003', 'RES004', 'RES005'];
        $demoLogins = [];

        while ($row = fgetcsv($file)) {
            $data = array_combine($header, $row);
            $accountId = $data['account_id'];
            $address = trim($data['address'] ?? '');
            $addressParts = array_map('trim', explode(',', $address, 2));
            $isDemoApproved = in_array($accountId, $demoApprovedIds, true);
            $tempPassword = $this->temporaryPassword($accountId, $data['last_name']);

            $census = PreloadedResident::updateOrCreate(
                ['account_id' => $accountId],
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
                    'civil_status'   => 'Single',
                    'is_claimed'     => $isDemoApproved,
                    'claimed_at'     => $isDemoApproved ? now() : null,
                ]
            );

            $user = User::updateOrCreate(
                ['account_id' => $accountId],
                [
                    'barangay_id'         => $barangay->id,
                    'role'                => UserRole::Resident,
                    'first_name'          => $data['first_name'],
                    'middle_name'         => $data['middle_name'] ?: null,
                    'last_name'           => $data['last_name'],
                    'name_extension'      => $data['name_extension'] ?: null,
                    'email'               => $data['email'] ?: strtolower($accountId).'@example.com',
                    'mobile'              => $data['mobile'] ?: null,
                    'password'            => $isDemoApproved ? $tempPassword : 'password',
                    'is_active'           => ! $isDemoApproved,
                ]
            );

            if ($isDemoApproved) {
                $census->update(['user_id' => $user->id]);
                $demoLogins[] = "{$accountId} / {$tempPassword}";
            }

            $user->residentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'verification_status' => $isDemoApproved
                        ? VerificationStatus::Approved
                        : VerificationStatus::Unverified,
                    'birthday' => $data['birthday'],
                    'address'  => $data['address'] ?: null,
                    'digital_id_code' => $isDemoApproved
                        ? 'ML-ID-'.strtoupper(substr(md5($user->id), 0, 8))
                        : null,
                ]
            );
        }

        fclose($file);

        $this->command->info('Preloaded residents AND user shell accounts successfully seeded from CSV!');
        if ($demoLogins !== []) {
            $this->command->info('Demo approved residents (change-password prompt on login):');
            foreach ($demoLogins as $login) {
                $this->command->line('  '.$login);
            }
        }
    }

    private function temporaryPassword(string $accountId, string $lastName): string
    {
        $cleanLastName = preg_replace('/[^a-zA-Z0-9]/', '', $lastName);
        $readableLastName = ucfirst(strtolower($cleanLastName ?: 'Resident'));

        return $accountId.'!'.$readableLastName;
    }
}