<?php

namespace App\Providers;

use App\Services\Sms\IprogSmsGateway;
use App\Services\Sms\LogSmsGateway;
use App\Services\Sms\SmsGatewayInterface;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(SmsGatewayInterface::class, function () {
            $driver = config('services.sms.driver', 'log');

            if ($driver === 'iprog') {
                return new IprogSmsGateway;
            }

            return new LogSmsGateway;
        });
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

        // Named limiters have independent counters: automatic locks must never consume PIN attempts.
        RateLimiter::for('session-lock', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
        RateLimiter::for('session-presence', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
        RateLimiter::for('session-unlock', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });
        RateLimiter::for('session-pin-setup', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });
    }
}
