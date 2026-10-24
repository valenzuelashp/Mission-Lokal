<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProfileEditRequest;
use App\Mail\OtpMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $user =$request->user();
        $barangay = DB::table('barangays')->where('id',$user->barangay_id)->first();

        $pendingRequest = DB::table('profile_edit_requests')
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        $pendingClearance = DB::table('clearance_requests')
            ->where('admin_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        return Inertia::render('Admin/Settings', [
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ],
            'barangay' => [
                'name' => $barangay->name ?? 'Localized Container Node',
                'house_street' => $barangay->house_street ?? '',
                'city' => $barangay->city ?? '',
                'province' => $barangay->province ?? '',
                'contact_phone' => $barangay->contact_phone ?? '',
                'contact_email' => $barangay->contact_email ?? '',
                'office_address' => $barangay->office_address ?? 'Barangay Hall Complex',
            ],
            'pendingRequest' => $pendingRequest,
            'pendingClearance' => $pendingClearance
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $user = $request->user();$isEmailChanging = $request->email !==$user->email;

        $existingRequest = DB::table('profile_edit_requests')
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingRequest) {
            return back()->with('error', 'You already have a pending profile update request.');
        }

        // Base rules
        $rules = [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'barangay_name' => ['required', 'string', 'max:255'],
            'house_street' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'contact_email' => ['nullable', 'string', 'email', 'max:255'],
        ];

        // If Email is changing, they MUST provide the Super Admin Clearance Key
        if ($isEmailChanging) {$rules['super_admin_key'] = ['required', 'string'];
        }

        $request->validate($rules);

        // Verify the Clearance Key if email is changing
        if ($isEmailChanging) {
            $expectedKey = Cache::get('clearance_key_' .$user->id);
            if (!$expectedKey || $request->super_admin_key !==$expectedKey) {
                return back()->withErrors(['super_admin_key' => 'Invalid or expired Super Admin Clearance Key required to change Official Email.']);
            }
            // Clear it once used
            Cache::forget('clearance_key_' . $user->id);
        }

        $requestedChanges = [
            'user' => [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
            ],
            'barangay' => [
                'name' => $request->barangay_name,
                'house_street' => $request->house_street,
                'city' => $request->city,
                'province' => $request->province,
                'contact_phone' => $request->contact_phone,
                'contact_email' => $request->contact_email,
            ]
        ];

        ProfileEditRequest::create([
            'user_id' => $user->id,
            'requested_changes' => $requestedChanges,
            'status' => 'pending',
        ]);

        DB::table('users')->where('id', $user->id)->update([
            'profile_edit_status' => 'pending_approval',
            'updated_at' => now(),
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $user->barangay_id,
            'actor_id' => $user->id,
            'action' => 'CREATE',
            'entity_type' => 'ProfileEditRequest',
            'entity_id' => $user->id,
            'metadata' => json_encode(['details' => 'Submitted request to modify core administrative properties. Email change: ' . ($isEmailChanging ? 'Yes' : 'No')]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Profile update request submitted successfully. Please wait for super admin approval.');
    }

    public function sendOtp(Request $request): RedirectResponse
    {
        $user = $request->user();$otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        Cache::put('admin_security_otp_' . $user->id,$otp, now()->addMinutes(10));

        try {
            Mail::to($user->email)->send(new OtpMail($otp));
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send OTP. Please check your mail server configuration.');
        }

        return back()->with('success', 'A 6-digit security code has been sent to your registered email address.');
    }

    public function requestClearanceKey(Request $request): RedirectResponse
    {
        $user =$request->user();

        DB::table('clearance_requests')->insert([
            'id' => (string) Str::uuid(),
            'admin_id' => $user->id,
            'barangay_id' => $user->barangay_id,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Clearance request sent to the Super Admin. Please wait for an email with your key.');
    }

    public function updateSecurity(Request $request): RedirectResponse
    {
        $user =$request->user();

        $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)->numbers()->symbols()],
        ]);

        // If they are using the "Forgot Password" OTP Bypass
        if ($request->filled('otp')) {
            $cachedOtp = Cache::get('admin_security_otp_' .$user->id);
            if (!$cachedOtp || $cachedOtp !==$request->otp) {
                return back()->withErrors(['otp' => 'Invalid or expired OTP code. Please request a new one.']);
            }
            Cache::forget('admin_security_otp_' . $user->id);
        } 
        // Otherwise, they MUST provide their current password
        else {
            $request->validate([
                'current_password' => ['required', 'current_password'],
            ]);
        }

        DB::table('users')->where('id', $user->id)->update([
            'password' => Hash::make($request->password),
            'updated_at' => now(),
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $user->barangay_id,
            'actor_id' => $user->id,
            'action' => 'UPDATE',
            'entity_type' => 'AdminSecurity',
            'entity_id' => $user->id,
            'metadata' => json_encode(['details' => 'Updated account password. Bypass used: ' . ($request->filled('otp') ? 'Yes (Email OTP)' : 'No (Current Password)')]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Security credentials updated successfully.');
    }
}