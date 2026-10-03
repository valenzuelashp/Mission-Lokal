<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\UserRole;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            if ($request->expectsJson() || $request->inertia()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login');
        }

        // Normalize the user's role to its string value whether it's an Enum, BackedEnum, or string
        $userRole = $user->role instanceof UserRole || $user->role instanceof \BackedEnum 
            ? $user->role->value 
            : (string) $user->role;

        // Check if the user's role matches any of the allowed roles passed to the middleware
        if (! in_array($userRole, $roles, true)) {
            if ($request->expectsJson() || $request->inertia()) {
                abort(403, 'Unauthorized access. Insufficient role permissions.');
            }
            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}