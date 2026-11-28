<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

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

        DB::table('password_reset_tokens')
            ->where('user_id', $user->id)
            ->where('purpose', 'security_change')
            ->delete();

        DB::table('password_reset_tokens')->insert([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'purpose' => 'security_change',
            'otp_hash' => Hash::make($otp),
            'expires_at' => Carbon::now()->addMinutes(15),
            'created_at' => Carbon::now(),
        ]);

        Mail::to($user->email)->send(new OtpMail($otp));

        session([
            'security_otp_sent_to' => $user->email,
            'security_otp_sent_at' => now(),
        ]);

        return redirect()->route('profile.security.verify.form')->with('success', 'Verification code sent to your email.');
    }

    public function showRequestOtpForm()
    {
        return Inertia::render('Resident/Security/SecurityVerify', [
            'email' => Auth::user()->email ?? '',
            'codeSent' => false,
        ]);
    }

    /**
     * Show OTP Verification Form
     */
    public function showVerifyForm(Request $request)
    {
        $user = Auth::user();
        $email = session('security_otp_sent_to') ?? $user->email;
        $sentAt = session('security_otp_sent_at');
        $codeSent = $email === $user->email
            && $sentAt !== null
            && Carbon::parse($sentAt)->addMinutes(15)->isFuture();

        return Inertia::render('Resident/Security/SecurityVerify', [
            'email' => $user->email,
            'codeSent' => $codeSent,
        ]);
    }

    /**
     * Verify the submitted OTP code
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = Auth::user();
        $validOtp = DB::transaction(function () use ($request, $user): bool {
            $record = DB::table('password_reset_tokens')
                ->where('user_id', $user->id)
                ->where('purpose', 'security_change')
                ->lockForUpdate()
                ->first();

            if (
                ! $record
                || $record->used_at !== null
                || Carbon::parse($record->expires_at)->isPast()
                || ! Hash::check($request->otp, $record->otp_hash)
            ) {
                return false;
            }

            return DB::table('password_reset_tokens')
                ->where('id', $record->id)
                ->whereNull('used_at')
                ->update(['used_at' => Carbon::now()]) === 1;
        });

        if (! $validOtp) {
            return back()->withErrors(['otp' => 'The code is invalid or has expired.']);
        }

        session()->forget(['security_otp_sent_to', 'security_otp_sent_at']);
        session(['security_verified_until' => now()->addMinutes(10)]);

        return redirect()->route('profile.security');
    }

    /**
     * Display the security settings page (Protected by OTP session check).
     */
    public function index(Request $request)
    {
        if (! session('security_verified_until') || Carbon::now()->greaterThan(session('security_verified_until'))) {
            return redirect()->route('profile.security.request.form');
        }

        return Inertia::render('Resident/Security/Security');
    }

    /**
     * Handle the password update request.
     */
    public function updatePassword(Request $request)
    {
        if (! session('security_verified_until') || Carbon::now()->greaterThan(session('security_verified_until'))) {
            return redirect()->route('profile.security.request.form')->with('error', 'Security session expired. Please re-verify.');
        }

        $user = Auth::user();

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->numbers()->symbols(),
            ],
        ], [
            'current_password.current_password' => 'The provided password does not match your current password.',
            'password.confirmed' => 'The password confirmation does not match.',
            'password.numbers' => 'The password field must contain at least one number & one symbol.',
            'password.symbols' => 'The password field must contain at least one number & one symbol.',
        ]);

        $user->password = $request->password;
        $user->save();

        session()->forget('security_verified_until');

        return redirect()->route('profile')->with('success', 'Password successfully updated.');
    }
}
