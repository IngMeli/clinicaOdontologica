<?php

namespace Tests\Feature\Reports;

use App\Enums\RoleName;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PharmacySale;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_authorized_roles_can_view_financial_and_operational_reports(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $patient = Patient::factory()->create();
        Payment::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'pagado',
            'paid_at' => now(),
            'amount' => 150,
        ]);
        PharmacySale::factory()->create([
            'patient_id' => $patient->id,
            'status' => 'completada',
            'sold_at' => now(),
            'total' => 80,
        ]);

        $this->actingAs($admin)
            ->get(route('reports.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/index')
                ->has('range')
                ->has('metrics')
                ->has('charts.income_by_day')
                ->has('charts.income_by_type')
                ->has('charts.payment_status')
                ->has('charts.appointments_by_status')
                ->has('charts.top_treatments')
                ->has('charts.top_products')
                ->where('metrics.income', 150)
                ->where('metrics.pharmacy_total', 80));

        $this->actingAs($this->userWithRole(RoleName::Doctor))
            ->get(route('reports.index'))
            ->assertOk();
    }

    public function test_reports_reject_invalid_ranges_and_hide_from_patients(): void
    {
        $admin = $this->userWithRole(RoleName::Administrador);
        $patientUser = $this->userWithRole(RoleName::Paciente);

        $this->actingAs($admin)
            ->get(route('reports.index', [
                'from' => '2026-11-20',
                'to' => '2026-11-01',
            ]))
            ->assertSessionHasErrors('to');

        $this->actingAs($patientUser)
            ->get(route('reports.index'))
            ->assertForbidden();
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
