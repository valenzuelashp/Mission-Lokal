<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class IprogSmsGateway implements SmsGatewayInterface
{
    public function send(string $mobile, string $message): bool
    {
        $apiToken = config('services.sms.iprog.api_token');
        if (!$apiToken || str_contains(strtolower($apiToken), 'your_')) {
            throw new RuntimeException('IPROG_API_TOKEN is not configured.');
        }

        $formattedNumber = $this->formatMobileNumber($mobile);
        if (!$formattedNumber) {
            Log::warning('IPROG SMS Gateway: Invalid mobile number format provided.', [
                'recipient' => $mobile,
            ]);
            return false;
        }

        $payload = [
            'api_token' => $apiToken,
            'phone_number' => $formattedNumber,
            'message' => $message,
        ];

        try {
            $response = Http::asJson()
                ->timeout(15)
                ->post('https://www.iprogsms.com/api/v1/sms_messages', $payload);
        } catch (\Throwable $exception) {
            Log::error('IPROG SMS Gateway network connection error.', [
                'recipient' => $formattedNumber,
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('IPROG SMS network error: ' . $exception->getMessage(), 0, $exception);
        }

        $responseBody = $response->json();
        if (
            $response->successful()
            && is_array($responseBody)
            && (int) ($responseBody['status'] ?? 0) === 200
            && !empty($responseBody['message_id'])
        ) {
            Log::info('IPROG accepted mission SMS.', [
                'recipient' => $formattedNumber,
                'message_id' => $responseBody['message_id'],
            ]);

            return true;
        }

        $errorMessage = is_array($responseBody)
            ? ($responseBody['message'] ?? $responseBody)
            : $response->body();

        if (is_array($errorMessage)) {
            $errorMessage = json_encode($errorMessage) ?: 'IPROG returned an unrecognized error response.';
        } elseif (!is_string($errorMessage)) {
            $errorMessage = (string) $errorMessage;
        }

        Log::error('IPROG rejected SMS request.', [
            'http_status' => $response->status(),
            'response' => $errorMessage,
            'recipient' => $formattedNumber,
        ]);

        throw new RuntimeException('IPROG SMS failed (HTTP ' . $response->status() . '): ' . $errorMessage);
    }

    protected function formatMobileNumber(string $mobile): ?string
    {
        $digits = preg_replace('/[^0-9]/', '', $mobile);
        if (!$digits) {
            return null;
        }

        if (str_starts_with($digits, '639') && strlen($digits) === 12) {
            return '0' . substr($digits, 2);
        }

        if (str_starts_with($digits, '9') && strlen($digits) === 10) {
            return '0' . $digits;
        }

        if (str_starts_with($digits, '09') && strlen($digits) === 11) {
            return $digits;
        }

        return $digits;
    }
}