<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'account_id' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt(
            ['account_id' => $credentials['account_id'], 'password' => $credentials['password']],
            $request->boolean('remember')
        )) {
            throw ValidationException::withMessages([
                'account_id' => 'Invalid account ID or password.',
            ]);
        }

        $request->session()->regenerate();

        return redirect($this->homeFor(Auth::user()->role));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function homeFor(UserRole $role): string
    {
        return match ($role) {
            UserRole::Admin => route('admin.dashboard'),
            UserRole::Personnel => route('personnel.missions.index'),
            default => route('feed'),
        };
    }
}
