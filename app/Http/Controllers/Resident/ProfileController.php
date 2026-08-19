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

        // Properly assemble full name including middle name and extension
        $firstName = $user->first_name ?? '';
        $middleName = $user->middle_name ?? '';
        $lastName = $user->last_name ?? '';
        $extension = $user->name_extension ?? '';

        $fullName = trim("{$firstName} " . (!empty($middleName) ? "{$middleName} " : "") . "{$lastName}" . (!empty($extension) ? " {$extension}" : ""));
        
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

        // Build address string from individual resident_profile columns
        $profile = $user->residentProfile;
        $addressStr = 'No address registered';
        if ($profile) {
            $parts = array_filter([
                $profile->house_street ?? null,
                $profile->barangay_name ?? null,
                $profile->city ?? null,
                $profile->province ?? null,
            ]);
            if (!empty($parts)) {
                $addressStr = implode(', ', $parts);
            }
        }

        $profileData = [
            'full_name'       => $fullName,
            'email'           => $user->email,
            'mobile'          => $user->mobile ?? '—',
            'sex'             => $profile->sex ?? 'Not Specified',
            'civil_status'    => $profile->civil_status ?? 'Not Specified',
            'address'         => $addressStr,
            'birthday'        => $birthdayStr,
            'digital_id_code' => $profile->digital_id_code ?? 'ML-ID-' . strtoupper(substr($user->id ?? '12345678', 0, 8)),
            'member_since'    => $user->created_at ? $user->created_at->format('F Y') : now()->format('F Y'),
            'report_count'    => $reportCount,
            'edit_status'     => $user->profile_edit_status ?? 'approved', 
            'badges'          => [],
        ];

        return Inertia::render('Resident/Profile/Index', [
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

        // Properly assemble full name including middle name and extension for edit view
        $firstName = $user->first_name ?? '';
        $middleName = $user->middle_name ?? '';
        $lastName = $user->last_name ?? '';
        $extension = $user->name_extension ?? '';

        $fullName = trim("{$firstName} " . (!empty($middleName) ? "{$middleName} " : "") . "{$lastName}" . (!empty($extension) ? " {$extension}" : ""));

        $profile = $user->residentProfile;

        $profileData = [
            'full_name'     => $fullName,
            'email'         => $user->email,
            'mobile'        => $user->mobile ?? '',
            'sex'           => $profile->sex ?? 'Male',
            'civil_status'  => $profile->civil_status ?? 'Single',
            'house_street'  => $profile->house_street ?? '',
            'barangay_name' => $profile->barangay_name ?? '',
            'city'          => $profile->city ?? '',
            'province'      => $profile->province ?? '',
        ];

        return Inertia::render('Resident/Profile/Edit', [
            'profile' => $profileData
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        
        if (($user->profile_edit_status ?? '') === 'pending_approval') {
            return back()->with('error', 'Cannot submit parallel edits while your current request is pending administrative evaluation.');
        }

        $user->load(['barangay', 'residentProfile']); 

        $validated = $request->validate([
            'full_name'     => 'required|string|max:255',
            'email'         => 'required|email|max:255|unique:users,email,' . $user->id,
            'mobile'        => 'required|string|max:20',
            'sex'           => 'required|string',
            'civil_status'  => 'required|string',
            'house_street'  => 'required|string|max:255',
            'barangay_name' => 'required|string|max:255',
            'city'          => 'required|string|max:255',
            'province'      => 'required|string|max:255',
        ]);

        $barangayName = $user->barangay->name ?? ''; 
        
        if (!empty($barangayName) && !Str::contains(strtolower($validated['barangay_name']), strtolower($barangayName))) {
            return back()->withErrors([
                'barangay_name' => "The barangay must match your assigned jurisdiction (nasasakupan) of {$barangayName}."
            ])->withInput();
        }

        // Assemble current baseline values to compare against
        $currFirst = $user->first_name ?? '';
        $currMiddle = $user->middle_name ?? '';
        $currLast = $user->last_name ?? '';
        $currExt = $user->name_extension ?? '';
        $currentFullName = trim("{$currFirst} " . (!empty($currMiddle) ? "{$currMiddle} " : "") . "{$currLast}" . (!empty($currExt) ? " {$currExt}" : ""));
        
        $profile = $user->residentProfile;

        // Build array of changes, tracking each address component individually
        $changes = [];
        if (trim($validated['full_name']) !== trim($currentFullName)) {
            $changes['full_name'] = $validated['full_name'];
        }
        if (trim($validated['email']) !== trim($user->email ?? '')) {
            $changes['email'] = $validated['email'];
        }
        if (trim($validated['mobile']) !== trim($user->mobile ?? '')) {
            $changes['mobile'] = $validated['mobile'];
        }
        if (trim($validated['sex'] ?? '') !== trim($profile->sex ?? '')) {
            $changes['sex'] = $validated['sex'];
        }
        if (trim($validated['civil_status'] ?? '') !== trim($profile->civil_status ?? '')) {
            $changes['civil_status'] = $validated['civil_status'];
        }
        if (trim($validated['house_street'] ?? '') !== trim($profile->house_street ?? '')) {
            $changes['house_street'] = $validated['house_street'];
        }
        if (trim($validated['barangay_name'] ?? '') !== trim($profile->barangay_name ?? '')) {
            $changes['barangay_name'] = $validated['barangay_name'];
        }
        if (trim($validated['city'] ?? '') !== trim($profile->city ?? '')) {
            $changes['city'] = $validated['city'];
        }
        if (trim($validated['province'] ?? '') !== trim($profile->province ?? '')) {
            $changes['province'] = $validated['province'];
        }

        if (empty($changes)) {
            return back()->withErrors(['house_street' => 'No changes were detected in your profile submission.'])->withInput();
        }

        DB::transaction(function () use ($user, $changes) {
            ProfileEditRequest::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'requested_changes' => $changes,
                'status' => 'pending',
            ]);

            $user->update(['profile_edit_status' => 'pending_approval']);
         });

        return redirect()->route('profile')->with('success', 'Edit request submitted for admin review.');
    }
}