<?php

namespace Database\Factories;

use App\Models\Receipt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Receipt>
 */
class ReceiptFactory extends Factory
{
    public function definition(): array
    {
        return [
            'number' => 'REC-'.fake()->unique()->numerify('######'),
            'payment_id' => null,
            'pharmacy_sale_id' => null,
            'document_type' => 'recibo',
            'customer_name' => fake()->name(),
            'customer_tax_id' => fake()->optional()->numerify('########'),
            'amount' => fake()->randomFloat(2, 10, 2000),
            'issued_at' => now(),
            'qr_data' => null,
            'status' => 'emitido',
        ];
    }
}
