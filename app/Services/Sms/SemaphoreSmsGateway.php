<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class SemaphoreSmsGateway implements SmsGatewayInterface
{
    public function send(string $mobile, string $message): bool
    {
        $apiKey = config('services.sms.semaphore.api_key');
        if (!$apiKey) {
            throw new RuntimeException('SEMAPHORE_API_KEY is not configured.');
        }

        $payload = [
            'apikey' => $apiKey,
            'number' => $mobile,
            'message' => $message,
        ];

        $senderName = config('services.sms.semaphore.sender_name');
        if ($senderName) {
            $payload['sendername'] = $senderName;
        }

        $response = Http::asForm()
            ->timeout(15)
            ->post('https://api.semaphore.co/api/v4/messages', $payload)
            ->throw();

        $messages = $response->json();
        if (!is_array($messages) || !isset($messages[0]['message_id'])) {
            throw new RuntimeException('Semaphore did not accept the SMS request. Check the API response in the Semaphore dashboard.');
        }

        return true;
    }
}