<?php

namespace App\Http\Middleware;

use App\Services\SessionSecurity;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureSessionIsCurrent
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user && Auth::viaRemember()) {
            app(SessionSecurity::class)->activate($request, $user);
            $user->forceFill(['session_locked_at' => now()])->save();
        }
        if ($user && ($user->active_session_token !== null || $request->session()->has('active_session_token'))) {
            if (! app(SessionSecurity::class)->matches($request, $user)) {
                $role = $user->role instanceof \BackedEnum ? $user->role->value : $user->role;
                // logoutCurrentDevice does not rotate the NEW device's remember token.
                Auth::logoutCurrentDevice();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                $login = $role === 'resident' ? '/login' : '/admin-personnel/login';
                if ($request->expectsJson() || $request->is('session/*')) {
                    return response()->json(['code' => 'session_revoked', 'message' => 'Your account was signed in on another device. Please sign in again.', 'login_url' => $login], 401);
                }

                return redirect($login)->with('error', 'Your account was signed in on another device. Please sign in again.');
            }
        }

        return $next($request);
    }
}
