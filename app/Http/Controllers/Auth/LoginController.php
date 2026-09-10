<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
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
        $credentials['account_id'] = strtoupper(trim($credentials['account_id']));

        if (! Auth::attempt(
            ['account_id' => $credentials['account_id'], 'password' => $credentials['password']],
            $request->boolean('remember')
        )) {
            throw ValidationException::withMessages([
                'account_id' => 'Invalid account ID or password.',
            ]);
        }

        $request->session()->regenerate();
        $request->session()->forget('password_prompt_dismissed');

        $user = Auth::user();
        $user?->forceFill(['last_login_at' => now()])->save();

        return redirect($this->homeFor($user));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function homeFor($user): string
    {
        // Handle UserRole enum or string value gracefully
        $role = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;

        if ($role === 'admin' || $user->role === UserRole::Admin) {
            return route('admin.dashboard');
        }

        if ($role === 'personnel' || $user->role === UserRole::Personnel) {
            return route('personnel.missions.index');
        }

        $user->loadMissing('residentProfile');
        $status = $user->residentProfile?->verification_status;
        $statusValue = $status instanceof VerificationStatus ? $status->value : ($status ?? 'unverified');

        if ($statusValue !== VerificationStatus::Approved->value) {
            return route('verification.waiting');
        }

        return route('feed');
    }
}