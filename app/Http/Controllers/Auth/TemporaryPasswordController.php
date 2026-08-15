<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class TemporaryPasswordController extends Controller
{
    // Show the modal prompt asking if they want to change now or later
    public function showPrompt()
    {
        return Inertia::render('Auth/PasswordPromptModal');
    }

    // Dismiss the prompt for the current session ("Remind Me Next Time")
    public function dismiss(Request $request)
    {
        session(['dismissed_password_prompt' => true]);

        return redirect()->route('feed');
    }

    // Show the actual form to input the new custom password
    public function showForm()
    {
        return Inertia::render('Auth/PasswordPromptModal');
    }

    // Process and save the new password permanently
    public function update(Request $request)
    {
        $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->numbers()->symbols(), // 8+ chars, 1 number, 1 symbol
            ],
        ]);

        $user = $request->user();

        // Update password and permanently mark account as active
        $user->update([
            'password' => Hash::make($request->password),
            'is_active' => true, 
        ]);

        // Clear the session reminder flag
        session()->forget('dismissed_password_prompt');

        return redirect()->route('feed')->with('success', 'Password successfully updated!');
    }
}