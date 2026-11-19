<?php

namespace Database\Factories;

use App\Models\PharmacySale;
use App\Models\PharmacySaleItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PharmacySaleItem>
 */
class PharmacySaleItemFactory extends Factory
{
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 20);
        $unitPrice = fake()->randomFloat(2, 1, 100);

        return [
            'pharmacy_sale_id' => PharmacySale::factory(),
            'product_id' => Product::factory(),
            'batch_id' => null,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $quantity * $unitPrice,
        ];
    }
}
