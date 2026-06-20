<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Barangay;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            // Look for an existing barangay, otherwise leave it null to be overridden
            'barangay_id' => Barangay::inRandomOrder()->first()?->id,
            // Generate a random account ID like RES12345
            'account_id' => 'RES' . fake()->unique()->numerify('#####'),
            'role' => UserRole::Resident,
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->optional(0.7)->lastName(), 
            'last_name' => fake()->lastName(),
            'name_extension' => fake()->optional(0.1)->randomElement(['Jr.', 'Sr.', 'III']), 
            'birthday' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'address' => fake()->streetAddress() . ', Demo Barangay',
            'email' => fake()->unique()->safeEmail(),
            'mobile' => '09' . fake()->numerify('#########'), // Fake PH mobile number
            'verification_status' => VerificationStatus::Approved,
            'password' => static::$password ??= Hash::make('password'),
            'civic_xp' => fake()->numberBetween(0, 100),
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }
}