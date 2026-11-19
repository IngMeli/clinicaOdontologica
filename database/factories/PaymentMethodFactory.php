<?php

namespace Database\Factories;

use App\Enums\PaymentMethodType;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentMethod>
 */
class PaymentMethodFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => PaymentMethodType::Efectivo,
            'provider' => fake()->optional()->company(),
            'alias' => fake()->optional()->word(),
            'last4' => null,
            'card_brand' => null,
            'token' => null,
            'is_default' => false,
            'status' => 'activo',
            'expires_at' => null,
        ];
    }
}
