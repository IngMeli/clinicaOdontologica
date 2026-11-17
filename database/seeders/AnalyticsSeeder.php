<?php

namespace Database\Seeders;

use App\Models\AccessLog;
use App\Models\LoginAttempt;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Database\Seeder;

class AnalyticsSeeder extends Seeder
{
    public function run(): void
    {
        $staff = User::where('email', 'encargado@clinica.test')->firstOrFail();
        $patient = User::where('email', 'paciente@clinica.test')->firstOrFail();

        $pages = [
            ['path' => '/dashboard', 'route_name' => 'dashboard'],
            ['path' => '/pacientes', 'route_name' => 'patients.index'],
            ['path' => '/agenda', 'route_name' => 'appointments.index'],
            ['path' => '/pagos', 'route_name' => 'payments.index'],
            ['path' => '/portal', 'route_name' => 'patient.dashboard'],
            ['path' => '/login', 'route_name' => 'login'],
        ];

        for ($day = 6; $day >= 0; $day--) {
            $date = now()->subDays($day);

            foreach ($pages as $page) {
                $count = random_int(2, 8);

                for ($i = 0; $i < $count; $i++) {
                    Visit::create([
                        'path' => $page['path'],
                        'route_name' => $page['route_name'],
                        'user_id' => $page['path'] === '/portal' ? $patient->id : $staff->id,
                        'ip_address' => '127.0.0.1',
                        'session_id' => 'seed-'.$day.'-'.$i,
                        'user_agent' => 'Seeder',
                        'created_at' => $date->copy()->setTime(random_int(8, 20), random_int(0, 59)),
                    ]);
                }
            }

            for ($i = 0; $i < random_int(1, 3); $i++) {
                LoginAttempt::create([
                    'user_id' => $staff->id,
                    'email' => $staff->email,
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Seeder',
                    'successful' => true,
                    'created_at' => $date->copy()->setTime(random_int(7, 19), random_int(0, 59)),
                ]);
            }

            LoginAttempt::create([
                'email' => 'intruso@example.test',
                'ip_address' => '192.168.1.'.random_int(2, 254),
                'user_agent' => 'Seeder',
                'successful' => false,
                'failure_reason' => 'Credenciales inválidas',
                'created_at' => $date->copy()->setTime(random_int(0, 6), random_int(0, 59)),
            ]);

            foreach ($pages as $page) {
                AccessLog::create([
                    'user_id' => $staff->id,
                    'method' => 'GET',
                    'path' => $page['path'],
                    'route_name' => $page['route_name'],
                    'status_code' => 200,
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Seeder',
                    'duration_ms' => random_int(40, 350),
                    'created_at' => $date->copy()->setTime(random_int(8, 20), random_int(0, 59)),
                ]);
            }
        }
    }
}
