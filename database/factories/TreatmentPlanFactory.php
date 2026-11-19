<?php

namespace Database\Factories;

use App\Enums\TreatmentPlanStatus;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\TreatmentPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TreatmentPlan>
 */
class TreatmentPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => 'TP-'.fake()->unique()->numerify('######'),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'consultation_id' => null,
            'status' => TreatmentPlanStatus::Borrador,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'total' => 0,
            'notes' => fake()->optional()->sentence(),
            'created_by' => null,
        ];
    }
}
