<?php

namespace Tests\Feature\Clinic;

use App\Enums\AppointmentStatus;
use App\Enums\RoleName;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransversalPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_can_open_dashboard_audit_and_clinic_modules(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->has('metrics')
                ->has('charts'));

        $this->actingAs($admin)
            ->get(route('audit.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('audit/index')
                ->has('loginAttempts')
                ->has('recentAccess'));

        $this->actingAs($admin)
            ->get(route('patients.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('modules/placeholder')
                ->where('title', 'Pacientes'));
    }

    public function test_dashboard_renders_appointment_status_labels(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);

        $patient = Patient::create([
            'code' => 'PAC-DASH',
            'first_name' => 'Luis',
            'last_name' => 'Mamani',
            'ci' => '11223344',
            'active' => true,
        ]);

        $doctor = Doctor::create([
            'user_id' => User::factory()->create()->id,
            'license_number' => 'DOC-DASH',
        ]);

        Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'scheduled_at' => now()->addHour(),
            'status' => AppointmentStatus::Programada,
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('charts.appointments.0.label', 'Programada')
                ->where('charts.appointments.0.value', 1));
    }

    public function test_doctor_cannot_open_administration_audit(): void
    {
        $doctor = $this->userWithRole(RoleName::Doctor);

        $this->actingAs($doctor)
            ->get(route('audit.index'))
            ->assertForbidden();

        $this->actingAs($doctor)
            ->get(route('patients.index'))
            ->assertOk();
    }

    public function test_patient_is_redirected_to_the_patient_portal(): void
    {
        $user = $this->userWithRole(RoleName::Paciente);

        Patient::create([
            'user_id' => $user->id,
            'code' => 'PAC-TEST',
            'first_name' => 'María',
            'last_name' => 'López',
            'ci' => '12345678',
            'active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('patient.dashboard'));

        $this->actingAs($user)
            ->get(route('patient.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('portal/dashboard')
                ->has('patient'));

        $this->actingAs($user)
            ->get(route('patient.payments'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('portal/payments'));
    }

    public function test_global_search_and_preferences_api_work(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);

        Patient::create([
            'code' => 'PAC-SEARCH',
            'first_name' => 'Ana',
            'last_name' => 'Quispe',
            'ci' => '87654321',
            'active' => true,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/search?q=Ana')
            ->assertOk()
            ->assertJsonPath('data.0.group', 'Pacientes');

        $this->patchJson('/api/v1/preferences', [
            'theme_segment' => 'ninos',
            'theme_mode' => 'dark',
            'font_scale' => 120,
            'high_contrast' => true,
        ])->assertOk();

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $admin->id,
            'theme_segment' => 'ninos',
            'theme_mode' => 'dark',
            'font_scale' => 120,
            'high_contrast' => true,
        ]);
    }

    public function test_home_page_and_visit_counter_are_registered(): void
    {
        $this->get(route('home'))->assertOk();

        $this->assertDatabaseHas('visits', ['path' => '/']);
        $this->assertDatabaseHas('page_visit_counters', ['path' => '/']);
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
