<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Enums\VerificationStatus; // Don't forget to import the Enum!

class OnboardingController extends Controller
{
    // 1. Shows the Confirmation Screen
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
                // Note: I left your column name as is, but make sure your React Admin view
                // is looking for 'government_id_storage_key' and not 'id_photo_path'!
                'government_id_storage_key' => $path,
                'rejection_reason' => null, 
            ]
        );

        // FIX 1: Directly assign the Enum to bypass the $fillable array trap!
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

    // 4. Controls the Approved/Rejected Results screen
    public function showResult(Request $request)
    {
        $user = $request->user()->fresh();
        
        // FIX 2: Add ->value here so the string comparisons work!
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
}