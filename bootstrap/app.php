<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands()
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\EnsureBarangayIsActive::class,
        ]);

        // --- CSRF Exemptions ---
        $middleware->validateCsrfTokens(except: [
            'login',
            'admin-personnel/login',
            'logout',
            'password/dismiss',
            'password/prompt/dismiss',
            'password/custom/store',
            'concerns',
            'concerns/*',
            'node-suspended/appeal', // <--- CRITICAL: Prevents 419 error when submitting appeal
        ]);
        
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'verified.resident' => \App\Http\Middleware\EnsureResidentIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Automatically route admins/personnel to their specific login page when unauthenticated
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('admin*') || $request->is('super-admin*') || $request->is('personnel*')) {
                return redirect()->guest(route('admin-personnel.login'));
            }

            return redirect()->guest(route('login'));
        });
    })->create();