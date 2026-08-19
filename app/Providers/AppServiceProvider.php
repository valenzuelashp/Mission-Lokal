<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind the interface to our local logging driver
        $this->app->bind(SmsGatewayInterface::class, LogSmsGateway::class);
    }

    public function boot(): void
    {
        // 1. Login Rate Limiter: Max 5 attempts per minute per account ID or IP
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->input('account_id', $request->ip()));
        });

        // 2. OTP Rate Limiter: Max 3 attempts per minute per IP address
        RateLimiter::for('otp', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        // 3. Reports Rate Limiter: Max 3 submissions per minute per user ID
        RateLimiter::for('reports', function (Request $request) {
            return Limit::perMinute(3)->by($request->user()?->id ?: $request->ip());
        });
    }
}