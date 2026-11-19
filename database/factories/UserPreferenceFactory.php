<?php

namespace Database\Factories;

use App\Enums\ThemeMode;
use App\Enums\ThemeSegment;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserPreference>
 */
class UserPreferenceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'theme_segment' => ThemeSegment::Adultos,
            'theme_mode' => ThemeMode::Auto,
            'font_scale' => 100,
            'high_contrast' => false,
            'sidebar_open' => true,
        ];
    }
}
