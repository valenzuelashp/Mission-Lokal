<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class TemporaryPasswordController extends Controller
{
    // Process and save a custom password update if requested by the user
    public function update(Request $request)
    {
        $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->numbers()->symbols(),
            ],
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($request->password),
            'is_active' => true, 
        ]);

        return redirect()->route('feed')->with('success', 'Password successfully updated!');
    }
}