<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;

class EnsureResidentIsVerified
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            return $next($request);
        }

        // Force a fresh database check to overwrite stale session cache state
        $user->refresh();

        if ($user->role === UserRole::Resident) {
            // Always allow onboarding endpoints or logging out to pass through cleanly
            if ($request->routeIs('onboarding.*') || $request->is('logout')) {
                return $next($request);
            }

            // 1. If their account is fully setup and active, let them enter the resident feed app
            if ($user->is_active) {
                return $next($request);
            }

            // 2. If approved but password isn't established yet, lock them to the setup screen
            if ($user->verification_status === VerificationStatus::Approved) {
                return redirect()->route('onboarding.password');
            }

            // 3. Match pending states
            if ($user->verification_status === VerificationStatus::Pending) {
                return redirect()->route('onboarding.pending');
            }

            // 4. Match rejected states
            if ($user->verification_status === VerificationStatus::Rejected) {
                return redirect()->route('onboarding.rejected');
            }

            // Fallback for empty or new profiles
            return redirect()->route('onboarding.confirm');
        }

        return $next($request);
    }
}