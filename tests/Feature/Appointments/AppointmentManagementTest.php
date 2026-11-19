<?php

namespace Tests\Feature\Appointments;

use App\Enums\AppointmentStatus;
use App\Enums\RoleName;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AppointmentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_secretary_can_create_an_appointment_and_see_it_in_the_week_agenda(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();
        $doctor = Doctor::factory()->create();
        $scheduledAt = CarbonImmutable::now()->addDay()->setTime(10, 0);

        $this->actingAs($secretary)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
                'duration_minutes' => 45,
                'reason' => 'Control odontológico',
                'notes' => 'Paciente puntual.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('appointments', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'duration_minutes' => 45,
            'status' => AppointmentStatus::Programada->value,
        ]);

        $this->assertDatabaseHas('activity_log', [
            'description' => 'Cita creada',
        ]);

        $this->actingAs($secretary)
            ->get(route('appointments.index', ['week' => $scheduledAt->toDateString()]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('appointments/index')
                ->has('appointments', 1)
                ->where('appointments.0.patient_id', $patient->id)
                ->where('appointments.0.doctor_id', $doctor->id)
                ->where('filters.week', $scheduledAt->startOfWeek()->toDateString())
                ->where('can.create', true));
    }

    public function test_overlapping_appointments_for_the_same_doctor_are_rejected(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();
        $doctor = Doctor::factory()->create();
        $scheduledAt = CarbonImmutable::now()->addDay()->setTime(10, 0);

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => 60,
            'status' => AppointmentStatus::Programada,
        ]);

        $this->actingAs($secretary)
            ->from(route('appointments.create'))
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'scheduled_at' => $scheduledAt->addMinutes(30)->format('Y-m-d H:i:s'),
                'duration_minutes' => 30,
                'reason' => 'Segunda cita',
            ])
            ->assertRedirect(route('appointments.create'))
            ->assertSessionHasErrors('scheduled_at');

        $this->assertSame(1, Appointment::query()->count());
    }

    public function test_appointments_must_respect_the_doctor_schedule(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();
        $doctor = Doctor::factory()->create();
        $scheduledAt = CarbonImmutable::now()->addDay()->setTime(9, 0);

        DoctorSchedule::create([
            'doctor_id' => $doctor->id,
            'weekday' => $scheduledAt->isoWeekday(),
            'start_time' => '08:00:00',
            'end_time' => '12:00:00',
            'slot_minutes' => 30,
            'active' => true,
        ]);

        $this->actingAs($secretary)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
                'duration_minutes' => 60,
            ])
            ->assertRedirect();

        $this->actingAs($secretary)
            ->from(route('appointments.create'))
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'scheduled_at' => $scheduledAt->addHours(4)->format('Y-m-d H:i:s'),
                'duration_minutes' => 30,
            ])
            ->assertRedirect(route('appointments.create'))
            ->assertSessionHasErrors('scheduled_at');
    }

    public function test_appointment_can_be_rescheduled_without_conflicting_with_itself(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();
        $doctor = Doctor::factory()->create();
        $scheduledAt = CarbonImmutable::now()->addDay()->setTime(10, 0);

        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'scheduled_at' => $scheduledAt,
            'duration_minutes' => 60,
            'status' => AppointmentStatus::Programada,
        ]);

        $this->actingAs($secretary)
            ->put(route('appointments.update', $appointment), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
                'duration_minutes' => 90,
                'reason' => 'Control reprogramado',
            ])
            ->assertRedirect(route('appointments.show', $appointment));

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'duration_minutes' => 90,
            'reason' => 'Control reprogramado',
        ]);

        $blocking = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'scheduled_at' => $scheduledAt->addHours(2),
            'duration_minutes' => 60,
            'status' => AppointmentStatus::Programada,
        ]);

        $this->actingAs($secretary)
            ->from(route('appointments.edit', $appointment))
            ->put(route('appointments.update', $appointment), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'scheduled_at' => $scheduledAt->addMinutes(90)->format('Y-m-d H:i:s'),
                'duration_minutes' => 90,
                'reason' => 'Intento con choque',
            ])
            ->assertRedirect(route('appointments.edit', $appointment))
            ->assertSessionHasErrors('scheduled_at');

        $this->assertDatabaseHas('appointments', [
            'id' => $blocking->id,
            'scheduled_at' => $scheduledAt->addHours(2)->format('Y-m-d H:i:s'),
        ]);
    }

    public function test_status_transitions_are_validated_and_consultation_can_be_started(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $patient = Patient::factory()->create();
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'scheduled_at' => now()->addDay(),
            'status' => AppointmentStatus::Programada,
        ]);

        $this->actingAs($doctorUser)
            ->from(route('appointments.show', $appointment))
            ->patch(route('appointments.status', $appointment), [
                'status' => AppointmentStatus::Atendida->value,
            ])
            ->assertRedirect(route('appointments.show', $appointment))
            ->assertSessionHasErrors('status');

        $this->actingAs($doctorUser)
            ->patch(route('appointments.status', $appointment), [
                'status' => AppointmentStatus::Confirmada->value,
            ])
            ->assertRedirect();

        $this->assertSame(
            AppointmentStatus::Confirmada,
            $appointment->fresh()->status,
        );

        $this->actingAs($doctorUser)
            ->patch(route('appointments.status', $appointment), [
                'status' => AppointmentStatus::Atendida->value,
            ])
            ->assertRedirect();

        $this->actingAs($doctorUser)
            ->post(route('appointments.consultation', $appointment))
            ->assertRedirect(route('consultations.show', Consultation::query()->firstOrFail()));

        $consultation = Consultation::query()->firstOrFail();

        $this->assertMatchesRegularExpression('/^CON-\d{4}$/', (string) $consultation->code);
        $this->assertSame($patient->id, $consultation->patient_id);
        $this->assertSame($doctor->id, $consultation->doctor_id);
        $this->assertSame($appointment->id, $consultation->appointment_id);
        $this->assertSame('abierta', $consultation->status->value);
    }

    public function test_a_doctor_only_sees_their_own_agenda_and_cannot_schedule_for_another_doctor(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $otherDoctor = Doctor::factory()->create();
        $patient = Patient::factory()->create();
        $scheduledAt = CarbonImmutable::now()->addDay()->setTime(11, 0);

        $ownAppointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'scheduled_at' => $scheduledAt,
            'status' => AppointmentStatus::Programada,
        ]);

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $otherDoctor->id,
            'scheduled_at' => $scheduledAt->addHour(),
            'status' => AppointmentStatus::Programada,
        ]);

        $this->actingAs($doctorUser)
            ->get(route('appointments.index', ['week' => $scheduledAt->toDateString()]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('appointments/index')
                ->has('appointments', 1)
                ->where('appointments.0.id', $ownAppointment->id)
                ->where('isDoctor', true));

        $this->actingAs($doctorUser)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $otherDoctor->id,
                'scheduled_at' => $scheduledAt->addHours(2)->format('Y-m-d H:i:s'),
                'duration_minutes' => 30,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('appointments', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'scheduled_at' => $scheduledAt->addHours(2)->format('Y-m-d H:i:s'),
        ]);
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
