<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SecurityController extends Controller
{
    /**
     * Display the security settings page.
     */
    public function index()
    {
        return Inertia::render('Resident/Security');
    }

    /**
     * Handle the password update request.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        // Enforce: 8+ characters, 1 number, 1 symbol
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required', 
                'confirmed', 
                Password::min(8)
                    ->numbers()
                    ->symbols()
            ],
        ], [
            'current_password.current_password' => 'The provided password does not match your current password.',
            'password.confirmed'                => 'The password confirmation does not match.', // Explicit mismatch warning
            'password.min'                      => 'Password: 8+ characters, 1 number & 1 symbol.',
            'password.numbers'                  => 'Password: 8+ characters, 1 number & 1 symbol.',
            'password.symbols'                  => 'Password: 8+ characters, 1 number & 1 symbol.',
        ]);

        // Update the hashed password in the users table
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password successfully updated.');
    }
}