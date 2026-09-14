<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use App\Mail\OtpMail;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Str;

class SecurityController extends Controller
{
    /**
     * Step 1: Request OTP before entering security/change password
     */
    public function requestOtp(Request $request)
    {
        $user = Auth::user();

        if (empty($user->email)) {
            return redirect()->route('profile')->with('error', 'Please update your email address before changing your password.');
        }

        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')->where('user_id', $user->id)->delete();
        
        DB::table('password_reset_tokens')->insert([
            'id'         => Str::uuid(),
            'user_id'    => $user->id,
            'otp_hash'   => Hash::make($otp),
            'expires_at' => Carbon::now()->addMinutes(15),
            'created_at' => Carbon::now()
        ]);

        Mail::to($user->email)->send(new OtpMail($otp));

        session(['security_otp_sent_to' => $user->email]);

        return redirect()->route('profile.security.verify.form')->with('success', 'Verification code sent to your email.');
    }

    /**
     * Show OTP Verification Form
     */
    public function showVerifyForm(Request $request)
    {
        $user = Auth::user();
        $email = session('security_otp_sent_to') ?? $user->email;

        return Inertia::render('Resident/Security/SecurityVerify', [
            'email' => $email
        ]);
    }

    /**
     * Verify the submitted OTP code
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6']
        ]);

        $user = Auth::user();
        $record = DB::table('password_reset_tokens')->where('user_id', $user->id)->first();

        if (!$record || !Hash::check($request->otp, $record->otp_hash) || Carbon::parse($record->expires_at)->isPast()) {
            return back()->withErrors(['otp' => 'The code is invalid or has expired.']);
        }

        DB::table('password_reset_tokens')
            ->where('id', $record->id)
            ->update(['used_at' => Carbon::now()]);

        session(['security_verified_until' => now()->addMinutes(10)]);

        return redirect()->route('profile.security');
    }

    /**
     * Display the security settings page (Protected by OTP session check).
     */
    public function index(Request $request)
    {
        if (!session('security_verified_until') || Carbon::now()->greaterThan(session('security_verified_until'))) {
            return redirect()->route('profile.security.request');
        }

        return Inertia::render('Resident/Security/Security');
    }

    /**
     * Handle the password update request.
     */
    public function updatePassword(Request $request)
    {
        if (!session('security_verified_until') || Carbon::now()->greaterThan(session('security_verified_until'))) {
            return redirect()->route('profile.security.request')->with('error', 'Security session expired. Please re-verify.');
        }

        $user = Auth::user();

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required', 
                'confirmed', 
                Password::min(8)->numbers()->symbols()
            ],
        ], [
            'current_password.current_password' => 'The provided password does not match your current password.',
            'password.confirmed'                => 'The password confirmation does not match.',
            'password.numbers'                  => 'The password field must contain at least one number & one symbol.',
            'password.symbols'                  => 'The password field must contain at least one number & one symbol.',
        ]);

        $user->password = $request->password;
        $user->save();

        session()->forget('security_verified_until');

        return redirect()->route('profile')->with('success', 'Password successfully updated.');
    }
}