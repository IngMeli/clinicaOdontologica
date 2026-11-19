<?php

namespace Database\Factories;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'created_by' => null,
            'scheduled_at' => fake()->dateTimeBetween('now', '+2 months'),
            'duration_minutes' => fake()->randomElement([15, 30, 45, 60, 90]),
            'status' => AppointmentStatus::Programada,
            'reason' => fake()->sentence(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
