<?php

namespace Tests\Feature\Patients;

use App\Enums\RoleName;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PatientManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_secretary_can_list_create_and_open_a_patient_record(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);

        $this->actingAs($secretary)
            ->get(route('patients.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('patients/index')
                ->has('patients.data')
                ->where('can.create', true));

        $this->actingAs($secretary)
            ->post(route('patients.store'), [
                'first_name' => 'Ana',
                'last_name' => 'Quispe',
                'ci' => '87654321',
                'birth_date' => '1990-05-10',
                'gender' => 'Femenino',
                'phone' => '71234567',
                'email' => 'ana@example.com',
                'address' => 'Zona central',
                'blood_type' => 'O+',
                'allergies' => 'Penicilina',
                'medical_notes' => 'Sin antecedentes relevantes.',
                'emergency_contact_name' => 'Luis Quispe',
                'emergency_contact_phone' => '76543210',
            ])
            ->assertRedirect();

        $patient = Patient::query()->where('ci', '87654321')->firstOrFail();

        $this->assertMatchesRegularExpression('/^PAC-\d{4}$/', $patient->code);
        $this->assertSame($secretary->id, $patient->created_by);
        $this->assertTrue($patient->active);

        $this->assertDatabaseHas('activity_log', [
            'description' => 'Paciente creado',
            'subject_id' => $patient->id,
            'subject_type' => $patient->getMorphClass(),
        ]);

        $this->actingAs($secretary)
            ->get(route('patients.show', $patient))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('patients/show')
                ->where('patient.code', $patient->code)
                ->where('initialTab', 'citas')
                ->has('patient.appointments')
                ->has('patient.consultations')
                ->has('patient.treatment_plans')
                ->has('patient.prescriptions')
                ->has('patient.payments')
                ->has('stats')
                ->where('can.update', true));
    }

    public function test_birth_date_requires_a_four_digit_year(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();

        $this->actingAs($secretary)
            ->from(route('patients.create'))
            ->post(route('patients.store'), [
                'first_name' => 'Ana',
                'last_name' => 'Prueba',
                'birth_date' => '02003-05-10',
            ])
            ->assertRedirect(route('patients.create'))
            ->assertSessionHasErrors('birth_date');

        $this->assertDatabaseCount('patients', 1);

        $this->actingAs($secretary)
            ->from(route('patients.edit', $patient))
            ->put(route('patients.update', $patient), [
                'first_name' => 'Ana',
                'last_name' => 'Prueba',
                'birth_date' => '20003-05-10',
            ])
            ->assertRedirect(route('patients.edit', $patient))
            ->assertSessionHasErrors('birth_date');
    }

    public function test_patient_can_be_updated_and_duplicate_ci_is_rejected(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create(['ci' => '11111111']);
        $other = Patient::factory()->create(['ci' => '22222222']);

        $this->actingAs($secretary)
            ->put(route('patients.update', $patient), [
                'first_name' => 'María',
                'last_name' => 'López',
                'ci' => '11111111',
                'phone' => '70000000',
            ])
            ->assertRedirect(route('patients.show', $patient));

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'first_name' => 'María',
            'phone' => '70000000',
        ]);

        $this->actingAs($secretary)
            ->from(route('patients.edit', $patient))
            ->put(route('patients.update', $patient), [
                'first_name' => 'María',
                'last_name' => 'López',
                'ci' => $other->ci,
            ])
            ->assertRedirect(route('patients.edit', $patient))
            ->assertSessionHasErrors('ci');
    }

    public function test_patient_can_be_deactivated_and_reactivated_without_losing_history(): void
    {
        $manager = $this->userWithRole(RoleName::Encargado);
        $patient = Patient::factory()->create(['active' => true]);

        $this->actingAs($manager)
            ->patch(route('patients.deactivate', $patient))
            ->assertRedirect(route('patients.show', $patient));

        $this->assertFalse($patient->fresh()->active);

        $this->actingAs($manager)
            ->patch(route('patients.activate', $patient))
            ->assertRedirect(route('patients.show', $patient));

        $this->assertTrue($patient->fresh()->active);
        $this->assertNotNull($patient->fresh());
    }

    public function test_doctor_cannot_create_patients_and_patients_cannot_access_staff_records(): void
    {
        $doctor = $this->userWithRole(RoleName::Doctor);
        $patientUser = $this->userWithRole(RoleName::Paciente);

        $this->actingAs($doctor)
            ->get(route('patients.create'))
            ->assertForbidden();

        $this->actingAs($patientUser)
            ->get(route('patients.index'))
            ->assertForbidden();
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
