<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EnsureBarangayIsActive
{
    /**
     * Handle an incoming request and ensure the user's barangay node is active.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If logged in and assigned to a barangay container node
        if ($user && $user->barangay_id) {
            $barangay = $user->barangay;

            // If the barangay exists and has been suspended (is_active = false)
            if ($barangay && ! $barangay->is_active) {
                // If they are a Super Admin, let them pass so they can manage/reactivate it
                $role = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
                if ($role === 'super_admin') {
                    return $next($request);
                }

                // Terminate their session immediately
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Gracefully render the custom Inertia suspension page instead of throwing an error
                return Inertia::render('Auth/NodeSuspended')->toResponse($request);
            }
        }

        return $next($request);
    }
}