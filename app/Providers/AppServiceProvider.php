<?php

namespace App\Providers;

use App\Services\Sms\LogSmsGateway;
use App\Services\Sms\SmsGatewayInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind the interface to our local logging driver
        $this->app->bind(SmsGatewayInterface::class, LogSmsGateway::class);
    }

    public function boot(): void
    {
        //
    }
}
