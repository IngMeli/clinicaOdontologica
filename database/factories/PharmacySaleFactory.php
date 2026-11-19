<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\PharmacySale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PharmacySale>
 */
class PharmacySaleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sale_number' => 'VEN-'.fake()->unique()->numerify('######'),
            'patient_id' => Patient::factory(),
            'user_id' => null,
            'subtotal' => 0,
            'discount' => 0,
            'total' => 0,
            'status' => 'completada',
            'sold_by' => User::factory(),
            'sold_at' => now(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
