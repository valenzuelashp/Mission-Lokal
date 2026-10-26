<?php

namespace App\Services\Geocoding;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReverseGeocoder
{
    public function label(float $latitude, float $longitude): ?string
    {
        if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
            return null;
        }

        $cacheKey = sprintf('reverse-geocode:%s:%s', round($latitude, 5), round($longitude, 5));

        $cachedLabel = Cache::get($cacheKey);
        if (is_string($cachedLabel) && $cachedLabel !== '') {
            return $cachedLabel;
        }

        if (! Cache::add('reverse-geocode:nominatim-last-request', true, now()->addSecond())) {
            Log::info('Reverse geocoding skipped to respect the service rate limit.');

            return null;
        }

        try {
            $response = Http::acceptJson()
                ->withUserAgent(sprintf('%s/1.0 (%s)', config('app.name'), config('app.url')))
                ->connectTimeout(2)
                ->timeout(4)
                ->get(config('services.geocoding.nominatim_url'), [
                    'format' => 'jsonv2',
                    'lat' => $latitude,
                    'lon' => $longitude,
                    'zoom' => 18,
                    'addressdetails' => 1,
                ]);
        } catch (\Throwable $exception) {
            Log::warning('Reverse geocoding service could not be reached.', [
                'exception' => $exception->getMessage(),
            ]);

            return null;
        }

        if (! $response->successful()) {
            Log::warning('Reverse geocoding service returned an unsuccessful response.', [
                'status' => $response->status(),
            ]);

            return null;
        }

        $result = $response->json();
        $address = is_array($result) && is_array($result['address'] ?? null)
            ? $result['address']
            : [];

        $landmark = $this->firstPlaceName([
            is_array($result) ? ($result['name'] ?? null) : null,
            $address['name'] ?? null,
        ]);
        $road = $this->firstPlaceName([
            $address['road'] ?? null,
            $address['pedestrian'] ?? null,
            $address['footway'] ?? null,
        ]);
        $neighborhood = $this->firstPlaceName([
            $address['neighbourhood'] ?? null,
            $address['quarter'] ?? null,
            $address['suburb'] ?? null,
        ]);

        $parts = array_values(array_unique(array_filter([
            $landmark,
            $road !== $landmark ? $road : null,
            ! $road ? $neighborhood : null,
        ])));

        if ($parts === []) {
            Log::info('Reverse geocoding found no usable place name.');

            return null;
        }

        $label = implode(', ', $parts);
        Cache::put($cacheKey, $label, now()->addDays(30));

        return $label;
    }

    /**
     * @param  array<int, mixed>  $candidates
     */
    private function firstPlaceName(array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            if (! is_string($candidate)) {
                continue;
            }

            $candidate = trim($candidate);

            if ($candidate !== '' && ! in_array(strtolower($candidate), ['yes', 'no'], true)) {
                return $candidate;
            }
        }

        return null;
    }
}
