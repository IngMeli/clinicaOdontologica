<?php

namespace Tests\Feature\Consultations;

use App\Enums\ConsultationStatus;
use App\Enums\RoleName;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\OdontogramEntry;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ConsultationManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_doctor_can_manage_own_consultation_odontogram_and_close_it(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create();
        $consultation = Consultation::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'status' => ConsultationStatus::Abierta,
            'diagnosis' => 'Caries oclusal',
        ]);

        $this->actingAs($doctorUser)
            ->get(route('consultations.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('consultations/index')
                ->has('consultations.data', 1)
                ->where('isDoctor', true));

        $this->actingAs($doctorUser)
            ->get(route('consultations.show', $consultation))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('consultations/show')
                ->where('can.update', true)
                ->where('can.close', true)
                ->where('can.view_odontogram', true)
                ->where('can.manage_odontogram', true)
                ->has('odontogram', 0));

        $this->actingAs($doctorUser)
            ->post(route('consultations.odontogram.store', $consultation), [
                'tooth' => 16,
                'surface' => 'oclusal',
                'condition' => 'caries',
                'notes' => 'Lesión visible.',
            ])
            ->assertRedirect();

        $entry = OdontogramEntry::query()->firstOrFail();

        $this->assertSame($patient->id, $entry->patient_id);
        $this->assertSame($consultation->id, $entry->consultation_id);
        $this->assertSame(16, $entry->tooth);
        $this->assertSame('caries', $entry->condition);
        $this->assertSame($doctorUser->id, $entry->recorded_by);

        $this->assertDatabaseHas('activity_log', [
            'description' => 'Odontograma actualizado',
            'subject_id' => $entry->id,
        ]);

        $this->actingAs($doctorUser)
            ->get(route('patients.show', $patient))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('patients/show')
                ->has('odontogram', 1)
                ->where('can.view_odontogram', true));

        $this->actingAs($doctorUser)
            ->put(route('consultations.update', $consultation), [
                'consulted_at' => now()->format('Y-m-d H:i:s'),
                'reason' => 'Dolor al masticar',
                'diagnosis' => 'Caries oclusal en pieza 16',
                'observations' => 'Se indica restauración.',
            ])
            ->assertRedirect(route('consultations.show', $consultation));

        $this->assertDatabaseHas('consultations', [
            'id' => $consultation->id,
            'reason' => 'Dolor al masticar',
            'diagnosis' => 'Caries oclusal en pieza 16',
        ]);

        $this->actingAs($doctorUser)
            ->patch(route('consultations.close', $consultation))
            ->assertRedirect(route('consultations.show', $consultation));

        $this->assertSame(
            ConsultationStatus::Cerrada,
            $consultation->fresh()->status,
        );

        $this->actingAs($doctorUser)
            ->get(route('consultations.show', $consultation))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('can.update', false)
                ->where('can.close', false)
                ->where('can.manage_odontogram', false));

        $this->actingAs($doctorUser)
            ->get(route('consultations.edit', $consultation))
            ->assertRedirect(route('consultations.show', $consultation));

        $this->actingAs($doctorUser)
            ->put(route('consultations.update', $consultation), [
                'consulted_at' => now()->format('Y-m-d H:i:s'),
                'reason' => 'Intento de cambio',
            ])
            ->assertSessionHasErrors('consultation');

        $this->actingAs($doctorUser)
            ->post(route('consultations.odontogram.store', $consultation), [
                'tooth' => 17,
                'condition' => 'sano',
            ])
            ->assertSessionHasErrors('consultation');
    }

    public function test_secretary_can_read_consultations_but_not_modify_them_or_see_the_odontogram(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $consultation = Consultation::factory()->create();

        $this->actingAs($secretary)
            ->get(route('consultations.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('consultations/index')
                ->has('consultations.data', 1));

        $this->actingAs($secretary)
            ->get(route('consultations.show', $consultation))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('consultations/show')
                ->where('can.update', false)
                ->where('can.close', false)
                ->where('can.view_odontogram', false)
                ->where('can.manage_odontogram', false)
                ->has('odontogram', 0));

        $this->actingAs($secretary)
            ->get(route('consultations.edit', $consultation))
            ->assertForbidden();

        $this->actingAs($secretary)
            ->post(route('consultations.odontogram.store', $consultation), [
                'tooth' => 16,
                'condition' => 'caries',
            ])
            ->assertForbidden();

        $this->actingAs($secretary)
            ->patch(route('consultations.close', $consultation))
            ->assertForbidden();
    }

    public function test_doctor_only_sees_own_consultations_and_cannot_open_another_doctors_record(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $otherConsultation = Consultation::factory()->create();

        $this->actingAs($doctorUser)
            ->get(route('consultations.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('consultations.data', 0));

        $this->actingAs($doctorUser)
            ->get(route('consultations.show', $otherConsultation))
            ->assertForbidden();

        $this->actingAs($doctorUser)
            ->get(route('consultations.edit', $otherConsultation))
            ->assertForbidden();
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
