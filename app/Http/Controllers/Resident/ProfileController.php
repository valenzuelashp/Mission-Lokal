<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\ProfileEditRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $user->load(['residentProfile', 'barangay']);

        $reportCount = Concern::where('reporter_id', $user->id)->count();

        $firstName = $user->first_name ?? '';
        $lastName = $user->last_name ?? '';
        $fullName = trim("$firstName $lastName");
        
        if (empty($fullName)) {
            $fullName = $user->account_id ?? 'Verified Resident';
        }

        $birthdayStr = '—';
        $birthdayData = $user->residentProfile->birthday ?? null;
        if (!empty($birthdayData)) {
            $birthdayStr = is_string($birthdayData) 
                ? date('Y-m-d', strtotime($birthdayData)) 
                : $birthdayData->format('Y-m-d');
        }

        $profileData = [
            'full_name'       => $fullName,
            'email'           => $user->email,
            'mobile'          => $user->mobile ?? '—',
            'address'         => $user->residentProfile->address ?? 'No address registered',
            'birthday'        => $birthdayStr,
            'digital_id_code' => $user->residentProfile->digital_id_code ?? 'ML-ID-' . strtoupper(substr($user->id ?? '12345678', 0, 8)),
            'member_since'    => $user->created_at ? $user->created_at->format('F Y') : now()->format('F Y'),
            'report_count'    => $reportCount,
            'edit_status'     => $user->profile_edit_status ?? 'approved', 
            'badges'          => [],
        ];

        return Inertia::render('Resident/Profile', [
            'profile' => $profileData
        ]);
    }

    public function edit()
    {
        $user = Auth::user();
        
        if (($user->profile_edit_status ?? '') === 'pending_approval') {
            return redirect()->route('profile')->with('error', 'You have a modification request currently pending review.');
        }

        $user->load(['residentProfile']);

        $firstName = $user->first_name ?? '';
        $lastName = $user->last_name ?? '';

        $profileData = [
            'full_name' => trim("$firstName $lastName"),
            'email'     => $user->email,
            'mobile'    => $user->mobile ?? '',
            'address'   => $user->residentProfile->address ?? '',
        ];

        return Inertia::render('Resident/ProfileEdit', [
            'profile' => $profileData
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        
        if (($user->profile_edit_status ?? '') === 'pending_approval') {
            return back()->with('error', 'Cannot submit parallel edits while your current request is pending administrative evaluation.');
        }

        $user->load(['barangay']); 

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email'     => 'required|email|max:255|unique:users,email,' . $user->id,
            'mobile'    => 'required|string|max:20',
            'address'   => 'required|string|min:10',
        ]);

        $barangayName = $user->barangay->name ?? ''; 
        
        if (!empty($barangayName) && !Str::contains(strtolower($validated['address']), strtolower($barangayName))) {
            return back()->withErrors([
                'address' => "The address must be a valid location within the jurisdiction (nasasakupan) of {$barangayName}."
            ])->withInput();
        }

        DB::transaction(function () use ($user, $validated) {
            ProfileEditRequest::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'requested_changes' => [
                    'full_name' => $validated['full_name'],
                    'email'     => $validated['email'],
                    'mobile'    => $validated['mobile'],
                    'address'   => $validated['address'],
                ],
                'status' => 'pending',
            ]);

            $user->update(['profile_edit_status' => 'pending_approval']);
         });

        return redirect()->route('profile')->with('success', 'Edit request submitted for admin review.');
    }
}