<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            MenuSeeder::class,
            DemoUsersSeeder::class,
            ClinicSeeder::class,
            InventorySeeder::class,
            PaymentSeeder::class,
            AnalyticsSeeder::class,
        ]);
    }
}
