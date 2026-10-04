<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class SemaphoreSmsGateway implements SmsGatewayInterface
{
    public function send(string $mobile, string $message): bool
    {
        $apiKey = config('services.sms.semaphore.api_key');
        if (!$apiKey) {
            throw new RuntimeException('SEMAPHORE_API_KEY is not configured.');
        }

        $formattedNumber = $this->formatMobileNumber($mobile);
        if (!$formattedNumber) {
            Log::warning("Semaphore SMS Gateway: Invalid mobile number format provided [{$mobile}].");
            return false;
        }

        $payload = [
            'apikey'  => $apiKey,
            'number'  => $formattedNumber,
            'message' => $message,
        ];

        $senderName = trim((string) config('services.sms.semaphore.sender_name', ''));
        if ($senderName !== '') {
            $payload['sendername'] = $senderName;
        }

        try {
            $response = Http::asForm()
                ->timeout(15)
                ->post('https://api.semaphore.co/api/v4/messages', $payload);
        } catch (\Throwable $e) {
            Log::error('Semaphore SMS Gateway network connection error: ' . $e->getMessage(), [
                'recipient' => $formattedNumber,
            ]);
            throw new RuntimeException("Semaphore network error: {$e->getMessage()}", 0, $e);
        }

        $statusCode = $response->status();
        $responseBody = $response->json();

        // Check if Semaphore accepted the message (successful response is an array of messages with message_id)
        if ($response->successful() && is_array($responseBody) && isset($responseBody[0]['message_id'])) {
            Log::info("Semaphore SMS sent successfully to [{$formattedNumber}].", [
                'message_id' => $responseBody[0]['message_id'] ?? null,
                'status'     => $responseBody[0]['status'] ?? 'Pending',
            ]);
            return true;
        }

        // Capture exact rejection message from Semaphore API payload
        $errorMessage = is_array($responseBody) 
            ? json_encode($responseBody) 
            : $response->body();

        Log::error("Semaphore rejected SMS request. HTTP Status: [{$statusCode}]. Response: {$errorMessage}", [
            'recipient' => $formattedNumber,
            'payload'   => array_merge($payload, ['apikey' => '***HIDDEN***']),
        ]);

        throw new RuntimeException("Semaphore SMS failed (HTTP {$statusCode}): {$errorMessage}");
    }

    /**
     * Normalize Philippine phone numbers into standard 09XXXXXXXXX format.
     */
    protected function formatMobileNumber(string $mobile): ?string
    {
        $digits = preg_replace('/[^0-9]/', '', $mobile);

        if (!$digits) {
            return null;
        }

        // If provided as 639XXXXXXXXX (12 digits)
        if (str_starts_with($digits, '639') && strlen($digits) === 12) {
            return '0' . substr($digits, 2);
        }

        // If provided as 9XXXXXXXXX (10 digits)
        if (str_starts_with($digits, '9') && strlen($digits) === 10) {
            return '0' . $digits;
        }

        // Standard 09XXXXXXXXX (11 digits)
        if (str_starts_with($digits, '09') && strlen($digits) === 11) {
            return $digits;
        }

        return $digits;
    }
}