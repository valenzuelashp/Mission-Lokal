<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PreloadedResident;
use App\Models\ResidentRegistration;
use App\Services\GovernmentIdStorage;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountStatusController extends Controller
{
    public function search(Request $request): Response
    {
        $query = trim($request->input('query'));
        $result = null;

        if ($query) {
            // Clean up query terms
            $terms = array_values(array_filter(explode(' ', preg_replace('/[^a-zA-Z0-9\s]/', '', $query))));

            $user = null;

            if (count($terms) >= 2) {
                // Precise exact matching for First and Last name using standard LIKE
                $firstName = $terms[0];
                $lastName = end($terms);

                $user = User::where('role', 'resident')
                    ->where('first_name', 'like', $firstName)
                    ->where('last_name', 'like', $lastName)
                    ->with('residentProfile')
                    ->first();

                // Fallback check in preloaded_residents if not mapped to user yet
                if (!$user) {
                    $preloaded = PreloadedResident::where('first_name', 'like', $firstName)
                        ->where('last_name', 'like', $lastName)
                        ->first();

                    if ($preloaded) {
                        $user = User::where('account_id', $preloaded->account_id)->with('residentProfile')->first();
                    }
                }
            }

            if ($user) {
                $profileStatus = $user->residentProfile?->verification_status;
                $status = $profileStatus instanceof \App\Enums\VerificationStatus
                    ? $profileStatus->value
                    : ($profileStatus ?? 'unverified');
                $result = [
                    'id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $this->formatFullName($user->first_name, $user->middle_name, $user->last_name, $user->name_extension),
                    'status' => $status,
                    'message' => $this->getStatusMessage($status),
                    'rejection_reason' => $user->residentProfile?->rejection_reason,
                ];
            } else {
                $registration = null;

                if (count($terms) >= 2) {
                    $registration = ResidentRegistration::where('first_name', 'like', $firstName)
                        ->where('last_name', 'like', $lastName)
                        ->first();
                }

                if (! $registration && filter_var($query, FILTER_VALIDATE_EMAIL)) {
                    $registration = ResidentRegistration::whereRaw('LOWER(email) = ?', [strtolower($query)])->first();
                }

                if ($registration) {
                    $result = [
                        'email' => $registration->email,
                        'full_name' => $this->formatFullName($registration->first_name, $registration->middle_name, $registration->last_name),
                        'status' => 'pending',
                        'message' => $this->getStatusMessage('pending'),
                    ];
                } else {
                    $result = [
                        'not_found' => true,
                        'message' => 'No exact match found. Please enter your complete First Name and Last Name (e.g. Juan Cruz).',
                    ];
                }
            }
        }

        return Inertia::render('Auth/AccountStatus', [
            'searchResult' => $result,
            'query' => $query,
        ]);
    }

    private function formatFullName(?string ...$parts): string
    {
        return collect($parts)
            ->filter(fn (?string $part) => filled($part) && strtoupper(trim($part)) !== 'N/A')
            ->map(fn (string $part) => trim($part))
            ->implode(' ');
    }

    public function waiting(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $user->loadMissing('residentProfile');

        $status = $user->residentProfile?->verification_status;
        $statusValue = $status instanceof \App\Enums\VerificationStatus
            ? $status->value
            : ($status ?? 'unverified');

        if ($statusValue === 'approved') {
            return redirect()->route('feed');
        }

        return Inertia::render('Auth/VerificationWaiting', [
            'status' => $statusValue,
            'rejection_reason' => $user->residentProfile?->rejection_reason,
            'full_name' => trim("{$user->first_name} {$user->last_name}"),
        ]);
    }

    public function showResubmitForm(string $id): Response
    {
        $user = User::where('id', $id)
            ->whereHas('residentProfile', fn($q) => $q->where('verification_status', 'rejected'))
            ->with('residentProfile')
            ->firstOrFail();

        return Inertia::render('Auth/ResubmitRegistration', [
            'resident' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'middle_name' => $user->middle_name,
                'last_name' => $user->last_name,
                'name_extension' => $user->name_extension,
                'email' => $user->email,
                'mobile' => $user->mobile,
                'sex' => $user->sex ?? 'Male',
                'civil_status' => $user->civil_status ?? 'Single',
                'house_street' => $user->house_street ?? '',
                'barangay_name' => $user->barangay_name ?? '',
                'city' => $user->city ?? '',
                'province' => $user->province ?? '',
                'birthday' => $user->residentProfile?->birthday ?? '',
                'rejection_reason' => $user->residentProfile?->rejection_reason,
            ]
        ]);
    }

    public function storeResubmit(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email',
            'government_id' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ]);

        $user = User::where('id', $id)
            ->whereHas('residentProfile', fn($q) => $q->where('verification_status', 'rejected'))
            ->with('residentProfile')
            ->firstOrFail();

        $path = app(GovernmentIdStorage::class)->storeEncrypted($request->file('government_id'));

        // Update user text data if adjusted
        $user->update([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'mobile' => $request->mobile,
        ]);

        // Shift verification status back to pending and clear rejection reason inside residentProfile
        $user->residentProfile()->update([
            'verification_status' => 'pending',
            'rejection_reason' => null,
        ]);

        // Recreate the temporary registration entry so it pops back up in the admin verification queue
        $registration = ResidentRegistration::create([
            'barangay_id' => $user->barangay_id,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'name_extension' => $request->name_extension,
            'email' => $user->email,
            'mobile' => $request->mobile,
            'sex' => $request->sex ?? 'Male',
            'civil_status' => $request->civil_status ?? 'Single',
            'house_street' => $request->house_street ?? 'Provided',
            'barangay_name' => $request->barangay_name ?? 'Barangay',
            'city' => $request->city ?? 'City',
            'province' => $request->province ?? 'Province',
            'birthday' => $request->birthday ?? now(),
            'government_id_path' => $path,
        ]);

        Notification::notifyBarangayAdmins(
            $user->barangay_id,
            'resident_registration',
            'Registration resubmitted',
            trim($request->first_name.' '.$request->last_name).' resubmitted a registration for review.',
            ['registration_id' => $registration->id]
        );

        return redirect()->route('account.status')
            ->with('success', 'Your updated registration and new ID have been successfully re-submitted and are back in the admin review queue.');
    }

    private function getStatusMessage(string $status): string
    {
        return match ($status) {
            'unverified' => 'Your record exists in the barangay system, but you have not registered yet. Please click "Proceed to Registration Form" to submit your details and Government ID.',
            'pending' => 'Your registration has been submitted and is waiting in the admin verification queue for review.',
            'in_progress' => 'An administrator is currently reviewing and comparing your submitted details against barangay records.',
            'approved' => 'Your account has been approved! Please check your email inbox for your temporary login credentials.',
            'rejected' => 'Your application requires resubmission or correction of details. Please check the feedback below and click to proceed to the resubmission form.',
            default => 'Unknown status.',
        };
    }
}