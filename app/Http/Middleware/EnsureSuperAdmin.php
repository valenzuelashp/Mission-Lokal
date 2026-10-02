<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\UserRole;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $role = $user->role instanceof UserRole ? $user->role->value : $user->role;
        if ($role !== 'super_admin') {
            abort(403, 'Unauthorized access. Super Administrator rights required.');
        }

        return $next($request);
    }
}