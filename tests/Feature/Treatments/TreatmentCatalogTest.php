<?php

namespace Tests\Feature\Treatments;

use App\Enums\RoleName;
use App\Models\Treatment;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TreatmentCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_manager_can_create_update_and_toggle_treatments(): void
    {
        $manager = $this->userWithRole(RoleName::Encargado);

        $this->actingAs($manager)
            ->get(route('treatments.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('treatments/index')
                ->has('treatments.data')
                ->has('filters'));

        $this->actingAs($manager)
            ->post(route('treatments.store'), [
                'name' => 'Restauración con resina',
                'category' => 'Operatoria',
                'description' => 'Restauración estética.',
                'price' => 450.5,
                'duration_minutes' => 60,
            ])
            ->assertRedirect(route('treatments.index'));

        $treatment = Treatment::query()->firstOrFail();

        $this->assertMatchesRegularExpression('/^TR-\d{4}$/', $treatment->code);
        $this->assertTrue($treatment->active);
        $this->assertDatabaseHas('activity_log', [
            'description' => 'Tratamiento creado',
            'subject_id' => $treatment->id,
        ]);

        $this->actingAs($manager)
            ->put(route('treatments.update', $treatment), [
                'name' => 'Restauración con resina compuesta',
                'category' => 'Operatoria',
                'description' => 'Restauración estética directa.',
                'price' => 520,
                'duration_minutes' => 75,
            ])
            ->assertRedirect(route('treatments.index'));

        $this->assertDatabaseHas('treatments', [
            'id' => $treatment->id,
            'name' => 'Restauración con resina compuesta',
            'duration_minutes' => 75,
        ]);

        $this->actingAs($manager)
            ->patch(route('treatments.status', $treatment), ['active' => false])
            ->assertRedirect();

        $this->assertFalse($treatment->fresh()->active);
    }

    public function test_doctor_can_view_the_catalog_but_cannot_manage_it(): void
    {
        $doctor = $this->userWithRole(RoleName::Doctor);
        $treatment = Treatment::factory()->create(['active' => true]);

        $this->actingAs($doctor)
            ->get(route('treatments.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('treatments/index')
                ->has('treatments.data', 1));

        $this->actingAs($doctor)
            ->get(route('treatments.create'))
            ->assertForbidden();

        $this->actingAs($doctor)
            ->post(route('treatments.store'), [
                'name' => 'Intento',
                'price' => 10,
                'duration_minutes' => 30,
            ])
            ->assertForbidden();

        $this->actingAs($doctor)
            ->patch(route('treatments.status', $treatment), ['active' => false])
            ->assertForbidden();
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
