<?php

namespace Database\Factories;

use App\Models\Dispensation;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dispensation>
 */
class DispensationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'prescription_id' => null,
            'patient_id' => Patient::factory(),
            'dispensed_by' => User::factory(),
            'dispensed_at' => now(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
