<?php

namespace Database\Factories;

use App\Models\Doctor;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'specialty_id' => Specialty::factory(),
            'license_number' => 'MAT-'.fake()->unique()->numerify('######'),
            'hire_date' => fake()->dateTimeBetween('-10 years', 'now')->format('Y-m-d'),
            'commission_rate' => fake()->randomFloat(2, 0, 50),
            'color' => fake()->hexColor(),
            'notes' => fake()->optional()->sentence(),
            'active' => true,
        ];
    }
}
