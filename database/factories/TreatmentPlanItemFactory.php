<?php

namespace Database\Factories;

use App\Enums\TreatmentItemStatus;
use App\Models\Treatment;
use App\Models\TreatmentPlan;
use App\Models\TreatmentPlanItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TreatmentPlanItem>
 */
class TreatmentPlanItemFactory extends Factory
{
    public function definition(): array
    {
        $unitPrice = fake()->randomFloat(2, 50, 1500);
        $quantity = fake()->numberBetween(1, 4);

        return [
            'treatment_plan_id' => TreatmentPlan::factory(),
            'treatment_id' => Treatment::factory(),
            'tooth' => fake()->optional()->numberBetween(11, 48),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $unitPrice * $quantity,
            'status' => TreatmentItemStatus::Pendiente,
            'sessions_planned' => fake()->numberBetween(1, 4),
            'sessions_done' => 0,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
