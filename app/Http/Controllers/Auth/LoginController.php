<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Services\LocalIdentifier;
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

        // Resolve Account ID strictly
        $resolvedId = LocalIdentifier::resolveAccountId($credentials['account_id']);

        if (! Auth::attempt(
            ['account_id' => $resolvedId, 'password' => $credentials['password']],
            $request->boolean('remember')
        )) {
            throw ValidationException::withMessages([
                'account_id' => 'Invalid Account ID or password.',
            ]);
        }

        $user = Auth::user();
        $role = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;

        // Block staff from resident portal
        if ($role === 'admin' || $role === 'personnel' || $role === 'super_admin' || $role === UserRole::Admin || $role === UserRole::Personnel || $role === UserRole::SuperAdmin) {
            Auth::logout();
            throw ValidationException::withMessages([
                'account_id' => 'Staff and administrative accounts must log in through the admin & personnel portal.',
            ]);
        }

        $request->session()->regenerate();
  
        
        $request->session()->forget('password_prompt_dismissed');
        $user?->forceFill(['last_login_at' => now()])->save();

        return redirect($this->homeFor($user));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $roleValue = null;
        if ($user) {
            $role = $user->role;
            $roleValue = $role instanceof \UnitEnum ? $role->value : $role;
        }

        $normalizedRole = strtolower(is_string($roleValue) ? $roleValue : '');

        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if (in_array($normalizedRole, ['admin', 'personnel', 'super_admin', 'superadmin'])) {
            return redirect()->route('admin-personnel.login');
        }

        return redirect()->route('login');
    }
    
    private function homeFor($user): string
    {
        $user->loadMissing('residentProfile');
        $status = $user->residentProfile?->verification_status;
        $statusValue = $status instanceof VerificationStatus ? $status->value : ($status ?? 'unverified');

        if ($statusValue !== VerificationStatus::Approved->value) {
            return route('verification.waiting');
        }

        return route('feed');
    }
}