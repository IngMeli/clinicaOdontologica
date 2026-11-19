<?php

namespace Database\Factories;

use App\Models\PageVisitCounter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PageVisitCounter>
 */
class PageVisitCounterFactory extends Factory
{
    public function definition(): array
    {
        return [
            'path' => '/'.fake()->unique()->slug(),
            'route_name' => null,
            'count' => fake()->numberBetween(1, 1000),
            'last_visited_at' => now(),
            'updated_at' => now(),
        ];
    }
}
