<?php

namespace Tests\Feature\Clinic;

use App\Enums\RoleName;
use App\Models\User;
use App\Services\MenuService;
use Database\Seeders\MenuSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(MenuSeeder::class);
    }

    public function test_patient_portal_menu_is_only_visible_to_patients(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $patient = $this->userWithRole(RoleName::Paciente);

        $adminMenu = app(MenuService::class)->forUser($admin);

        $this->assertNotContains('Portal del paciente', array_column($adminMenu, 'label'));
        $this->assertFalse($this->containsRoutePrefix($adminMenu, 'patient.'));

        $patientMenu = app(MenuService::class)->forUser($patient);

        $this->assertContains('Portal del paciente', array_column($patientMenu, 'label'));
        $this->assertTrue($this->containsRoutePrefix($patientMenu, 'patient.'));
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    private function containsRoutePrefix(array $items, string $prefix): bool
    {
        foreach ($items as $item) {
            if (str_starts_with((string) ($item['routeName'] ?? ''), $prefix)) {
                return true;
            }

            if ($this->containsRoutePrefix($item['children'] ?? [], $prefix)) {
                return true;
            }
        }

        return false;
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
