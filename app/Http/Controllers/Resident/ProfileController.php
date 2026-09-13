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

        $profileStatus = $profile?->verification_status;
        $profileStatusValue = $profileStatus instanceof \UnitEnum ? $profileStatus->value : ($profileStatus ?? 'unverified');
        if ($profileStatusValue === 'verified') {
            $profileStatusValue = 'approved';
        }

        $profileData = [
            'full_name'           => $fullName,
            'email'               => $user->email,
            'mobile'              => $user->mobile ?? '—',
            'sex'                 => $profile->sex ?? 'Not Specified',
            'civil_status'        => $profile->civil_status ?? 'Not Specified',
            'address'             => $addressStr,
            'birthday'            => $birthdayStr,
            'verification_status' => $profileStatusValue,
            'digital_id_code'     => $profile?->digital_id_code ?: ($user->account_id ?? 'PENDING'),
            'member_since'        => $user->created_at ? $user->created_at->format('F Y') : now()->format('F Y'),
            'report_count'        => $reportCount,
            'edit_status'         => $user->profile_edit_status ?? 'approved', 
            'is_minor'            => $user->isMinor(),
            'parent_name'         => $user->parent_name ?? '',
            'parent_contact'      => $user->parent_contact ?? '',
            'badges'              => [],
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

        $firstName = $user->first_name ?? '';
        $middleName = $user->middle_name ?? '';
        $lastName = $user->last_name ?? '';
        $extension = $user->name_extension ?? '';

        $fullName = trim("{$firstName} " . (!empty($middleName) ? "{$middleName} " : "") . "{$lastName}" . (!empty($extension) ? " {$extension}" : ""));

        $profile = $user->residentProfile;

        $birthdayStr = '—';
        $birthdayData = $profile?->birthday;
        if (! empty($birthdayData)) {
            $birthdayStr = is_string($birthdayData)
                ? date('F d, Y', strtotime($birthdayData))
                : $birthdayData->format('F d, Y');
        }

        $profileData = [
            'full_name'     => $fullName,
            'email'         => $user->email,
            'mobile'        => $user->mobile ?? '',
            'sex'           => $profile?->sex ?? '—',
            'civil_status'  => $profile?->civil_status ?? '—',
            'birthday'      => $birthdayStr,
            'house_street'  => $profile?->house_street ?? '',
            'barangay_name' => $profile?->barangay_name ?? '',
            'city'          => $profile?->city ?? '',
            'province'      => $profile?->province ?? '',
            'is_minor'      => $user->isMinor(),
            'parent_name'   => $user->parent_name ?? '',
            'parent_contact'=> $user->parent_contact ?? '',
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

        $rules = [
            'email'  => 'required|email|max:255|unique:users,email,'.$user->id,
            'mobile' => 'required|string|max:20',
        ];

        if ($user->isMinor()) {
            $rules['parent_name'] = 'required|string|max:255';
            $rules['parent_contact'] = 'required|string|max:20';
        }

        $validated = $request->validate($rules);

        $changes = [];
        if (trim($validated['email']) !== trim($user->email ?? '')) {
            $changes['email'] = $validated['email'];
        }
        if (trim($validated['mobile']) !== trim($user->mobile ?? '')) {
            $changes['mobile'] = $validated['mobile'];
        }

        if ($user->isMinor()) {
            if (trim($validated['parent_name'] ?? '') !== trim($user->parent_name ?? '')) {
                $changes['parent_name'] = $validated['parent_name'];
            }
            if (trim($validated['parent_contact'] ?? '') !== trim($user->parent_contact ?? '')) {
                $changes['parent_contact'] = $validated['parent_contact'];
            }
        }

        if ($changes === []) {
            return back()->withErrors([
                'email' => 'No contact changes were detected. Census details can only be corrected at the barangay hall.',
            ])->withInput();
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