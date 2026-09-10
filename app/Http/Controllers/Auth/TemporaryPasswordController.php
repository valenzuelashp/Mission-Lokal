<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class TemporaryPasswordController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->numbers()->symbols(),
            ],
        ]);

        $request->user()->update([
            'password' => $request->password,
            'is_active' => true,
            'password_prompt_snoozed_on' => null,
        ]);

        return redirect()->route('feed')->with('success', 'Password successfully updated!');
    }

    public function dismiss(Request $request): RedirectResponse
    {
        $request->session()->put('password_prompt_dismissed', true);

        return back();
    }
}
