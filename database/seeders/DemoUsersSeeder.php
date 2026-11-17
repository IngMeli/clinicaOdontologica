<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Enums\ThemeMode;
use App\Enums\ThemeSegment;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Administrador del Sistema',
                'email' => 'admin@clinica.test',
                'phone' => '70000001',
                'role' => RoleName::Administrador,
            ],
            [
                'name' => 'Ana Encargada',
                'email' => 'encargado@clinica.test',
                'phone' => '70000002',
                'role' => RoleName::Encargado,
            ],
            [
                'name' => 'Dr. Carlos Pérez',
                'email' => 'doctor@clinica.test',
                'phone' => '70000003',
                'role' => RoleName::Doctor,
            ],
            [
                'name' => 'Dra. Sofía Rojas',
                'email' => 'doctor2@clinica.test',
                'phone' => '70000004',
                'role' => RoleName::Doctor,
            ],
            [
                'name' => 'Lucía Secretaria',
                'email' => 'secretaria@clinica.test',
                'phone' => '70000005',
                'role' => RoleName::Secretaria,
            ],
            [
                'name' => 'María López',
                'email' => 'paciente@clinica.test',
                'phone' => '70000006',
                'role' => RoleName::Paciente,
            ],
        ];

        foreach ($users as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'active' => true,
                ],
            );

            $user->syncRoles([$data['role']->value]);

            UserPreference::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'theme_segment' => $data['role'] === RoleName::Paciente ? ThemeSegment::Jovenes : ThemeSegment::Adultos,
                    'theme_mode' => ThemeMode::Auto,
                    'font_scale' => 100,
                    'high_contrast' => false,
                    'sidebar_open' => true,
                ],
            );
        }
    }
}
