<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Services\LocalIdentifier;
use App\Services\SessionSecurity;
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
        return Inertia::render('Auth/AdminPersonnelLogin');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'account_id' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // Strictly resolve as an Account ID (Disallowing emails)
        $resolvedId = LocalIdentifier::resolveAccountId(trim($credentials['account_id']));

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

        if ($role !== 'admin' && $role !== 'personnel' && $role !== 'super_admin') {
            Auth::logout();
            throw ValidationException::withMessages([
                'account_id' => 'This portal is restricted to administrators and personnel only.',
            ]);
        }

        app(SessionSecurity::class)->activate($request, $user);

        if ($role === 'super_admin' || $role === UserRole::SuperAdmin) {
            return redirect()->route('super_admin.barangays.index');
        }

        if ($role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('personnel.missions.index');
    }
}
