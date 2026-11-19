<?php

namespace Tests\Feature\Foundation;

use App\Enums\InstallmentStatus;
use App\Enums\PaymentPlanStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Payment;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTriggerTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_paid_installment_payment_updates_the_installment_and_plan(): void
    {
        [$plan, $installment] = $this->planWithInstallment();

        $payment = $this->paidPayment($installment, 'PAY-TRIGGER-001');

        $installment->refresh();
        $plan->refresh();

        $this->assertSame('300.00', $installment->paid_amount);
        $this->assertSame(InstallmentStatus::Pagado, $installment->status);
        $this->assertSame('300.00', $plan->paid_amount);
        $this->assertSame(PaymentStatus::Pagado, $payment->status);
    }

    public function test_reverting_a_payment_reverses_the_installment_and_plan(): void
    {
        [$plan, $installment] = $this->planWithInstallment();

        $payment = $this->paidPayment($installment, 'PAY-TRIGGER-002');

        $payment->update(['status' => PaymentStatus::Anulado]);

        $installment->refresh();
        $plan->refresh();

        $this->assertSame('0.00', $installment->paid_amount);
        $this->assertSame(InstallmentStatus::Pendiente, $installment->status);
        $this->assertNull($installment->paid_at);
        $this->assertSame('0.00', $plan->paid_amount);
        $this->assertSame(PaymentPlanStatus::Activo, $plan->status);
    }

    public function test_deleting_a_paid_payment_reverses_the_installment(): void
    {
        [$plan, $installment] = $this->planWithInstallment();

        $payment = $this->paidPayment($installment, 'PAY-TRIGGER-003');

        $payment->delete();

        $installment->refresh();
        $plan->refresh();

        $this->assertSame('0.00', $installment->paid_amount);
        $this->assertSame(InstallmentStatus::Pendiente, $installment->status);
        $this->assertSame('0.00', $plan->paid_amount);
    }

    /**
     * @return array{PaymentPlan, PaymentPlanInstallment}
     */
    private function planWithInstallment(): array
    {
        $plan = PaymentPlan::factory()->create([
            'total' => 1000,
            'paid_amount' => 0,
            'status' => PaymentPlanStatus::Activo,
        ]);

        $installment = PaymentPlanInstallment::factory()->create([
            'payment_plan_id' => $plan->id,
            'number' => 1,
            'amount' => 300,
            'paid_amount' => 0,
            'status' => InstallmentStatus::Pendiente,
            'paid_at' => null,
        ]);

        return [$plan, $installment];
    }

    private function paidPayment(PaymentPlanInstallment $installment, string $reference): Payment
    {
        return $installment->payments()->create([
            'type' => PaymentType::Cuota,
            'amount' => 300,
            'currency' => 'BOB',
            'status' => PaymentStatus::Pagado,
            'reference' => $reference,
            'paid_at' => now(),
        ]);
    }
}
