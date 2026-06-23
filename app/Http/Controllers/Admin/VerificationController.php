<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PreloadedResident;
use App\Enums\VerificationStatus;
use Inertia\Inertia;

class VerificationController extends Controller
{
    // 1. Show the list of everyone waiting in line
    public function index()
    {
        $users = User::with('residentProfile')
            ->where(function ($query) {
                $query->where('verification_status', 'pending')
                      ->orWhere('verification_status', 'in_progress');
            })
            ->orderBy('updated_at', 'asc')
            ->get();

        $queue = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'account_id' => $user->account_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                // The ?? 'pending' handles nulls, and the ?-> prevents the crash
                'verification_status' => $user->verification_status?->value ?? 'pending', 
                'created_at' => $user->created_at,
            ];
        });

        return Inertia::render('Admin/Verifications', [
            'queue' => $queue
        ]);
    }

    // 2. Open a specific resident to review their ID
    public function show(User $user)
    {
        // When the admin opens it, change status to In Progress!
        // This triggers the dynamic blue UI on the resident's screen!
        if ($user->verification_status === \App\Enums\VerificationStatus::Pending) {
            $user->verification_status = \App\Enums\VerificationStatus::InProgress;
            $user->save();
        }

        // Get their official census record to compare against
        $censusData = PreloadedResident::where('account_id', $user->account_id)->first();
        $user->load('residentProfile');

        // Load their uploaded ID
        $user->load('residentProfile');

        return Inertia::render('Admin/VerificationShow', [
            'resident' => $user,
            'censusData' => $censusData
        ]);
    }

    // 3. Approve the Resident
    public function approve(User $user)
    {
        $user->verification_status = VerificationStatus::Approved;
        $user->save();

        return redirect()->route('admin.verifications.index')
            ->with('success', 'Resident officially verified!');
    }

    // 4. Reject the Resident (Requires a reason)
    public function reject(Request $request, User $user)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:255'
        ]);

        $user->verification_status = VerificationStatus::Rejected;
        $user->save();

        // Save the reason to their profile so they can see it
        $profile = $user->residentProfile;
        if ($profile) {
            $profile->rejection_reason = $request->rejection_reason;
            $profile->save();
        }

        return redirect()->route('admin.verifications.index')
            ->with('success', 'Resident rejected. They have been notified to re-upload.');
    }
    
}