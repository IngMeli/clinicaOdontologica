<?php

namespace Database\Factories;

use App\Enums\PaymentPlanStatus;
use App\Models\Patient;
use App\Models\PaymentPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentPlan>
 */
class PaymentPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'patient_id' => Patient::factory(),
            'treatment_plan_id' => null,
            'concept' => fake()->sentence(3),
            'total' => fake()->randomFloat(2, 100, 5000),
            'installments_count' => fake()->numberBetween(1, 12),
            'frequency' => 'mensual',
            'start_date' => now()->toDateString(),
            'status' => PaymentPlanStatus::Activo,
            'paid_amount' => 0,
            'notes' => fake()->optional()->sentence(),
            'created_by' => null,
        ];
    }
}
