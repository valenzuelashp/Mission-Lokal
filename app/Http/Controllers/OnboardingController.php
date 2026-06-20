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
    public function storeId(Request $request)
{
    // 1. Validate that it's actually an image
    $request->validate([
        'government_id' => 'required|image|mimes:jpeg,png,jpg|max:5120',
    ]);

    $user = $request->user();

    // 2. Store the file in 'government_ids' folder inside storage/app/private
    // We use store() so Laravel manages the file naming for security
    $path = $request->file('government_id')->store('government_ids', 'local');

    // 3. Save the path to the user's record
    $user->update(['government_id_path' => $path]);

    // 4. Redirect them to the "Pending" screen
    return redirect()->route('onboarding.pending');
}
}