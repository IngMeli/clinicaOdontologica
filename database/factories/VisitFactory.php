<?php

namespace Database\Factories;

use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Visit>
 */
class VisitFactory extends Factory
{
    public function definition(): array
    {
        return [
            'path' => '/'.fake()->slug(),
            'route_name' => null,
            'user_id' => null,
            'ip_address' => fake()->ipv4(),
            'session_id' => fake()->uuid(),
            'user_agent' => fake()->userAgent(),
            'created_at' => now(),
        ];
    }
}
