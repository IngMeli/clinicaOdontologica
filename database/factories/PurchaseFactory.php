<?php

namespace Database\Factories;

use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Purchase>
 */
class PurchaseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'invoice_number' => 'FAC-'.fake()->unique()->numerify('######'),
            'purchased_at' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'status' => 'borrador',
            'subtotal' => 0,
            'tax' => 0,
            'total' => 0,
            'notes' => fake()->optional()->sentence(),
            'created_by' => null,
        ];
    }
}
