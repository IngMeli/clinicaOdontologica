<?php

namespace Tests\Feature\Payments;

use App\Enums\RoleName;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentPlan;
use App\Models\Receipt;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PaymentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_secretary_can_register_a_paid_payment_and_issue_a_receipt(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();

        $this->actingAs($secretary)
            ->get(route('payments.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('payments/index')
                ->has('payments.data')
                ->has('metrics')
                ->has('types')
                ->has('statuses'));

        $response = $this->actingAs($secretary)
            ->post(route('payments.store'), [
                'patient_id' => $patient->id,
                'type' => 'tratamiento',
                'amount' => 250.50,
                'status' => 'pagado',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $payment = Payment::query()->firstOrFail();

        $response->assertRedirect(route('payments.show', $payment));

        $this->assertMatchesRegularExpression('/^PAY-\d{4}$/', $payment->reference);
        $this->assertSame('pagado', $payment->status->value);
        $this->assertNotNull($payment->paid_at);
        $this->assertDatabaseHas('receipts', [
            'payment_id' => $payment->id,
            'amount' => 250.50,
            'status' => 'emitido',
        ]);
        $this->assertDatabaseHas('activity_log', [
            'description' => 'Pago registrado',
            'subject_id' => $payment->id,
        ]);

        $this->actingAs($secretary)
            ->get(route('payments.show', $payment))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('payments/show')
                ->where('payment.id', $payment->id)
                ->where('canManage', false));
    }

    public function test_qr_payment_generates_a_scannable_payload_and_stays_pending(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();

        $response = $this->actingAs($secretary)
            ->post(route('payments.store'), [
                'patient_id' => $patient->id,
                'payment_method_type' => 'qr',
                'type' => 'consulta',
                'amount' => 180,
                'status' => 'pendiente',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $payment = Payment::query()->firstOrFail();

        $this->assertSame('pendiente', $payment->status->value);
        $this->assertSame('qr_simple', $payment->gateway);
        $this->assertSame('QR-'.$payment->reference, $payment->gateway_reference);
        $this->assertNotNull($payment->payment_method_id);
        $this->assertNotNull($payment->qr_payload);
        $this->assertDatabaseMissing('receipts', ['payment_id' => $payment->id]);

        $payload = json_decode((string) $payment->qr_payload, true);

        $this->assertIsArray($payload);
        $this->assertSame($payment->reference, $payload['reference']);
        $this->assertSame(180, $payload['amount']);
        $this->assertSame($patient->id, $payload['patient_id']);

        $this->actingAs($secretary)
            ->get(route('payments.show', $payment))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('payments/show')
                ->where('payment.qr_payload', $payment->qr_payload)
                ->where('payment.method.type', 'qr'));
    }

    public function test_manager_can_change_payment_status_and_void_the_receipt(): void
    {
        $manager = $this->userWithRole(RoleName::Encargado);
        $payment = Payment::factory()->create([
            'status' => 'pagado',
            'paid_at' => now(),
        ]);
        Receipt::factory()->create([
            'payment_id' => $payment->id,
            'status' => 'emitido',
        ]);

        $this->actingAs($manager)
            ->patch(route('payments.status', $payment), ['status' => 'anulado'])
            ->assertRedirect();

        $this->assertSame('anulado', $payment->fresh()->status->value);
        $this->assertDatabaseHas('receipts', [
            'payment_id' => $payment->id,
            'status' => 'anulado',
        ]);
    }

    public function test_secretary_can_create_a_payment_plan_and_pay_an_installment(): void
    {
        $secretary = $this->userWithRole(RoleName::Secretaria);
        $patient = Patient::factory()->create();

        $this->actingAs($secretary)
            ->post(route('payment-plans.store'), [
                'patient_id' => $patient->id,
                'concept' => 'Ortodoncia',
                'total' => 300,
                'installments_count' => 3,
                'frequency' => 'mensual',
                'start_date' => now()->toDateString(),
            ])
            ->assertRedirect();

        $plan = PaymentPlan::query()->firstOrFail();

        $this->assertSame(3, $plan->installments()->count());
        $this->assertSame('100.00', $plan->installments()->first()->amount);

        $installment = $plan->installments()->firstOrFail();

        $this->actingAs($secretary)
            ->post(route('payment-plans.installments.pay', [$plan, $installment]))
            ->assertRedirect();

        $this->assertSame('pagado', $installment->fresh()->status->value);
        $this->assertSame('100.00', $plan->fresh()->paid_amount);
        $this->assertDatabaseHas('payments', [
            'payable_type' => 'installment',
            'payable_id' => $installment->id,
            'type' => 'cuota',
            'amount' => 100,
            'status' => 'pagado',
        ]);
        $this->assertDatabaseHas('activity_log', [
            'description' => 'Cuota pagada',
        ]);
    }

    public function test_doctor_cannot_access_or_manage_payments(): void
    {
        $doctor = $this->userWithRole(RoleName::Doctor);
        $payment = Payment::factory()->create();

        $this->actingAs($doctor)
            ->get(route('payments.index'))
            ->assertForbidden();

        $this->actingAs($doctor)
            ->post(route('payments.store'), [
                'type' => 'otro',
                'amount' => 10,
                'status' => 'pendiente',
            ])
            ->assertForbidden();

        $this->actingAs($doctor)
            ->patch(route('payments.status', $payment), ['status' => 'anulado'])
            ->assertForbidden();
    }

    private function userWithRole(RoleName $role): User
    {
        $user = User::factory()->create(['active' => true]);
        $user->assignRole($role->value);

        return $user;
    }
}
