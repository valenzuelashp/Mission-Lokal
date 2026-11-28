<?php

namespace Tests\Feature;

use App\Jobs\LocateLoginActivity;
use App\Models\LoginActivity;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class LoginLocationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Schema::create('login_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('ip_address');
            $table->string('approximate_location')->default('Unknown');
        });
    }

    public function test_public_ip_location_is_enriched_and_cached(): void
    {
        Http::fake(['https://ipwho.is/*' => Http::response(['success' => true, 'city' => 'Parañaque', 'region' => 'Metro Manila', 'country' => 'Philippines'])]);
        foreach ([1, 2] as $index) {
            $activity = LoginActivity::create(['ip_address' => '8.8.8.8']);
            (new LocateLoginActivity($activity->id))->handle();
            $this->assertSame('Parañaque, Metro Manila, Philippines', $activity->fresh()->approximate_location);
        }
        Http::assertSentCount(1);
    }

    public function test_private_addresses_are_not_sent_to_the_location_provider(): void
    {
        Http::fake();
        $activity = LoginActivity::create(['ip_address' => '127.0.0.1']);
        (new LocateLoginActivity($activity->id))->handle();
        $this->assertSame('Unknown', $activity->fresh()->approximate_location);
        Http::assertNothingSent();
    }

    public function test_provider_failure_keeps_the_login_record_with_unknown_location(): void
    {
        Http::fake(['https://ipwho.is/*' => Http::response([], 503)]);
        $activity = LoginActivity::create(['ip_address' => '8.8.4.4']);
        (new LocateLoginActivity($activity->id))->handle();
        $this->assertSame('Unknown', $activity->fresh()->approximate_location);
        $this->assertSame(1, LoginActivity::count());
    }
}
