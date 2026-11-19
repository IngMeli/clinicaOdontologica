<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'patient_id' => Patient::factory(),
            'payment_method_id' => null,
            'payable_type' => null,
            'payable_id' => null,
            'type' => PaymentType::Otro,
            'amount' => fake()->randomFloat(2, 10, 2000),
            'currency' => 'BOB',
            'status' => PaymentStatus::Pendiente,
            'reference' => 'PAY-'.fake()->unique()->numerify('######'),
            'gateway' => null,
            'gateway_reference' => null,
            'gateway_response' => null,
            'qr_payload' => null,
            'paid_at' => null,
            'created_by' => null,
        ];
    }
}
