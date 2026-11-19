<?php

namespace Database\Factories;

use App\Enums\InstallmentStatus;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentPlanInstallment>
 */
class PaymentPlanInstallmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'payment_plan_id' => PaymentPlan::factory(),
            'number' => fake()->unique()->numberBetween(1, 1000),
            'due_date' => now()->addMonth()->toDateString(),
            'amount' => fake()->randomFloat(2, 50, 1000),
            'paid_amount' => 0,
            'status' => InstallmentStatus::Pendiente,
            'paid_at' => null,
        ];
    }
}
