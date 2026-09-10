<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminPersonnelLoginController extends Controller
{
    public function create(): Response
    {
        // FIX: Pointing to the newly renamed AdminPersonnelLogin component file
        return Inertia::render('Auth/AdminPersonnelLogin');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'account_id' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginInput = trim($credentials['account_id']);

        $field = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'account_id';

        if ($field === 'account_id') {
            $loginInput = strtoupper($loginInput);
        } else {
            $loginInput = strtolower($loginInput);
        }

        if (! Auth::attempt(
            [$field => $loginInput, 'password' => $credentials['password']],
            $request->boolean('remember')
        )) {
            throw ValidationException::withMessages([
                'account_id' => 'Invalid credentials or account identifier.',
            ]);
        }

        $user = Auth::user();
        $role = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;

        if ($role !== 'admin' && $role !== 'personnel') {
            Auth::logout();
            throw ValidationException::withMessages([
                'account_id' => 'This portal is restricted to administrators and personnel only.',
            ]);
        }

        $request->session()->regenerate();
        $user?->forceFill(['last_login_at' => now()])->save();

        if ($role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('personnel.missions.index');
    }
}