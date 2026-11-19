<?php

namespace Database\Factories;

use App\Models\AccessLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AccessLog>
 */
class AccessLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'method' => fake()->randomElement(['GET', 'POST', 'PATCH', 'DELETE']),
            'path' => '/'.fake()->slug(),
            'route_name' => null,
            'resource_type' => fake()->word(),
            'resource_id' => fake()->optional()->numberBetween(1, 500),
            'status_code' => fake()->randomElement([200, 201, 302, 403, 404, 422, 500]),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'duration_ms' => fake()->numberBetween(5, 2000),
            'created_at' => now(),
        ];
    }
}
