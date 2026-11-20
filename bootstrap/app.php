<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        // Database-backed authentication, sessions, or throttling may fail before the controller.
        $exceptions->report(function (QueryException $exception) {
            if (request()->is('help')) {
                Log::error('Barangay help database dependency is unavailable.', ['exception_class' => get_class($exception)]);

                return false;
            }
        });
        $exceptions->render(function (QueryException $exception, Request $request) {
            if (! $request->is('help')) {
                return null;
            }
            if ($request->expectsJson()) {
                return response()->json(['error' => [
                    'code' => 'records_unavailable',
                    'message' => 'Barangay services are temporarily unable to load your session or published records. Please retry shortly.',
                ]], 503);
            }

            return response()->view('errors.barangay-help', [], 503);
        });
        // Automatically route admins/personnel to their specific login page when unauthenticated
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('help') && $request->expectsJson()) {
                return response()->json(['message' => 'Please sign in again to continue this conversation.'], 401);
            }
            if ($request->is('admin*') || $request->is('super-admin*') || $request->is('personnel*')) {
                return redirect()->guest(route('admin-personnel.login'));
            }

            return redirect()->guest(route('login'));
        });
    })->create();
