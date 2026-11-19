<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'category_id' => ProductCategory::factory(),
            'sku' => 'SKU-'.fake()->unique()->numerify('######'),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'unit' => fake()->randomElement(['unidad', 'caja', 'frasco', 'paquete']),
            'min_stock' => fake()->numberBetween(0, 50),
            'stock' => 0,
            'sale_price' => fake()->randomFloat(2, 1, 500),
            'active' => true,
        ];
    }
}
