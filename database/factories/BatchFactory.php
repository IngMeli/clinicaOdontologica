<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Batch>
 */
class BatchFactory extends Factory
{
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 200);

        return [
            'product_id' => Product::factory(),
            'supplier_id' => Supplier::factory(),
            'lot_number' => 'LOT-'.fake()->unique()->bothify('???-####'),
            'expiry_date' => fake()->dateTimeBetween('+1 month', '+3 years')->format('Y-m-d'),
            'quantity' => $quantity,
            'unit_cost' => fake()->randomFloat(2, 1, 300),
        ];
    }
}
