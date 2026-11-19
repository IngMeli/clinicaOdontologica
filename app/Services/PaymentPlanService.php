<?php

namespace App\Services;

use App\Enums\InstallmentStatus;
use App\Enums\PaymentPlanStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentPlanService
{
    public function __construct(private readonly PaymentService $payments) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $actor): PaymentPlan
    {
        return DB::transaction(function () use ($data, $actor): PaymentPlan {
            $patient = Patient::query()->findOrFail((int) $data['patient_id']);
            $count = (int) $data['installments_count'];
            $total = round((float) $data['total'], 2);

            if ($count < 1 || $total <= 0) {
                throw ValidationException::withMessages([
                    'total' => 'El plan debe tener un total y al menos una cuota.',
                ]);
            }

            $start = CarbonImmutable::parse((string) $data['start_date']);
            $plan = PaymentPlan::query()->create([
                'user_id' => $patient->user_id,
                'patient_id' => $patient->id,
                'treatment_plan_id' => $data['treatment_plan_id'] ?? null,
                'concept' => $data['concept'],
                'total' => $total,
                'installments_count' => $count,
                'frequency' => $data['frequency'] ?? 'mensual',
                'start_date' => $start->toDateString(),
                'status' => PaymentPlanStatus::Activo,
                'paid_amount' => 0,
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor->id,
            ]);

            $base = round($total / $count, 2);
            $assigned = 0.0;

            for ($number = 1; $number <= $count; $number++) {
                $amount = $number === $count
                    ? round($total - $assigned, 2)
                    : $base;
                $assigned += $amount;

                $plan->installments()->create([
                    'number' => $number,
                    'due_date' => $this->dueDate($start, (string) $plan->frequency, $number - 1)->toDateString(),
                    'amount' => $amount,
                    'paid_amount' => 0,
                    'status' => InstallmentStatus::Pendiente,
                ]);
            }

            return $plan;
        });
    }

    public function payInstallment(
        PaymentPlanInstallment $installment,
        User $actor,
        ?int $paymentMethodId = null,
    ): Payment {
        return DB::transaction(function () use ($installment, $actor, $paymentMethodId): Payment {
            $installment = PaymentPlanInstallment::query()->lockForUpdate()->findOrFail($installment->id);
            $installment->loadMissing('plan');

            if ($installment->isPaid()) {
                throw ValidationException::withMessages([
                    'installment' => 'La cuota ya fue pagada.',
                ]);
            }

            if ($installment->isCanceled()) {
                throw ValidationException::withMessages([
                    'installment' => 'La cuota está anulada.',
                ]);
            }

            $plan = $installment->plan;

            if ($plan->isCanceled()) {
                throw ValidationException::withMessages([
                    'installment' => 'El plan de pagos está cancelado.',
                ]);
            }

            $remaining = round((float) $installment->amount - (float) $installment->paid_amount, 2);

            if ($remaining <= 0) {
                throw ValidationException::withMessages([
                    'installment' => 'La cuota no tiene saldo pendiente.',
                ]);
            }

            return $this->payments->create([
                'user_id' => $plan->user_id,
                'patient_id' => $plan->patient_id,
                'payment_method_id' => $paymentMethodId,
                'type' => PaymentType::Cuota,
                'amount' => $remaining,
                'status' => PaymentStatus::Pagado,
                'paid_at' => now(),
            ], $actor, $installment);
        });
    }

    public function changeStatus(PaymentPlan $plan, PaymentPlanStatus $status): PaymentPlan
    {
        if ($status === PaymentPlanStatus::Cancelado) {
            $paid = $plan->installments()
                ->whereIn('status', [InstallmentStatus::Pagado, InstallmentStatus::Pendiente])
                ->exists();

            if ($paid) {
                $plan->installments()
                    ->where('status', InstallmentStatus::Pendiente)
                    ->update(['status' => InstallmentStatus::Anulado]);
            }
        }

        $plan->forceFill(['status' => $status])->save();

        return $plan->refresh();
    }

    private function dueDate(CarbonImmutable $start, string $frequency, int $offset): CarbonImmutable
    {
        return match ($frequency) {
            'semanal' => $start->addWeeks($offset),
            'quincenal' => $start->addDays($offset * 15),
            default => $start->addMonths($offset),
        };
    }
}
