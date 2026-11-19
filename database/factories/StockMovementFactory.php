<?php

namespace Database\Factories;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'batch_id' => null,
            'type' => StockMovementType::AjustePositivo,
            'quantity' => fake()->numberBetween(1, 50),
            'unit_cost' => fake()->optional()->randomFloat(2, 1, 300),
            'reference_type' => null,
            'reference_id' => null,
            'reason' => fake()->sentence(),
            'created_by' => null,
        ];
    }
}
