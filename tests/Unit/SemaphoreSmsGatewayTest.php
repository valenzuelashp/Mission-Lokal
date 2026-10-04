<?php

namespace Tests\Unit;

use App\Services\Sms\SemaphoreSmsGateway;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class SemaphoreSmsGatewayTest extends TestCase
{
    public function test_it_posts_sms_to_semaphore(): void
    {
        config([
            'services.sms.semaphore.api_key' => 'test-api-key',
            'services.sms.semaphore.sender_name' => 'MissionLokal',
        ]);

        Http::fake([
            'https://api.semaphore.co/api/v4/messages' => Http::response([
                ['message_id' => 123, 'status' => 'Pending'],
            ]),
        ]);

        $sent = (new SemaphoreSmsGateway())->send('+639171234567', 'A mission was assigned.');

        $this->assertTrue($sent);
        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://api.semaphore.co/api/v4/messages'
            && $request['apikey'] === 'test-api-key'
            && $request['number'] === '09171234567'
            && $request['message'] === 'A mission was assigned.'
            && $request['sendername'] === 'MissionLokal'
        );
    }

    public function test_it_rejects_an_unexpected_semaphore_response(): void
    {
        config(['services.sms.semaphore.api_key' => 'test-api-key']);
        Http::fake([
            'https://api.semaphore.co/api/v4/messages' => Http::response(['error' => 'invalid key'], 400),
        ]);

        $this->expectException(RuntimeException::class);

        (new SemaphoreSmsGateway())->send('+639171234567', 'A mission was assigned.');
    }
}