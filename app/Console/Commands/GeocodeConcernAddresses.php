<?php

namespace App\Console\Commands;

use App\Models\Concern;
use App\Services\Geocoding\ReverseGeocoder;
use Illuminate\Console\Command;

class GeocodeConcernAddresses extends Command
{
    protected $signature = 'concerns:geocode-addresses
        {--limit=20 : Maximum number of coordinate-only public concerns to process}
        {--dry-run : Count eligible concerns without making geocoding requests}';

    protected $description = 'Replace stored coordinate-only labels on public concerns with nearby place names when available.';

    public function handle(ReverseGeocoder $geocoder): int
    {
        $limit = filter_var($this->option('limit'), FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 100],
        ]);

        if ($limit === false) {
            $this->error('The limit must be an integer between 1 and 100.');

            return self::FAILURE;
        }

        $concerns = Concern::query()
            ->where('visibility', 'public')
            ->where('is_blotter_candidate', false)
            ->where('address_text', 'like', 'Coordinates:%')
            ->orderBy('created_at')
            ->limit($limit)
            ->get(['id', 'address_text']);

        if ($this->option('dry-run')) {
            $this->info("Eligible public concerns: {$concerns->count()}");

            return self::SUCCESS;
        }

        $updated = 0;
        $unresolved = 0;

        foreach ($concerns as $concern) {
            if (! preg_match('/^Coordinates:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/i', (string) $concern->address_text, $matches)) {
                $unresolved++;
                $this->warn("Skipped concern {$concern->id}: stored coordinates could not be parsed.");

                continue;
            }

            usleep(1_100_000);

            $label = $geocoder->label((float) $matches[1], (float) $matches[2]);
            if ($label === null) {
                $unresolved++;
                $this->warn("No place name found for concern {$concern->id}; existing coordinates were kept.");

                continue;
            }

            $concern->update(['address_text' => $label]);
            $updated++;
            $this->line("Updated concern {$concern->id}: {$label}");
        }

        $this->info("Updated: {$updated}; unresolved: {$unresolved}.");

        return self::SUCCESS;
    }
}
