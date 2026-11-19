<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'code' => 'PAC-'.fake()->unique()->numerify('######'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'ci' => fake()->unique()->numerify('########'),
            'birth_date' => fake()->dateTimeBetween('-80 years', '-1 year')->format('Y-m-d'),
            'gender' => fake()->randomElement(['Femenino', 'Masculino', 'Otro']),
            'phone' => fake()->numerify('7########'),
            'email' => fake()->unique()->safeEmail(),
            'address' => fake()->address(),
            'blood_type' => fake()->randomElement(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']),
            'allergies' => fake()->optional()->sentence(),
            'medical_notes' => fake()->optional()->sentence(),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_phone' => fake()->numerify('7########'),
            'active' => true,
            'created_by' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['active' => false]);
    }
}
