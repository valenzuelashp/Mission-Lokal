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

        // 1. If they aren't logged in, let the standard Auth middleware handle it
        if (!$user) {
            return $next($request);
        }

        // 2. We only care about checking regular Residents (Admins bypass this)
        if ($user->role === UserRole::Resident->value) {
            
            // 3. If they are anything EXCEPT approved...
            if ($user->verification_status !== VerificationStatus::Approved->value) {
                
                // 4. Prevent an infinite loop if they are already ON the onboarding page!
                if (!$request->routeIs('onboarding.*')) {
                    return redirect()->route('onboarding.start');
                }
            }
        }

        // If they pass the checks, let them into the site
        return $next($request);
    }
}