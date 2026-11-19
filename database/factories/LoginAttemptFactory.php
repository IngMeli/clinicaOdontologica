<?php

namespace Database\Factories;

use App\Models\LoginAttempt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoginAttempt>
 */
class LoginAttemptFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'email' => fake()->unique()->safeEmail(),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'successful' => fake()->boolean(),
            'failure_reason' => null,
            'created_at' => now(),
        ];
    }
}
