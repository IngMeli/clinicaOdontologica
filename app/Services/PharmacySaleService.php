<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\StockMovementType;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PharmacySale;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PharmacySaleService
{
    public function __construct(
        private readonly StockService $stock,
        private readonly PaymentService $payments,
        private readonly DocumentNumberService $documents,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $actor): PharmacySale
    {
        return DB::transaction(function () use ($data, $actor): PharmacySale {
            $patient = $this->resolvePatient($data);
            $lineData = $this->lineData($data);

            $sale = PharmacySale::query()->create([
                'sale_number' => $this->documents->next(PharmacySale::class, 'sale_number', 'VEN'),
                'patient_id' => $patient?->id,
                'user_id' => $patient?->user_id,
                'subtotal' => 0,
                'discount' => 0,
                'total' => 0,
                'status' => 'completada',
                'sold_by' => $actor->id,
                'sold_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            $subtotal = 0.0;

            foreach ($lineData as $line) {
                $sale->items()->create([
                    'product_id' => $line['product']->id,
                    'batch_id' => null,
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'subtotal' => $line['subtotal'],
                ]);

                $this->stock->consume(
                    $line['product'],
                    $line['quantity'],
                    StockMovementType::Venta,
                    $sale,
                    $actor,
                    'Venta de farmacia '.$sale->sale_number,
                );

                $subtotal += $line['subtotal'];
            }

            $discount = min((float) ($data['discount'] ?? 0), $subtotal);
            $total = round($subtotal - $discount, 2);

            $sale->update([
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
            ]);

            if ($patient !== null && $total > 0) {
                $payment = $this->payments->create([
                    'user_id' => $patient->user_id,
                    'patient_id' => $patient->id,
                    'type' => PaymentType::Farmacia,
                    'amount' => $total,
                    'status' => PaymentStatus::Pagado,
                    'paid_at' => now(),
                ], $actor, $sale);

                $this->payments->issueReceipt($payment, $sale);
            }

            return $sale->refresh();
        });
    }

    public function cancel(PharmacySale $sale, User $actor): PharmacySale
    {
        return DB::transaction(function () use ($sale, $actor): PharmacySale {
            $sale = PharmacySale::query()->lockForUpdate()->findOrFail($sale->id);

            if ($sale->status === 'anulada') {
                throw ValidationException::withMessages([
                    'sale' => 'La venta ya está anulada.',
                ]);
            }

            $this->stock->restore($sale, $actor, 'Anulación de venta '.$sale->sale_number);

            Payment::query()
                ->whereIn('payable_type', [$sale->getMorphClass(), $sale::class])
                ->where('payable_id', $sale->id)
                ->where('status', PaymentStatus::Pagado->value)
                ->update([
                    'status' => PaymentStatus::Anulado->value,
                    'paid_at' => null,
                    'updated_at' => now(),
                ]);

            $sale->receipts()->update(['status' => 'anulado']);
            $sale->forceFill(['status' => 'anulada'])->save();

            return $sale->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function resolvePatient(array $data): ?Patient
    {
        $patientId = isset($data['patient_id']) ? (int) $data['patient_id'] : null;
        $prescriptionId = isset($data['prescription_id']) ? (int) $data['prescription_id'] : null;

        if ($prescriptionId === null) {
            return $patientId !== null ? Patient::query()->findOrFail($patientId) : null;
        }

        $prescription = Prescription::query()->findOrFail($prescriptionId);

        if ($patientId !== null && $patientId !== $prescription->patient_id) {
            throw ValidationException::withMessages([
                'prescription_id' => 'La receta seleccionada pertenece a otro paciente.',
            ]);
        }

        return Patient::query()->findOrFail($prescription->patient_id);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<int, array{product: Product, quantity: int, unit_price: float, subtotal: float}>
     */
    private function lineData(array $data): array
    {
        $items = $data['items'] ?? [];

        if (! is_array($items) || $items === []) {
            throw ValidationException::withMessages([
                'items' => 'Agrega al menos un producto a la venta.',
            ]);
        }

        $lines = [];

        foreach ($items as $index => $item) {
            if (! is_array($item)) {
                continue;
            }

            $product = Product::query()->findOrFail((int) ($item['product_id'] ?? 0));
            $quantity = (int) ($item['quantity'] ?? 0);

            if (! $product->active) {
                throw ValidationException::withMessages([
                    "items.{$index}.product_id" => 'El producto no está activo.',
                ]);
            }

            if ($quantity < 1) {
                throw ValidationException::withMessages([
                    "items.{$index}.quantity" => 'La cantidad debe ser mayor a cero.',
                ]);
            }

            $unitPrice = array_key_exists('unit_price', $item) && $item['unit_price'] !== null
                ? (float) $item['unit_price']
                : (float) $product->sale_price;

            $lines[] = [
                'product' => $product,
                'quantity' => $quantity,
                'unit_price' => round($unitPrice, 2),
                'subtotal' => round($unitPrice * $quantity, 2),
            ];
        }

        return $lines;
    }
}
