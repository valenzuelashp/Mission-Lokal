<?php

namespace App\Http\Middleware;

use App\Services\SessionSecurity;
use Closure;
use Illuminate\Http\Request;

class EnsureSessionIsUnlocked
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user && $user->active_session_token && ! $request->is('session/*', 'logout')) {
            app(SessionSecurity::class)->expireAwayLock($user);
            if (! $user->session_pin_hash || $user->session_locked_at !== null) {
                if (! $user->session_pin_hash && $request->isMethod('GET')) {
                    $request->session()->put('session_return_url', $request->getRequestUri());

                    return redirect()->route('session.lock');
                }
                if ($request->expectsJson() || $request->header('X-Inertia')) {
                    return response()->json(['code' => 'session_locked', 'locked' => true, 'needs_pin' => ! $user->session_pin_hash], 423);
                }
                $request->session()->put('session_return_url', $request->getRequestUri());

                return redirect()->route('session.lock');
            }
        }

        return $next($request);
    }
}
