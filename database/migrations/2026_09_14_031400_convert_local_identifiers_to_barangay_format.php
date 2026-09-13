<?php

use App\Models\Barangay;
use App\Models\Blotter;
use App\Models\PreloadedResident;
use App\Models\ResidentProfile;
use App\Models\User;
use App\Services\LocalIdentifier;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Barangay::query()->where('code', 'demo-barangay')->update(['code' => 'TAMBO']);

        $fallbackBarangay = Barangay::query()->first();
        if (! $fallbackBarangay) {
            return;
        }

        User::query()->with('barangay')->each(function (User $user) use ($fallbackBarangay) {
            $old = (string) $user->account_id;
            $new = LocalIdentifier::normalize($old, $user->barangay ?? $fallbackBarangay);
            if ($new === '' || $new === $old) {
                return;
            }

            $user->update(['account_id' => $new]);
        });

        PreloadedResident::query()->each(function (PreloadedResident $row) use ($fallbackBarangay) {
            $new = LocalIdentifier::normalize((string) $row->account_id, $fallbackBarangay);
            if ($new !== '' && $new !== $row->account_id) {
                $row->update(['account_id' => $new]);
            }
        });

        Blotter::query()->whereNotNull('ticket_number')->each(function (Blotter $blotter) use ($fallbackBarangay) {
            $new = LocalIdentifier::normalize((string) $blotter->ticket_number, $fallbackBarangay);
            if ($new !== '' && $new !== $blotter->ticket_number) {
                $blotter->update(['ticket_number' => $new]);
            }
        });

        ResidentProfile::query()->with('user')->each(function (ResidentProfile $profile) {
            $accountId = $profile->user?->account_id;
            if ($accountId && $profile->digital_id_code !== $accountId) {
                $profile->update(['digital_id_code' => $accountId]);
            }
        });
    }

    public function down(): void
    {
        // Legacy short IDs are not restored.
    }
};
