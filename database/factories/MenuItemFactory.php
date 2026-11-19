<?php

namespace Database\Factories;

use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'parent_id' => null,
            'label' => fake()->words(2, true),
            'icon' => fake()->randomElement(['users', 'calendar-days', 'boxes', 'credit-card']),
            'route_name' => null,
            'url' => fake()->optional()->url(),
            'permission_name' => null,
            'sort_order' => fake()->numberBetween(1, 100),
            'active' => true,
        ];
    }
}
