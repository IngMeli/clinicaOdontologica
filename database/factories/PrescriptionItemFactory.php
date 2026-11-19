<?php

namespace Database\Factories;

use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PrescriptionItem>
 */
class PrescriptionItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'prescription_id' => Prescription::factory(),
            'medication' => fake()->word(),
            'presentation' => fake()->randomElement(['Tableta', 'Jarabe', 'Cápsula', 'Solución']),
            'dose' => fake()->randomElement(['1 tableta', '5 ml', '1 cápsula']),
            'frequency' => fake()->randomElement(['Cada 8 horas', 'Cada 12 horas', 'Cada 24 horas']),
            'duration' => fake()->randomElement(['3 días', '5 días', '7 días']),
            'quantity' => fake()->numberBetween(1, 30),
            'instructions' => fake()->optional()->sentence(),
        ];
    }
}
