<?php

namespace Tests\Feature\Foundation;

use App\Enums\AppointmentStatus;
use App\Enums\RoleName;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class PoliciesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_a_doctor_can_only_access_their_own_appointments(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $otherDoctor = Doctor::factory()->create();

        $ownAppointment = Appointment::factory()->create([
            'doctor_id' => $doctor->id,
            'status' => AppointmentStatus::Programada,
        ]);

        $otherAppointment = Appointment::factory()->create([
            'doctor_id' => $otherDoctor->id,
            'status' => AppointmentStatus::Programada,
        ]);

        $this->assertTrue(Gate::forUser($doctorUser)->allows('view', $ownAppointment));
        $this->assertFalse(Gate::forUser($doctorUser)->allows('view', $otherAppointment));
    }

    public function test_a_patient_can_only_view_their_own_record(): void
    {
        $patientUser = $this->userWithRole(RoleName::Paciente);
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);
        $otherPatient = Patient::factory()->create();

        $this->assertTrue(Gate::forUser($patientUser)->allows('view', $patient));
        $this->assertFalse(Gate::forUser($patientUser)->allows('view', $otherPatient));
    }

    public function test_an_administrator_bypasses_the_policies(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $appointment = Appointment::factory()->create();

        $this->assertTrue(Gate::forUser($admin)->allows('delete', $appointment));
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
