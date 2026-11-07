<?php

namespace App\Jobs;

use App\Models\Concern;
use App\Services\Geocoding\ReverseGeocoder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GeocodeConcernAddress implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public array $backoff = [10, 30];

    public function __construct(
        public string $concernId,
        public float $latitude,
        public float $longitude,
    ) {
    }

    public function handle(ReverseGeocoder $geocoder): void
    {
        $label = $geocoder->label($this->latitude, $this->longitude);

        if ($label === null) {
            return;
        }

        Concern::query()
            ->whereKey($this->concernId)
            ->where('visibility', 'public')
            ->where('address_text', 'like', 'Coordinates:%')
            ->update(['address_text' => $label]);
    }
}
