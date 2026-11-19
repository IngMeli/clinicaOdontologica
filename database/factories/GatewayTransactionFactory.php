<?php

namespace Database\Factories;

use App\Models\GatewayTransaction;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GatewayTransaction>
 */
class GatewayTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'payment_id' => Payment::factory(),
            'gateway' => 'simulado',
            'transaction_id' => 'SIM-'.fake()->unique()->numerify('######'),
            'status' => 'aprobado',
            'request' => ['amount' => 100],
            'response' => ['approved' => true],
            'amount' => 100,
        ];
    }
}
