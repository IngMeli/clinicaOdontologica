<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DoctorSchedule>
 */
class DoctorScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'doctor_id' => Doctor::factory(),
            'weekday' => fake()->numberBetween(1, 7),
            'start_time' => fake()->unique()->time('H:i'),
            'end_time' => fake()->time('H:i'),
            'slot_minutes' => fake()->randomElement([15, 20, 30, 45, 60]),
            'room' => 'Consultorio '.fake()->numberBetween(1, 5),
            'active' => true,
        ];
    }
}
