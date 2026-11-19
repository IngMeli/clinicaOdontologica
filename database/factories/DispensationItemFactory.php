<?php

namespace Database\Factories;

use App\Models\Dispensation;
use App\Models\DispensationItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DispensationItem>
 */
class DispensationItemFactory extends Factory
{
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 20);
        $unitPrice = fake()->randomFloat(2, 1, 100);

        return [
            'dispensation_id' => Dispensation::factory(),
            'product_id' => Product::factory(),
            'batch_id' => null,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $quantity * $unitPrice,
        ];
    }
}
