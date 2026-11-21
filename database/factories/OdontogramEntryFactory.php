<?php

namespace Database\Factories;

use App\Models\OdontogramEntry;
use App\Models\Patient;
use App\Models\User;
use App\Support\Teeth;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OdontogramEntry>
 */
class OdontogramEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'consultation_id' => null,
            'tooth' => fake()->randomElement(Teeth::all()),
            'surface' => fake()->randomElement(['oclusal', 'mesial', 'distal', 'vestibular', 'lingual', null]),
            'condition' => fake()->randomElement(['sano', 'caries', 'obturado', 'corona', 'extraido']),
            'notes' => fake()->optional()->sentence(),
            'recorded_by' => User::factory(),
            'recorded_at' => now(),
        ];
    }
}
