<?php

namespace Tests\Unit;

use App\Services\Geocoding\ReverseGeocoder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ReverseGeocoderTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_it_formats_a_landmark_and_road_from_reverse_geocoding(): void
    {
        config(['services.geocoding.nominatim_url' => 'https://nominatim.test/reverse']);
        Http::fake([
            'nominatim.test/*' => Http::response([
                'name' => 'Tambo Elementary School',
                'address' => [
                    'road' => 'M. Santos Street',
                    'suburb' => 'Tambo',
                ],
            ]),
        ]);

        $label = app(ReverseGeocoder::class)->label(14.5173, 120.9933);

        $this->assertSame('Tambo Elementary School, M. Santos Street', $label);
        Http::assertSent(fn (Request $request): bool =>
            $request->url() === 'https://nominatim.test/reverse?format=jsonv2&lat=14.5173&lon=120.9933&zoom=18&addressdetails=1'
            && str_contains($request->header('User-Agent')[0] ?? '', 'Mission-Lokal')
        );
    }

    public function test_it_uses_neighborhood_when_no_landmark_or_road_is_available(): void
    {
        config(['services.geocoding.nominatim_url' => 'https://nominatim.test/reverse']);
        Http::fake([
            'nominatim.test/*' => Http::response([
                'address' => ['neighbourhood' => 'San Dionisio'],
            ]),
        ]);

        $this->assertSame('San Dionisio', app(ReverseGeocoder::class)->label(14.5173, 120.9933));
    }

    public function test_it_returns_null_when_the_service_finds_no_place_name(): void
    {
        config(['services.geocoding.nominatim_url' => 'https://nominatim.test/reverse']);
        Http::fake([
            'nominatim.test/*' => Http::response(['address' => []]),
        ]);

        $this->assertNull(app(ReverseGeocoder::class)->label(14.5173, 120.9933));
    }

    public function test_it_skips_a_lookup_when_the_service_rate_limit_would_be_exceeded(): void
    {
        Cache::put('reverse-geocode:nominatim-last-request', true, now()->addSecond());
        Http::fake();

        $this->assertNull(app(ReverseGeocoder::class)->label(14.5173, 120.9933));
        Http::assertNothingSent();
    }

    public function test_it_does_not_cache_a_failed_lookup_as_a_permanent_empty_result(): void
    {
        config(['services.geocoding.nominatim_url' => 'https://nominatim.test/reverse']);
        Http::fake([
            'nominatim.test/*' => Http::sequence()
                ->push(['address' => []])
                ->push([
                    'name' => 'Tambo Elementary School',
                    'address' => ['road' => 'M. Santos Street'],
                ]),
        ]);

        $geocoder = app(ReverseGeocoder::class);
        $this->assertNull($geocoder->label(14.5173, 120.9933));
        Cache::forget('reverse-geocode:nominatim-last-request');

        $this->assertSame('Tambo Elementary School, M. Santos Street', $geocoder->label(14.5173, 120.9933));
        Http::assertSentCount(2);
    }
}
