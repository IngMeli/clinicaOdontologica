<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prescription>
 */
class PrescriptionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => 'PRE-'.fake()->unique()->numerify('######'),
            'consultation_id' => null,
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'issued_at' => now(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
