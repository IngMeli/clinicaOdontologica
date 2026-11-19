<?php

namespace Tests\Feature\TreatmentPlans;

use App\Enums\RoleName;
use App\Enums\TreatmentItemStatus;
use App\Enums\TreatmentPlanStatus;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Treatment;
use App\Models\TreatmentPlan;
use App\Models\TreatmentPlanItem;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TreatmentPlanManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_plan_lifecycle_with_items_progress_and_totals(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create();
        $treatment = Treatment::factory()->create([
            'active' => true,
            'price' => 500,
        ]);

        $this->actingAs($doctorUser)
            ->post(route('treatment-plans.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonth()->toDateString(),
                'notes' => 'Plan integral.',
            ])
            ->assertRedirect();

        $plan = TreatmentPlan::query()->firstOrFail();

        $this->assertMatchesRegularExpression('/^TP-\d{4}$/', (string) $plan->code);
        $this->assertSame(TreatmentPlanStatus::Borrador, $plan->status);
        $this->assertSame($doctorUser->id, $plan->created_by);
        $this->assertEquals(0, (float) $plan->total);

        $this->actingAs($doctorUser)
            ->post(route('treatment-plans.items.store', $plan), [
                'treatment_id' => $treatment->id,
                'tooth' => 26,
                'quantity' => 2,
                'unit_price' => 500,
                'sessions_planned' => 3,
                'notes' => 'Restauración oclusal.',
            ])
            ->assertRedirect();

        $item = TreatmentPlanItem::query()->firstOrFail();

        $this->assertEquals(1000, (float) $item->subtotal);
        $this->assertEquals(1000, (float) $plan->fresh()->total);
        $this->assertSame(TreatmentItemStatus::Pendiente, $item->status);

        $this->actingAs($doctorUser)
            ->put(route('treatment-plans.items.update', [$plan, $item]), [
                'treatment_id' => $treatment->id,
                'tooth' => 26,
                'quantity' => 3,
                'unit_price' => 400,
                'sessions_planned' => 3,
                'notes' => 'Restauración ampliada.',
            ])
            ->assertRedirect();

        $this->assertEquals(1200, (float) $item->fresh()->subtotal);
        $this->assertEquals(1200, (float) $plan->fresh()->total);

        $this->actingAs($doctorUser)
            ->delete(route('treatment-plans.items.destroy', [$plan, $item]))
            ->assertRedirect();

        $this->assertEquals(0, (float) $plan->fresh()->total);
        $this->assertDatabaseMissing('treatment_plan_items', ['id' => $item->id]);

        $this->actingAs($doctorUser)
            ->post(route('treatment-plans.items.store', $plan), [
                'treatment_id' => $treatment->id,
                'tooth' => 26,
                'quantity' => 3,
                'unit_price' => 400,
                'sessions_planned' => 3,
            ])
            ->assertRedirect();

        $item = TreatmentPlanItem::query()->firstOrFail();

        $this->actingAs($doctorUser)
            ->patch(route('treatment-plans.status', $plan), [
                'status' => TreatmentPlanStatus::Aprobado->value,
            ])
            ->assertRedirect();

        $this->assertSame(
            TreatmentPlanStatus::Aprobado,
            $plan->fresh()->status,
        );

        $this->actingAs($doctorUser)
            ->put(route('treatment-plans.update', $plan), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'notes' => 'Cambio no permitido.',
            ])
            ->assertSessionHasErrors('plan');

        $this->actingAs($doctorUser)
            ->post(route('treatment-plans.items.store', $plan), [
                'treatment_id' => $treatment->id,
                'quantity' => 1,
                'unit_price' => 400,
                'sessions_planned' => 1,
            ])
            ->assertSessionHasErrors('plan');

        $this->actingAs($doctorUser)
            ->patch(route('treatment-plans.items.progress', [$plan, $item]), [
                'status' => TreatmentItemStatus::EnProgreso->value,
                'sessions_done' => 1,
            ])
            ->assertRedirect();

        $this->assertSame(
            TreatmentItemStatus::EnProgreso,
            $item->fresh()->status,
        );
        $this->assertSame(
            TreatmentPlanStatus::EnProgreso,
            $plan->fresh()->status,
        );

        $this->actingAs($doctorUser)
            ->patch(route('treatment-plans.items.progress', [$plan, $item]), [
                'status' => TreatmentItemStatus::Completado->value,
                'sessions_done' => 3,
            ])
            ->assertRedirect();

        $this->assertSame(
            TreatmentItemStatus::Completado,
            $item->fresh()->status,
        );
        $this->assertSame(3, $item->fresh()->sessions_done);
        $this->assertSame(
            TreatmentPlanStatus::Completado,
            $plan->fresh()->status,
        );
        $this->assertNotNull($plan->fresh()->end_date);

        $this->actingAs($doctorUser)
            ->patch(route('treatment-plans.status', $plan), [
                'status' => TreatmentPlanStatus::EnProgreso->value,
            ])
            ->assertSessionHasErrors('status');
    }

    public function test_admin_can_create_a_treatment_plan_from_the_panel(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $doctor = Doctor::factory()->create(['active' => true]);
        $patient = Patient::factory()->create();

        $this->actingAs($admin)
            ->get(route('treatment-plans.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('treatment-plans/index')
                ->where('can.create', true));

        $this->actingAs($admin)
            ->get(route('treatment-plans.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('treatment-plans/create')
                ->where('isDoctor', false)
                ->has('doctors', 1)
                ->has('patients', 1));

        $this->actingAs($admin)
            ->post(route('treatment-plans.store'), [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'start_date' => now()->toDateString(),
                'notes' => 'Plan creado por administración.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('treatment_plans', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'created_by' => $admin->id,
        ]);
    }

    public function test_plan_cannot_be_approved_without_items_or_with_another_patients_consultation(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create();
        $otherPatient = Patient::factory()->create();
        $consultation = Consultation::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
        ]);

        $this->actingAs($doctorUser)
            ->from(route('treatment-plans.create'))
            ->post(route('treatment-plans.store'), [
                'patient_id' => $otherPatient->id,
                'doctor_id' => $doctor->id,
                'consultation_id' => $consultation->id,
            ])
            ->assertRedirect(route('treatment-plans.create'))
            ->assertSessionHasErrors('consultation_id');

        $plan = TreatmentPlan::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'status' => TreatmentPlanStatus::Borrador,
        ]);

        $this->actingAs($doctorUser)
            ->patch(route('treatment-plans.status', $plan), [
                'status' => TreatmentPlanStatus::Aprobado->value,
            ])
            ->assertSessionHasErrors('status');

        $this->assertSame(
            TreatmentPlanStatus::Borrador,
            $plan->fresh()->status,
        );
    }

    public function test_doctor_only_manages_own_plans_and_secretary_has_read_only_access(): void
    {
        $doctorUser = $this->userWithRole(RoleName::Doctor);
        $doctor = Doctor::factory()->create(['user_id' => $doctorUser->id]);
        $patient = Patient::factory()->create();
        $ownPlan = TreatmentPlan::factory()->create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
        ]);
        $otherPlan = TreatmentPlan::factory()->create();

        $this->actingAs($doctorUser)
            ->get(route('treatment-plans.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('treatment-plans/index')
                ->has('plans.data', 1)
                ->where('plans.data.0.id', $ownPlan->id));

        $this->actingAs($doctorUser)
            ->get(route('treatment-plans.show', $otherPlan))
            ->assertForbidden();

        $secretary = $this->userWithRole(RoleName::Secretaria);

        $this->actingAs($secretary)
            ->get(route('treatment-plans.show', $otherPlan))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('treatment-plans/show')
                ->where('can.update', false)
                ->where('can.manage_items', false)
                ->where('can.record_progress', false));

        $this->actingAs($secretary)
            ->get(route('treatment-plans.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('treatment-plans/index')
                ->where('can.create', false));

        $this->actingAs($secretary)
            ->get(route('treatment-plans.create'))
            ->assertForbidden();

        $this->actingAs($secretary)
            ->patch(route('treatment-plans.status', $otherPlan), [
                'status' => TreatmentPlanStatus::Aprobado->value,
            ])
            ->assertForbidden();
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
