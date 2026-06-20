<?php

namespace Database\Factories;

use App\Enums\ConcernStatus;
use App\Models\Barangay;
use App\Models\Concern;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

class ConcernFactory extends Factory
{
    protected $model = Concern::class;

    public function definition(): array
    {
        // Generate random coordinates
        $lat = fake()->latitude(14.3, 14.7);
        $lng = fake()->longitude(120.9, 121.1);

        // Realistic Philippine Barangay Concerns
        $realisticTitles = [
            'Baha sa main road',
            'Sira ang poste ng ilaw sa kanto',
            'Hindi nakolektang basura',
            'Nababarahang kanal',
            'Maingay na nagka-karaoke madaling araw',
            'Umaapaw na creek',
            'Nakalawit na kawad ng kuryente',
            'Namimiss ko na po',
        ];

        $realisticDescriptions = [
            'Ilang araw na pong hindi nahahakot ang basura dito sa amin. Bumabaho na po at nilalangaw.',
            'Tuwing umuulan ng malakas, agad pong bumabaha dahil barado ang mga drainage. Kailangan po ng declogging.',
            'Pundi na po yung street light namin dito, masyadong madilim sa gabi kaya delikado sa mga dumadaan.',
            'May mga nag-iinuman po at nagka-karaoke hanggang 3 AM, hindi na po makatulog ang mga bata na may pasok bukas.',
            'Pa lambing naman boss di makatulog eh',
        ];

        return [
            'barangay_id' => Barangay::inRandomOrder()->first()?->id,
            'reporter_id' => User::inRandomOrder()->first()?->id,
            
            // Pick randomly from our realistic arrays!
            'title' => fake()->randomElement($realisticTitles),
            'description' => fake()->randomElement($realisticDescriptions),
            'address_text' => fake()->streetAddress() . ', Demo Barangay',
            
            'status' => fake()->randomElement(ConcernStatus::cases()),
            'visibility' => fake()->randomElement(['public', 'private']),
            'severity' => fake()->randomElement(['low', 'medium', 'high', 'critical']),
            'severity_confirmed' => fake()->boolean(),
            'is_blotter_candidate' => fake()->boolean(10),
            
            'location' => DB::raw("ST_GeomFromText('POINT($lng $lat)', 4326)"),
            'public_location' => DB::raw("ST_GeomFromText('POINT($lng $lat)', 4326)"),
        ];
    }
}