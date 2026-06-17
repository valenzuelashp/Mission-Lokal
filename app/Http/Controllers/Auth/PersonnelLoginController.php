<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PersonnelLoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/PersonnelLogin');
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

        if (Auth::user()->role->value !== 'personnel') {
            Auth::logout();
            throw ValidationException::withMessages([
                'account_id' => 'This portal is for personnel only.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('personnel.missions.index'));
    }
}
