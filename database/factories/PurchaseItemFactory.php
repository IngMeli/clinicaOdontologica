<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseItem>
 */
class PurchaseItemFactory extends Factory
{
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 100);
        $unitCost = fake()->randomFloat(2, 1, 300);

        return [
            'purchase_id' => Purchase::factory(),
            'product_id' => Product::factory(),
            'lot_number' => 'LOT-'.fake()->unique()->bothify('???-####'),
            'expiry_date' => fake()->dateTimeBetween('+1 month', '+3 years')->format('Y-m-d'),
            'quantity' => $quantity,
            'unit_cost' => $unitCost,
            'subtotal' => $quantity * $unitCost,
        ];
    }
}
