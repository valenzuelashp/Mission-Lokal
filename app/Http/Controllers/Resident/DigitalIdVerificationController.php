<?php

namespace App\Http\Controllers\Resident;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class DigitalIdVerificationController extends Controller
{
    public function show(string $token): Response
    {
        $resident = DB::table('resident_profiles')
            ->join('users', 'users.id', '=', 'resident_profiles.user_id')
            ->where('resident_profiles.digital_id_verification_token', $token)
            ->select([
                'resident_profiles.verification_status',
                'users.role',
                'users.is_active',
                'users.first_name',
                'users.middle_name',
                'users.last_name',
                'users.name_extension',
            ])
            ->first();

        $verified = $resident !== null
            && $resident->verification_status === VerificationStatus::Approved->value
            && $resident->role === UserRole::Resident->value
            && (bool) $resident->is_active;
        $middleName = trim((string) ($resident->middle_name ?? ''));
        $cardholderName = $verified
            ? trim(implode(' ', array_filter([
                $resident->first_name,
                $middleName !== '' && strtoupper($middleName) !== 'N/A' ? $middleName : null,
                $resident->last_name,
                $resident->name_extension,
            ])))
            : null;

        return response()->view('digital-id-verification', [
            'verified' => $verified,
            'cardholderName' => $cardholderName,
        ])->header('Cache-Control', 'no-store, private')
            ->header('X-Robots-Tag', 'noindex, nofollow');
    }
}
