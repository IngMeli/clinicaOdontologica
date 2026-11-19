<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PharmacySale;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(private readonly DocumentNumberService $documents) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $actor, ?Model $payable = null): Payment
    {
        return DB::transaction(function () use ($data, $actor, $payable): Payment {
            $status = $data['status'] ?? PaymentStatus::Pendiente;
            $status = $status instanceof PaymentStatus
                ? $status
                : PaymentStatus::from((string) $status);
            $type = $data['type'] ?? PaymentType::Otro;
            $type = $type instanceof PaymentType
                ? $type
                : PaymentType::from((string) $type);
            $patientId = isset($data['patient_id']) ? (int) $data['patient_id'] : null;
            $patient = $patientId !== null ? Patient::query()->find($patientId) : null;

            $payment = Payment::query()->create([
                'user_id' => $data['user_id'] ?? $patient?->user_id,
                'patient_id' => $patientId,
                'payment_method_id' => $data['payment_method_id'] ?? null,
                'payable_type' => $payable?->getMorphClass(),
                'payable_id' => $payable?->getKey(),
                'type' => $type,
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'BOB',
                'status' => $status,
                'reference' => $data['reference'] ?? $this->documents->next(Payment::class, 'reference', 'PAY'),
                'gateway' => $data['gateway'] ?? null,
                'gateway_reference' => $data['gateway_reference'] ?? null,
                'gateway_response' => $data['gateway_response'] ?? null,
                'qr_payload' => $data['qr_payload'] ?? null,
                'paid_at' => $status === PaymentStatus::Pagado
                    ? ($data['paid_at'] ?? now())
                    : null,
                'created_by' => $actor->id,
            ]);

            if ($status === PaymentStatus::Pagado) {
                $this->issueReceipt($payment);
            }

            return $payment;
        });
    }

    public function issueReceipt(Payment $payment, ?PharmacySale $sale = null): Receipt
    {
        $payment->loadMissing('patient');
        $patient = $payment->patient;
        $customerName = $patient?->full_name;

        $receipt = Receipt::query()->firstOrCreate(
            ['payment_id' => $payment->id],
            [
                'number' => $this->documents->next(Receipt::class, 'number', 'REC'),
                'pharmacy_sale_id' => $sale?->id,
                'document_type' => 'recibo',
                'customer_name' => $customerName !== null && $customerName !== '' ? $customerName : 'Cliente',
                'customer_tax_id' => $patient?->ci,
                'amount' => $payment->amount,
                'issued_at' => $payment->paid_at ?? now(),
                'qr_data' => json_encode([
                    'reference' => $payment->reference,
                    'amount' => (float) $payment->amount,
                ], JSON_THROW_ON_ERROR),
                'status' => 'emitido',
            ],
        );

        if ($sale !== null && $receipt->pharmacy_sale_id !== $sale->id) {
            $receipt->forceFill(['pharmacy_sale_id' => $sale->id])->save();
        }

        return $receipt;
    }

    public function changeStatus(Payment $payment, PaymentStatus $status): Payment
    {
        return DB::transaction(function () use ($payment, $status): Payment {
            $wasPaid = $payment->status === PaymentStatus::Pagado;

            $payment->forceFill([
                'status' => $status,
                'paid_at' => $status === PaymentStatus::Pagado
                    ? ($payment->paid_at ?? now())
                    : ($wasPaid ? null : $payment->paid_at),
            ])->save();

            if ($status === PaymentStatus::Pagado) {
                $this->issueReceipt($payment);
            } elseif ($payment->receipt()->exists()) {
                $payment->receipt()->update([
                    'status' => $status === PaymentStatus::Reembolsado ? 'reembolsado' : 'anulado',
                ]);
            }

            return $payment->refresh();
        });
    }
}
