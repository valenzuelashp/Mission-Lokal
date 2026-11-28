<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    // 1. Show the React View
    public function showRequestForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    // 2. Generate and Send the OTP
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user = User::where('email', $request->email)->first();

        // Generate a random 6 digit code
        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')
            ->where('user_id', $user->id)
            ->where('purpose', 'password_reset')
            ->delete();

        DB::table('password_reset_tokens')->insert([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'purpose' => 'password_reset',
            'otp_hash' => Hash::make($otp),
            'expires_at' => Carbon::now()->addMinutes(15),
            'created_at' => Carbon::now(),
        ]);

        // Send the email
        Mail::to($user->email)->send(new OtpMail($otp));

        return back()->with('success', 'OTP sent to your email.');
    }

    // 3. Verify the OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        $record = DB::table('password_reset_tokens')
            ->where('user_id', $user->id)
            ->where('purpose', 'password_reset')
            ->first();

        if (
            ! $record
            || $record->used_at !== null
            || ! Hash::check($request->otp, $record->otp_hash)
            || Carbon::parse($record->expires_at)->isPast()
        ) {
            return back()->withErrors(['otp' => 'The code is invalid or has expired.']);
        }

        return back()->with('success', 'OTP verified.');
    }

    // 4. Actually reset the password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => ['required', 'confirmed', Password::min(8)->numbers()->symbols()],
        ], [
            'password.numbers' => 'The password field must contain at least one number & one symbol.',
            'password.symbols' => 'The password field must contain at least one number & one symbol.',
        ]);

        $reset = DB::transaction(function () use ($request): bool {
            $user = User::where('email', $request->email)->lockForUpdate()->first();

            if (! $user) {
                return false;
            }

            $record = DB::table('password_reset_tokens')
                ->where('user_id', $user->id)
                ->where('purpose', 'password_reset')
                ->whereNull('used_at')
                ->lockForUpdate()
                ->first();

            if (
                ! $record
                || ! Hash::check($request->otp, $record->otp_hash)
                || Carbon::parse($record->expires_at)->isPast()
            ) {
                return false;
            }

            $consumed = DB::table('password_reset_tokens')
                ->where('id', $record->id)
                ->whereNull('used_at')
                ->update(['used_at' => Carbon::now()]);

            if ($consumed !== 1) {
                return false;
            }

            $user->password = $request->password;
            $user->save();

            return true;
        });

        if (! $reset) {
            return back()->withErrors([
                'otp' => 'Please verify a valid code before resetting your password.',
            ]);
        }

        return redirect()->route('login')->with('success', 'Password reset successfully. You can now log in.');
    }
}
