<?php

namespace Tests\Unit;

use App\Services\Sms\IprogSmsGateway;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class IprogSmsGatewayTest extends TestCase
{
    public function test_it_posts_sms_to_iprog_using_the_documented_json_payload(): void
    {
        config(['services.sms.iprog.api_token' => 'test-api-token']);

        Http::fake([
            'https://www.iprogsms.com/api/v1/sms_messages' => Http::response([
                'status' => 200,
                'message' => 'Your SMS message has been successfully added to the queue and will be processed shortly.',
                'message_id' => 'iSms-XYHBK',
            ]),
        ]);

        $sent = (new IprogSmsGateway())->send('+639171234567', 'A mission was assigned.');

        $this->assertTrue($sent);
        Http::assertSent(fn (Request $request): bool =>
            $request->method() === 'POST'
            && $request->url() === 'https://www.iprogsms.com/api/v1/sms_messages'
            && $request->hasHeader('Content-Type', 'application/json')
            && $request['api_token'] === 'test-api-token'
            && $request['phone_number'] === '09171234567'
            && $request['message'] === 'A mission was assigned.'
        );
    }

    public function test_it_throws_when_iprog_rejects_the_request(): void
    {
        config(['services.sms.iprog.api_token' => 'test-api-token']);
        Http::fake([
            'https://www.iprogsms.com/api/v1/sms_messages' => Http::response([
                'status' => 401,
                'message' => 'Invalid API token.',
            ], 401),
        ]);

        $this->expectException(RuntimeException::class);

        (new IprogSmsGateway())->send('09171234567', 'A mission was assigned.');
    }

    public function test_it_formats_array_error_messages_without_causing_a_type_error(): void
    {
        config(['services.sms.iprog.api_token' => 'test-api-token']);
        Http::fake([
            'https://www.iprogsms.com/api/v1/sms_messages' => Http::response([
                'status' => 200,
                'message' => ['Message looks suspicious (non_https_link).'],
            ]),
        ]);

        try {
            (new IprogSmsGateway())->send('09171234567', 'A mission was assigned.');
            $this->fail('Expected IPROG rejection to throw.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('non_https_link', $exception->getMessage());
            $this->assertStringNotContainsString('Array to string conversion', $exception->getMessage());
        }
    }
}