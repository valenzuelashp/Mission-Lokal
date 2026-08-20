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
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        if (!$user) return $next($request);

        $user->refresh();

        if ($user->role === UserRole::Resident) {
            // Always allow onboarding and logout routes to pass
            if ($request->routeIs('onboarding.*') || $request->is('logout')) {
                return $next($request);
            }

            $isFullyVerified = $user->verification_status === VerificationStatus::Approved
                && ! $user->needsPasswordSetup();

            // 1. If fully verified and secured, let them interact with the app
            if ($isFullyVerified) {
                return $next($request);
            }

            // 2. BACKEND SECURITY: Block any data mutations (POST, PUT, DELETE) if not verified
            if (!$request->isMethod('get')) {
                abort(403, 'You must complete verification to perform this action.');
            }

            // 3. FRONTEND UX: Allow GET requests to pass through so the React OnboardingModal 
            // can render natively over the feed and visually lock the screen!
            return $next($request);
        }

        return $next($request);
    }
}