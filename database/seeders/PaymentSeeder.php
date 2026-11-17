<?php

namespace Database\Seeders;

use App\Enums\InstallmentStatus;
use App\Enums\PaymentMethodType;
use App\Enums\PaymentPlanStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Models\PharmacySale;
use App\Models\Product;
use App\Models\Receipt;
use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $encargado = User::where('email', 'encargado@clinica.test')->firstOrFail();
        $secretaria = User::where('email', 'secretaria@clinica.test')->firstOrFail();
        $patientUser = User::where('email', 'paciente@clinica.test')->firstOrFail();
        $patient = Patient::where('user_id', $patientUser->id)->firstOrFail();
        $treatmentPlan = TreatmentPlan::where('code', 'TP-0001')->firstOrFail();

        $qrMethod = PaymentMethod::updateOrCreate(
            ['user_id' => $patientUser->id, 'type' => PaymentMethodType::Qr->value],
            [
                'provider' => 'QR Simple',
                'alias' => 'María López',
                'is_default' => true,
                'status' => 'activo',
            ],
        );

        PaymentMethod::updateOrCreate(
            ['user_id' => $patientUser->id, 'type' => PaymentMethodType::Tarjeta->value],
            [
                'provider' => 'Visa',
                'card_brand' => 'Visa',
                'last4' => '4242',
                'token' => 'sim_card_4242',
                'is_default' => false,
                'status' => 'activo',
                'expires_at' => now()->addYears(2)->toDateString(),
            ],
        );

        $plan = PaymentPlan::updateOrCreate(
            ['concept' => 'Plan de rehabilitación oral'],
            [
                'user_id' => $patientUser->id,
                'patient_id' => $patient->id,
                'treatment_plan_id' => $treatmentPlan->id,
                'total' => 1700,
                'installments_count' => 3,
                'frequency' => 'mensual',
                'start_date' => now()->toDateString(),
                'status' => PaymentPlanStatus::Activo,
                'notes' => 'Plan de pagos en tres cuotas.',
                'created_by' => $encargado->id,
            ],
        );

        $amounts = [566.67, 566.67, 566.66];
        $installments = [];
        foreach ($amounts as $index => $amount) {
            $installments[] = PaymentPlanInstallment::updateOrCreate(
                ['payment_plan_id' => $plan->id, 'number' => $index + 1],
                [
                    'due_date' => now()->addMonths($index)->toDateString(),
                    'amount' => $amount,
                    'status' => InstallmentStatus::Pendiente,
                ],
            );
        }

        $firstInstallment = $installments[0];
        $alreadyPaid = Payment::where('payable_type', PaymentPlanInstallment::class)
            ->where('payable_id', $firstInstallment->id)
            ->where('status', PaymentStatus::Pagado->value)
            ->exists();

        if (! $alreadyPaid) {
            $firstInstallment->payments()->create([
                'user_id' => $patientUser->id,
                'patient_id' => $patient->id,
                'payment_method_id' => $qrMethod->id,
                'type' => PaymentType::Cuota,
                'amount' => $firstInstallment->amount,
                'currency' => 'BOB',
                'status' => PaymentStatus::Pagado,
                'reference' => 'PAY-0001',
                'gateway' => 'simulado',
                'gateway_reference' => 'SIM-0001',
                'gateway_response' => ['approved' => true, 'message' => 'Pago simulado aprobado'],
                'qr_payload' => json_encode(['provider' => 'QR Simple', 'reference' => 'PAY-0001', 'amount' => 566.67]),
                'paid_at' => now(),
                'created_by' => $secretaria->id,
            ]);
        }

        $secondInstallment = $installments[1];
        $pendingExists = Payment::where('payable_type', PaymentPlanInstallment::class)
            ->where('payable_id', $secondInstallment->id)
            ->where('status', PaymentStatus::Pendiente->value)
            ->exists();

        if (! $pendingExists) {
            $secondInstallment->payments()->create([
                'user_id' => $patientUser->id,
                'patient_id' => $patient->id,
                'payment_method_id' => $qrMethod->id,
                'type' => PaymentType::Cuota,
                'amount' => $secondInstallment->amount,
                'currency' => 'BOB',
                'status' => PaymentStatus::Pendiente,
                'reference' => 'PAY-0002',
                'gateway' => 'simulado',
                'qr_payload' => json_encode(['provider' => 'QR Simple', 'reference' => 'PAY-0002', 'amount' => 566.67]),
                'created_by' => $secretaria->id,
            ]);
        }

        $treatmentPayment = Payment::where('reference', 'PAY-0001')->first();

        if ($treatmentPayment) {
            Receipt::updateOrCreate(
                ['number' => 'REC-0001'],
                [
                    'payment_id' => $treatmentPayment->id,
                    'document_type' => 'recibo',
                    'customer_name' => $patient->full_name,
                    'customer_tax_id' => $patient->ci,
                    'amount' => $treatmentPayment->amount,
                    'issued_at' => now(),
                    'qr_data' => json_encode(['reference' => 'PAY-0001', 'amount' => 566.67]),
                    'status' => 'emitido',
                ],
            );
        }

        $sale = PharmacySale::updateOrCreate(
            ['sale_number' => 'VEN-0001'],
            [
                'patient_id' => $patient->id,
                'user_id' => $patientUser->id,
                'subtotal' => 49,
                'discount' => 0,
                'total' => 49,
                'status' => 'completada',
                'sold_by' => $secretaria->id,
                'sold_at' => now()->subDay(),
                'notes' => 'Venta de medicamentos con receta.',
            ],
        );

        $sale->items()->delete();
        $ibuprofen = Product::where('sku', 'IBU-400')->firstOrFail();
        $gauze = Product::where('sku', 'GASAS-EST')->firstOrFail();

        $sale->items()->createMany([
            ['product_id' => $ibuprofen->id, 'quantity' => 9, 'unit_price' => 5, 'subtotal' => 45],
            ['product_id' => $gauze->id, 'quantity' => 2, 'unit_price' => 2, 'subtotal' => 4],
        ]);

        $salePaid = Payment::where('payable_type', PharmacySale::class)
            ->where('payable_id', $sale->id)
            ->where('status', PaymentStatus::Pagado->value)
            ->exists();

        if (! $salePaid) {
            $sale->payments()->create([
                'user_id' => $patientUser->id,
                'patient_id' => $patient->id,
                'payment_method_id' => $qrMethod->id,
                'type' => PaymentType::Farmacia,
                'amount' => 49,
                'currency' => 'BOB',
                'status' => PaymentStatus::Pagado,
                'reference' => 'PAY-0003',
                'gateway' => 'simulado',
                'gateway_reference' => 'SIM-0003',
                'gateway_response' => ['approved' => true, 'message' => 'Pago simulado aprobado'],
                'qr_payload' => json_encode(['provider' => 'QR Simple', 'reference' => 'PAY-0003', 'amount' => 49]),
                'paid_at' => now()->subDay(),
                'created_by' => $secretaria->id,
            ]);
        }

        $salePayment = Payment::where('reference', 'PAY-0003')->first();

        if ($salePayment) {
            Receipt::updateOrCreate(
                ['number' => 'REC-0002'],
                [
                    'payment_id' => $salePayment->id,
                    'pharmacy_sale_id' => $sale->id,
                    'document_type' => 'recibo',
                    'customer_name' => $patient->full_name,
                    'customer_tax_id' => $patient->ci,
                    'amount' => 49,
                    'issued_at' => now()->subDay(),
                    'qr_data' => json_encode(['reference' => 'PAY-0003', 'amount' => 49]),
                    'status' => 'emitido',
                ],
            );
        }
    }
}
