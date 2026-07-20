<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Enums\VerificationStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    // 1. Show the confirmation details screen
    public function showConfirmDetails(Request $request)
    {
        $user = $request->user();

        // Find the resident in the database using their account_id
        $preloadedData = DB::table('preloaded_residents')
            ->where('account_id', $user->account_id)
            ->first();

        if (!$preloadedData) {
            abort(404, 'No preloaded data found for this account.');
        }

        return Inertia::render('Onboarding/ConfirmDetails', [
            'residentData' => [
                'first_name' => $preloadedData->first_name,
                'middle_name' => $preloadedData->middle_name,
                'last_name' => $preloadedData->last_name,
                'name_extension' => $preloadedData->name_extension,
                'birthday' => $preloadedData->birthday,
                'address' => $preloadedData->address,
                'mobile' => $preloadedData->mobile,
            ]
        ]);
    }

    // 2. Catches the ID Upload and saves it to Resident Profiles
    public function storeId(Request $request)
    {
        $request->validate([
            'government_id' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $user = $request->user();

        // Save the file securely
        $path = $request->file('government_id')->store('government_ids', 'local');

        // Update or Create the resident profile
        \App\Models\ResidentProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'government_id_storage_key' => $path,
                'rejection_reason' => null, 
            ]
        );

        $user->verification_status = VerificationStatus::Pending;
        $user->save();

        return redirect()->route('onboarding.pending');
    }

    // 3. Controls the "Waiting Room" screen
    public function showPending(Request $request)
    {
        $status = $request->user()->fresh()->verification_status->value;

        if ($status === 'approved' || $status === 'rejected') {
            return redirect()->route('onboarding.result');
        }

        return Inertia::render('Onboarding/Pending', [
            'status' => $status
        ]);
    }

    // Render the password creation view
    public function showPasswordForm(Request $request)
    {
        $user = $request->user()->fresh();
        $status = $user->verification_status->value;

        if ($status === 'unverified' || $status === 'pending' || $status === 'in_progress') {
            return redirect()->route('onboarding.pending');
        }

        $rejectionReason = null;
        if ($status === 'rejected') {
            $profile = DB::table('resident_profiles')->where('user_id', $user->id)->first();
            $rejectionReason = $profile ? $profile->rejection_reason : 'Your ID was not accepted. Please ensure the image is clear and matches your registered details.';
        }

        return Inertia::render('Onboarding/Result', [
            'status' => $status,
            'rejectionReason' => $rejectionReason
        ]);
    }

    // Shows the Password Setup Screen
    public function showSetPassword(Request $request)
    {
        // Security check: Only officially approved residents should see this screen!
        if ($request->user()->verification_status->value !== 'approved') {
            return redirect()->route('onboarding.pending');
        }

        return Inertia::render('Onboarding/Password');
    }

    // Saves the new password and finishes onboarding
    public function storePassword(Request $request)
    {
        // Enforce the 8+ character rule alongside the special characters/numeric requirements
        $request->validate([
            'password' => [
                'required', 
                'confirmed', 
                Password::min(8)->numbers()->symbols()
            ],
        ]);

        $user = $request->user();
        
        // Hash the new password and save it directly to the users table
        $user->password = Hash::make($request->password);
        $user->is_active = true; // Turn profile active upon setup completion
        $user->save();

        return redirect()->route('feed'); 
    }
}