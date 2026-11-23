<?php

namespace Tests\Feature\Admin;

use App\Enums\RoleName;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\MenuItem;
use App\Models\Specialty;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdministrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_can_open_all_administration_pages(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);

        $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/index')
                ->has('users.data')
                ->has('roles'));

        $this->actingAs($admin)
            ->get(route('admin.users.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/create')
                ->has('roles')
                ->has('specialties'));

        $this->actingAs($admin)
            ->get(route('admin.roles.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/roles/index')
                ->has('roles')
                ->has('permissionGroups')
                ->where('canManage', true));

        $this->actingAs($admin)
            ->get(route('admin.menu.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/menu/index')
                ->has('items')
                ->has('parentOptions')
                ->has('permissions')
                ->has('routeNames'));

        $this->actingAs($admin)
            ->get(route('admin.specialties.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/specialties/index')
                ->has('specialties')
                ->has('doctors')
                ->has('schedules')
                ->has('weekdays')
                ->where('canManage', true));
    }

    public function test_manager_cannot_manage_roles_and_permissions(): void
    {
        $manager = $this->userWithRole(RoleName::Encargado);
        $role = Role::findByName(RoleName::Doctor->value);

        $this->actingAs($manager)
            ->get(route('admin.roles.index'))
            ->assertForbidden();

        $this->actingAs($manager)
            ->put(route('admin.roles.update', $role), ['permissions' => []])
            ->assertForbidden();

        $this->assertGreaterThan(0, $role->fresh()->permissions()->count());
    }

    public function test_admin_role_cannot_be_modified(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $role = Role::findByName(RoleName::Administrador->value);

        $this->actingAs($admin)
            ->put(route('admin.roles.update', $role), [
                'permissions' => [],
            ])
            ->assertSessionHasErrors('permissions');

        $this->assertGreaterThan(0, $role->fresh()->permissions()->count());
    }

    public function test_admin_can_update_another_role_permissions(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $role = Role::findByName(RoleName::Doctor->value);

        $this->actingAs($admin)
            ->put(route('admin.roles.update', $role), [
                'permissions' => ['patients.view', 'appointments.view'],
            ])
            ->assertRedirect();

        $this->assertEqualsCanonicalizing(
            ['patients.view', 'appointments.view'],
            $role->fresh()->permissions()->pluck('name')->all(),
        );
        $this->assertDatabaseHas('activity_log', [
            'description' => 'Permisos de rol actualizados',
            'subject_id' => $role->id,
        ]);
    }

    public function test_admin_can_create_update_toggle_and_delete_menu_items(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);

        $this->actingAs($admin)
            ->post(route('admin.menu.store'), [
                'label' => 'Reportes',
                'icon' => 'chart-no-axes-column',
                'route_name' => 'reports.index',
                'sort_order' => 20,
                'active' => true,
            ])
            ->assertRedirect();

        $item = MenuItem::query()->firstOrFail();

        $this->assertSame('Reportes', $item->label);

        $this->actingAs($admin)
            ->put(route('admin.menu.update', $item), [
                'label' => 'Reportes y estadísticas',
                'icon' => 'chart-no-axes-column',
                'route_name' => 'reports.index',
                'sort_order' => 15,
                'active' => true,
            ])
            ->assertRedirect();

        $this->assertSame('Reportes y estadísticas', $item->fresh()->label);

        $this->actingAs($admin)
            ->patch(route('admin.menu.status', $item), ['active' => false])
            ->assertRedirect();

        $this->assertFalse($item->fresh()->active);

        $this->actingAs($admin)
            ->delete(route('admin.menu.destroy', $item))
            ->assertRedirect();

        $this->assertDatabaseMissing('menu_items', ['id' => $item->id]);
    }

    public function test_admin_can_manage_specialties_and_doctor_schedules(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $doctor = Doctor::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.specialties.store'), [
                'name' => 'Ortodoncia',
                'description' => 'Alineación dental.',
                'color' => '#0ea5e9',
            ])
            ->assertRedirect();

        $specialty = Specialty::query()->where('name', 'Ortodoncia')->firstOrFail();

        $this->actingAs($admin)
            ->put(route('admin.specialties.update', $specialty), [
                'name' => 'Ortodoncia y estética',
                'description' => 'Alineación y estética dental.',
                'color' => '#0284c7',
            ])
            ->assertRedirect();

        $this->assertSame('Ortodoncia y estética', $specialty->fresh()->name);

        $this->actingAs($admin)
            ->patch(route('admin.specialties.status', $specialty), ['active' => false])
            ->assertRedirect();

        $this->assertFalse($specialty->fresh()->active);

        $this->actingAs($admin)
            ->post(route('admin.specialties.schedules.store'), [
                'doctor_id' => $doctor->id,
                'weekday' => 1,
                'start_time' => '08:00',
                'end_time' => '12:00',
                'slot_minutes' => 30,
                'room' => 'Consultorio 1',
                'active' => true,
            ])
            ->assertRedirect();

        $schedule = DoctorSchedule::query()->firstOrFail();

        $this->assertSame(1, $schedule->weekday);

        $this->actingAs($admin)
            ->put(route('admin.specialties.schedules.update', $schedule), [
                'doctor_id' => $doctor->id,
                'weekday' => 1,
                'start_time' => '13:00',
                'end_time' => '17:00',
                'slot_minutes' => 30,
                'room' => 'Consultorio 2',
                'active' => true,
            ])
            ->assertRedirect();

        $this->assertSame('13:00', substr((string) $schedule->fresh()->start_time, 0, 5));

        $this->actingAs($admin)
            ->patch(route('admin.specialties.schedules.status', $schedule), ['active' => false])
            ->assertRedirect();

        $this->assertFalse($schedule->fresh()->active);

        $this->actingAs($admin)
            ->delete(route('admin.specialties.schedules.destroy', $schedule))
            ->assertRedirect();

        $this->assertDatabaseMissing('doctor_schedules', ['id' => $schedule->id]);
    }

    public function test_admin_can_create_update_and_toggle_users(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $specialty = Specialty::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Carla Doctora',
                'email' => 'carla@example.com',
                'phone' => '70000000',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'roles' => ['doctor'],
                'specialty_id' => $specialty->id,
                'license_number' => 'MAT-CARLA',
            ])
            ->assertRedirect(route('admin.users.index'));

        $user = User::query()->where('email', 'carla@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole(RoleName::Doctor->value));
        $this->assertDatabaseHas('doctors', [
            'user_id' => $user->id,
            'specialty_id' => $specialty->id,
            'license_number' => 'MAT-CARLA',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.users.edit', $user))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/edit')
                ->where('user.id', $user->id)
                ->has('roles')
                ->has('specialties'));

        $this->actingAs($admin)
            ->put(route('admin.users.update', $user), [
                'name' => 'Carla Doctora Actualizada',
                'email' => 'carla@example.com',
                'phone' => '71111111',
                'roles' => ['doctor'],
                'specialty_id' => $specialty->id,
                'license_number' => 'MAT-CARLA',
                'active' => true,
            ])
            ->assertRedirect(route('admin.users.index'));

        $this->assertSame('Carla Doctora Actualizada', $user->fresh()->name);

        $this->actingAs($admin)
            ->patch(route('admin.users.status', $user), ['active' => false])
            ->assertRedirect();

        $this->assertFalse($user->fresh()->active);
        $this->assertFalse($user->fresh()->doctor->active);
    }

    public function test_doctor_cannot_access_administration_pages_or_manage_specialties(): void
    {
        $doctor = $this->userWithRole(RoleName::Doctor);
        $specialty = Specialty::factory()->create();

        $this->actingAs($doctor)
            ->get(route('admin.users.index'))
            ->assertForbidden();

        $this->actingAs($doctor)
            ->get(route('admin.roles.index'))
            ->assertForbidden();

        $this->actingAs($doctor)
            ->get(route('admin.menu.index'))
            ->assertForbidden();

        $this->actingAs($doctor)
            ->get(route('admin.specialties.index'))
            ->assertOk();

        $this->actingAs($doctor)
            ->post(route('admin.specialties.store'), [
                'name' => 'No autorizada',
            ])
            ->assertForbidden();

        $this->actingAs($doctor)
            ->patch(route('admin.specialties.status', $specialty), ['active' => false])
            ->assertForbidden();
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
