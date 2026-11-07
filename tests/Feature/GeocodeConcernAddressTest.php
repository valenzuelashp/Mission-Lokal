<?php

namespace Tests\Feature;

use App\Jobs\GeocodeConcernAddress;
use App\Services\Geocoding\ReverseGeocoder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Mockery;
use Tests\TestCase;

class GeocodeConcernAddressTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('concerns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('visibility');
            $table->text('address_text')->nullable();
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('concerns');

        parent::tearDown();
    }

    public function test_it_replaces_coordinate_placeholder_for_a_public_concern(): void
    {
        DB::table('concerns')->insert([
            'id' => 'concern-1',
            'visibility' => 'public',
            'address_text' => 'Coordinates: 14.5, 120.9',
        ]);
        $geocoder = Mockery::mock(ReverseGeocoder::class);
        $geocoder->shouldReceive('label')
            ->once()
            ->with(14.5, 120.9)
            ->andReturn('Mabini Street');

        (new GeocodeConcernAddress('concern-1', 14.5, 120.9))->handle($geocoder);

        $this->assertSame(
            'Mabini Street',
            DB::table('concerns')->where('id', 'concern-1')->value('address_text'),
        );
    }

    public function test_it_does_not_replace_private_or_already_named_addresses(): void
    {
        DB::table('concerns')->insert([
            ['id' => 'private-concern', 'visibility' => 'private', 'address_text' => 'Coordinates: 14.5, 120.9'],
            ['id' => 'named-concern', 'visibility' => 'public', 'address_text' => 'Mabini Street'],
        ]);
        $geocoder = Mockery::mock(ReverseGeocoder::class);
        $geocoder->shouldReceive('label')
            ->twice()
            ->with(14.5, 120.9)
            ->andReturn('New Address');

        (new GeocodeConcernAddress('private-concern', 14.5, 120.9))->handle($geocoder);
        (new GeocodeConcernAddress('named-concern', 14.5, 120.9))->handle($geocoder);

        $this->assertSame(
            'Coordinates: 14.5, 120.9',
            DB::table('concerns')->where('id', 'private-concern')->value('address_text'),
        );
        $this->assertSame(
            'Mabini Street',
            DB::table('concerns')->where('id', 'named-concern')->value('address_text'),
        );
    }
}
