<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;

class LogSmsGateway implements SmsGatewayInterface
{
    public function send(string $mobile, string $message): bool
    {
        // Instead of spending money on an API, we log it for local testing
        Log::info("SMS SENT TO [{$mobile}]: {$message}");
        
        return true;
    }
}