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

        $user->load('residentProfile');
        $user->refresh();

        if ($user->role === UserRole::Resident) {
            if ($request->is('logout')) {
                return $next($request);
            }

            $profileStatus = $user->residentProfile?->verification_status;
            $isFullyVerified = ($profileStatus === VerificationStatus::Approved || $profileStatus === 'approved');

            if ($isFullyVerified) {
                return $next($request);
            }

            if (!$request->isMethod('get')) {
                abort(403, 'You must complete verification to perform this action.');
            }

            return $next($request);
        }

        return $next($request);
    }
}