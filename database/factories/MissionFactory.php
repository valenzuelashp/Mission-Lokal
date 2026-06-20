<?php

namespace Database\Factories;

use App\Enums\MissionStatus;
use App\Models\Barangay;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MissionFactory extends Factory
{
    protected $model = Mission::class;

    public function definition(): array
    {
        return [
            'barangay_id' => Barangay::inRandomOrder()->first()?->id,
            
            // If there's no concern in the DB, tell Laravel to automatically make one using the factory we just built
            'concern_id' => Concern::factory(),            
            // Assign to a random user
            'assigned_to' => User::inRandomOrder()->first()?->id,
            'created_by' => User::inRandomOrder()->first()?->id,
            
            'due_date' => fake()->dateTimeBetween('now', '+1 week')->format('Y-m-d'),
            'estimated_duration_hours' => fake()->numberBetween(1, 24),
            
            'status' => fake()->randomElement(MissionStatus::cases()),
            'is_overdue' => fake()->boolean(15), // 15% chance to be overdue
            'is_escalated' => fake()->boolean(5), // 5% chance
        ];
    }
}