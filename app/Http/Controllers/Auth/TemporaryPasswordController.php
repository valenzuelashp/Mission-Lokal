<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
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
            'must_change_password' => false,
        ]);

        $role = $request->user()->role;
        $roleValue = $role instanceof UserRole ? $role->value : $role;
        $destination = $roleValue === UserRole::Admin->value ? 'admin.dashboard' : 'feed';

        return redirect()->route($destination)->with('success', 'Password successfully updated!');
    }

    public function dismiss(Request $request): RedirectResponse
    {
        $request->session()->put('password_prompt_dismissed', true);

        return back();
    }
}