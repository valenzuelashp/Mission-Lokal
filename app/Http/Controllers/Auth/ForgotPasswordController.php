<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use App\Mail\OtpMail;
use Inertia\Inertia;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    // 1. Show the React View (which we will build next)
    public function showRequestForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    // 2. Generate and Send the OTP
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        // Generate a random 6 digit code
        $otp = (string) random_int(100000, 999999);

        // Delete any old codes for this email, then save the new one
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($otp), // Hash it in the DB for security
            'created_at' => Carbon::now()
        ]);

        // Send the email
        Mail::to($request->email)->send(new OtpMail($otp));

        return back()->with('success', 'OTP sent to your email.');
    }

    // 3. Verify the OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6'
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        // Check if code exists, matches the hash, and isn't older than 15 mins
        if (!$record || !Hash::check($request->otp, $record->token) || Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            return back()->withErrors(['otp' => 'The code is invalid or has expired.']);
        }

        return back()->with('success', 'OTP verified.');
    }

    // 4. Actually reset the password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Clean up the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return redirect()->route('login')->with('success', 'Password reset successfully. You can now log in.');
    }
}