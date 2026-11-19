<?php

namespace Database\Factories;

use App\Enums\ConsultationStatus;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Consultation>
 */
class ConsultationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => 'CON-'.fake()->unique()->numerify('######'),
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'appointment_id' => null,
            'consulted_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'reason' => fake()->sentence(),
            'diagnosis' => fake()->optional()->sentence(),
            'observations' => fake()->optional()->paragraph(),
            'status' => ConsultationStatus::Abierta,
        ];
    }
}
