<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    // 1. Shows the Confirmation Screen
    public function showConfirmDetails(Request $request)
    {
        $user = $request->user();

        // Find the resident in the database using their email
        $preloadedData = DB::table('preloaded_residents')
            ->where('account_id', $user->account_id)
            ->first();

        // If they aren't in the CSV, throw a safe error
        if (!$preloadedData) {
            abort(404, 'No preloaded data found for this account.');
        }

        // Send the exact database columns to your React frontend!
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

    // 2. Catches the ID Upload (We will build this out fully next!)
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
                'rejection_reason' => null, // Clear any old rejection reason if they upload a new ID
            ]
        );

        // Make absolutely sure their status is set to pending
        $user->update(['verification_status' => 'pending']);

        return redirect()->route('onboarding.pending');
    }
// 3. Shows the Approved or Rejected Result Screen
    // 3. Controls the "Waiting Room" screen
    // 3. Controls the "Waiting Room" screen
    public function showPending(Request $request)
    {
        // FIX: Use fresh() to pull the live database status, ignoring the cached session
        $status = $request->user()->fresh()->verification_status;

        // If the Admin has already made a decision, push them to the results page
        if ($status === 'approved' || $status === 'rejected') {
            return redirect()->route('onboarding.result');
        }

        // Otherwise, they are still pending, so render the waiting room
        return Inertia::render('Onboarding/Pending');
    }

    // 4. Controls the Approved/Rejected Results screen
    public function showResult(Request $request)
    {
        // FIX: Use fresh() here as well to ensure we have the absolute latest user data
        $user = $request->user()->fresh();
        $status = $user->verification_status;

        // If they are trying to peek at the results but are still pending, push them back
        if ($status === 'pending' || $status === 'in_progress') {
            return redirect()->route('onboarding.pending');
        }

        // If rejected, fetch the exact reason from the resident_profiles table
        $rejectionReason = null;
        if ($status === 'rejected') {
            $profile = DB::table('resident_profiles')->where('user_id', $user->id)->first();
            $rejectionReason = $profile ? $profile->rejection_reason : 'Your ID was not accepted. Please ensure the image is clear and matches your registered details.';
        }

        // Send the status and reason to the React frontend
        return Inertia::render('Onboarding/Result', [
            'status' => $status,
            'rejectionReason' => $rejectionReason
        ]);
    }
}