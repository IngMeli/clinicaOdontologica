<?php

namespace Tests\Feature\Prescriptions;

use App\Enums\RoleName;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PrescriptionManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_doctor_can_issue_and_print_a_prescription_with_items(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create();
        $consultation = Consultation::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
        ]);

        $this->actingAs($doctorUser)
            ->get(route('prescriptions.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('prescriptions/index')
                ->has('prescriptions.data')
                ->where('isDoctor', true));

        $this->actingAs($doctorUser)
            ->post(route('prescriptions.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'consultation_id' => $consultation->id,
                'issued_at' => now()->format('Y-m-d H:i:s'),
                'notes' => 'Tomar con alimentos.',
                'items' => [
                    [
                        'medication' => 'Amoxicilina 500 mg',
                        'presentation' => 'Tabletas',
                        'dose' => '1 tableta',
                        'frequency' => 'Cada 8 horas',
                        'duration' => '7 días',
                        'quantity' => 21,
                        'instructions' => 'Completar el tratamiento.',
                    ],
                    [
                        'medication' => 'Ibuprofeno 400 mg',
                        'presentation' => 'Tabletas',
                        'dose' => '1 tableta',
                        'frequency' => 'Cada 8 horas',
                        'duration' => '3 días',
                        'quantity' => 9,
                    ],
                ],
            ])
            ->assertRedirect();

        $prescription = Prescription::query()->firstOrFail();

        $this->assertMatchesRegularExpression('/^RX-\d{4}$/', (string) $prescription->code);
        $this->assertSame($patient->id, $prescription->patient_id);
        $this->assertSame($doctor->id, $prescription->doctor_id);
        $this->assertSame($consultation->id, $prescription->consultation_id);
        $this->assertSame(2, PrescriptionItem::query()->count());

        $this->assertDatabaseHas('activity_log', [
            'description' => 'Receta emitida',
            'subject_id' => $prescription->id,
        ]);

        $this->actingAs($doctorUser)
            ->get(route('prescriptions.show', $prescription))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('prescriptions/show')
                ->where('prescription.code', $prescription->code)
                ->has('prescription.items', 2));

        $this->actingAs($doctorUser)
            ->get(route('prescriptions.print', $prescription))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('prescriptions/print')
                ->has('prescription.items', 2));
    }

    public function test_admin_cannot_issue_prescriptions(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $doctor = Doctor::factory()->create(['active' => true]);
        $patient = Patient::factory()->create();

        $this->actingAs($admin)
            ->get(route('prescriptions.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('prescriptions/index')
                ->where('can.create', false));

        $this->actingAs($admin)
            ->get(route('prescriptions.create'))
            ->assertForbidden();

        $this->actingAs($admin)
            ->post(route('prescriptions.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'issued_at' => now()->format('Y-m-d H:i:s'),
                'items' => [
                    ['medication' => 'Paracetamol', 'quantity' => 1],
                ],
            ])
            ->assertForbidden();

        $this->assertSame(0, Prescription::query()->count());
    }

    public function test_manager_can_issue_prescriptions(): void
    {
        $manager = $this->userWithRole(RoleName::Encargado);
        $doctor = Doctor::factory()->create(['active' => true]);
        $patient = Patient::factory()->create();

        $this->actingAs($manager)
            ->get(route('prescriptions.create'))
            ->assertOk();

        $this->actingAs($manager)
            ->post(route('prescriptions.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'issued_at' => now()->format('Y-m-d H:i:s'),
                'items' => [
                    ['medication' => 'Paracetamol', 'quantity' => 1],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('prescriptions', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
        ]);
    }

    public function test_secretary_can_read_but_not_issue_prescriptions(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $prescription = Prescription::factory()->create();

        $this->actingAs($secretary)
            ->get(route('prescriptions.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('prescriptions/index')
                ->has('prescriptions.data', 1)
                ->where('can.create', false));

        $this->actingAs($secretary)
            ->get(route('prescriptions.show', $prescription))
            ->assertOk();

        $this->actingAs($secretary)
            ->get(route('prescriptions.create'))
            ->assertForbidden();

        $this->actingAs($secretary)
            ->post(route('prescriptions.store'), [
                'patient_id' => $prescription->patient_id,
                'doctor_id' => $prescription->doctor_id,
                'issued_at' => now()->format('Y-m-d H:i:s'),
                'items' => [
                    ['medication' => 'Paracetamol', 'quantity' => 1],
                ],
            ])
            ->assertForbidden();
    }

    public function test_doctor_cannot_view_another_doctors_prescription_and_consultation_must_match_patient(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create();
        $otherPatient = Patient::factory()->create();
        $consultation = Consultation::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
        ]);
        $otherPrescription = Prescription::factory()->create();

        $this->actingAs($doctorUser)
            ->get(route('prescriptions.show', $otherPrescription))
            ->assertForbidden();

        $this->actingAs($doctorUser)
            ->from(route('prescriptions.create'))
            ->post(route('prescriptions.store'), [
                'patient_id' => $otherPatient->id,
                'doctor_id' => $doctor->id,
                'consultation_id' => $consultation->id,
                'issued_at' => now()->format('Y-m-d H:i:s'),
                'items' => [
                    ['medication' => 'Paracetamol', 'quantity' => 1],
                ],
            ])
            ->assertRedirect(route('prescriptions.create'))
            ->assertSessionHasErrors('consultation_id');

        $this->assertSame(1, Prescription::query()->count());
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
