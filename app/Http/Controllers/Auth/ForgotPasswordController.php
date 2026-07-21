<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use App\Models\User;
use App\Mail\OtpMail;
use Inertia\Inertia;
use Carbon\Carbon;

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

        // Delete any old codes for this user, then save the new one using user_id
        DB::table('password_reset_tokens')->where('user_id', $user->id)->delete();
        
        DB::table('password_reset_tokens')->insert([
            'id'         => Str::uuid(),
            'user_id'    => $user->id,
            'otp_hash'   => Hash::make($otp),
            'expires_at' => Carbon::now()->addMinutes(15),
            'created_at' => Carbon::now()
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
            'otp'   => 'required|string|size:6'
        ]);

        $user = User::where('email', $request->email)->first();
        
        // Query using user_id instead of email
        $record = DB::table('password_reset_tokens')->where('user_id', $user->id)->first();

        // Check if code exists, matches the hash, and hasn't passed its explicit expiration date
        if (!$record || !Hash::check($request->otp, $record->otp_hash) || Carbon::parse($record->expires_at)->isPast()) {
            return back()->withErrors(['otp' => 'The code is invalid or has expired.']);
        }

        // Optional: Mark as used
        DB::table('password_reset_tokens')
            ->where('id', $record->id)
            ->update(['used_at' => Carbon::now()]);

        return back()->with('success', 'OTP verified.');
    }

    // 4. Actually reset the password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|exists:users,email',
            // Enforcing custom rule: 8+ characters, 1 number & 1 symbol
            'password' => ['required', 'confirmed', Password::min(8)->numbers()->symbols()], 
        ], [
            // Overriding framework defaults to merge numbers and symbols text explicitly
            'password.numbers' => 'The password field must contain at least one number & one symbol.',
            'password.symbols' => 'The password field must contain at least one number & one symbol.',
        ]);

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Clean up the token using user_id
        DB::table('password_reset_tokens')->where('user_id', $user->id)->delete();

        return redirect()->route('login')->with('success', 'Password reset successfully. You can now log in.');
    }
}