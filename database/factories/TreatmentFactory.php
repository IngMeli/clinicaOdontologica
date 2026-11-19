<?php

namespace Database\Factories;

use App\Models\Treatment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Treatment>
 */
class TreatmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => 'TR-'.fake()->unique()->numerify('######'),
            'name' => fake()->words(3, true),
            'category' => fake()->randomElement(['Diagnóstico', 'Prevención', 'Operatoria', 'Endodoncia', 'Cirugía']),
            'description' => fake()->optional()->sentence(),
            'price' => fake()->randomFloat(2, 50, 2000),
            'duration_minutes' => fake()->randomElement([15, 30, 45, 60, 90]),
            'active' => true,
        ];
    }
}
