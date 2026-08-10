<?php

namespace App\Services\Sms;

interface SmsGatewayInterface
{
    /**
     * Send an SMS message.
     *
     * @param string $mobile The recipient's mobile number
     * @param string $message The content of the SMS
     * @return bool
     */
    public function send(string $mobile, string $message): bool;
}