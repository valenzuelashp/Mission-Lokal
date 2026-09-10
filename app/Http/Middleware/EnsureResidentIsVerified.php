<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureResidentIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user) {
            return $next($request);
        }

        $role = $user->role instanceof UserRole ? $user->role->value : $user->role;
        if ($role !== UserRole::Resident->value) {
            return $next($request);
        }

        if ($request->routeIs('logout', 'verification.waiting', 'password.custom.store', 'password.prompt.dismiss')) {
            return $next($request);
        }

        $user->loadMissing('residentProfile');

        $profileStatus = $user->residentProfile?->verification_status;
        $statusValue = $profileStatus instanceof VerificationStatus
            ? $profileStatus->value
            : ($profileStatus ?? 'unverified');

        if ($statusValue === VerificationStatus::Approved->value) {
            return $next($request);
        }

        if ($request->expectsJson() || ! $request->isMethod('GET')) {
            abort(403, 'You must complete verification to perform this action.');
        }

        return redirect()->route('verification.waiting');
    }
}
