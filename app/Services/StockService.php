<?php

namespace App\Services;

use App\Enums\StockMovementType;
use App\Models\Batch;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function adjust(Product $product, array $data, User $actor, ?Model $reference = null): StockMovement
    {
        return DB::transaction(function () use ($product, $data, $actor, $reference): StockMovement {
            $product = Product::query()->lockForUpdate()->findOrFail($product->id);
            $type = StockMovementType::from((string) $data['type']);
            $quantity = (int) $data['quantity'];
            $signed = $type->isIncoming() ? $quantity : -$quantity;
            $batchId = null;

            if ($signed < 0 && $product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'El stock disponible es insuficiente para realizar el movimiento.',
                ]);
            }

            $batchId = $this->resolveBatch($product, $data, $signed);

            $movement = StockMovement::query()->create([
                'product_id' => $product->id,
                'batch_id' => $batchId,
                'type' => $type,
                'quantity' => $signed,
                'unit_cost' => $data['unit_cost'] ?? null,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
                'reason' => $data['reason'] ?? null,
                'created_by' => $actor->id,
            ]);

            return $movement;
        });
    }

    public function consume(
        Product $product,
        int $quantity,
        StockMovementType $type,
        Model $reference,
        User $actor,
        ?string $reason = null,
    ): void {
        DB::transaction(function () use ($product, $quantity, $type, $reference, $actor, $reason): void {
            $product = Product::query()->lockForUpdate()->findOrFail($product->id);

            if ($product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'items' => "Stock insuficiente para {$product->name}.",
                ]);
            }

            $remaining = $quantity;
            $batches = Batch::query()
                ->where('product_id', $product->id)
                ->where('quantity', '>', 0)
                ->orderByRaw('CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END')
                ->orderBy('expiry_date')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }

                $taken = min($remaining, $batch->quantity);
                $batch->forceFill(['quantity' => $batch->quantity - $taken])->save();
                $remaining -= $taken;

                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'batch_id' => $batch->id,
                    'type' => $type,
                    'quantity' => -$taken,
                    'unit_cost' => null,
                    'reference_type' => $reference->getMorphClass(),
                    'reference_id' => $reference->getKey(),
                    'reason' => $reason,
                    'created_by' => $actor->id,
                ]);
            }

            if ($remaining > 0) {
                StockMovement::query()->create([
                    'product_id' => $product->id,
                    'batch_id' => null,
                    'type' => $type,
                    'quantity' => -$remaining,
                    'unit_cost' => null,
                    'reference_type' => $reference->getMorphClass(),
                    'reference_id' => $reference->getKey(),
                    'reason' => $reason,
                    'created_by' => $actor->id,
                ]);
            }
        });
    }

    public function restore(Model $reference, User $actor, string $reason = 'Reversión de movimiento'): void
    {
        DB::transaction(function () use ($reference, $actor, $reason): void {
            $movements = StockMovement::query()
                ->whereIn('reference_type', [$reference->getMorphClass(), $reference::class])
                ->where('reference_id', $reference->getKey())
                ->where('quantity', '<', 0)
                ->lockForUpdate()
                ->get();

            foreach ($movements as $movement) {
                if ($movement->batch_id !== null) {
                    $batch = Batch::query()->lockForUpdate()->find($movement->batch_id);

                    if ($batch instanceof Batch) {
                        $batch->forceFill([
                            'quantity' => $batch->quantity + abs($movement->quantity),
                        ])->save();
                    }
                }

                StockMovement::query()->create([
                    'product_id' => $movement->product_id,
                    'batch_id' => $movement->batch_id,
                    'type' => StockMovementType::Devolucion,
                    'quantity' => abs($movement->quantity),
                    'unit_cost' => $movement->unit_cost,
                    'reference_type' => $reference->getMorphClass(),
                    'reference_id' => $reference->getKey(),
                    'reason' => $reason,
                    'created_by' => $actor->id,
                ]);
            }
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function resolveBatch(Product $product, array $data, int $signed): ?int
    {
        $batchId = isset($data['batch_id']) ? (int) $data['batch_id'] : null;

        if ($batchId !== null) {
            $batch = Batch::query()->lockForUpdate()->findOrFail($batchId);

            if ($batch->product_id !== $product->id) {
                throw ValidationException::withMessages([
                    'batch_id' => 'El lote seleccionado pertenece a otro producto.',
                ]);
            }

            if ($signed < 0 && $batch->quantity < abs($signed)) {
                throw ValidationException::withMessages([
                    'batch_id' => 'El lote seleccionado no tiene cantidad suficiente.',
                ]);
            }

            $batch->forceFill(['quantity' => $batch->quantity + $signed])->save();

            return $batch->id;
        }

        if ($signed < 0 || empty($data['lot_number'])) {
            return null;
        }

        $batch = Batch::query()->firstOrCreate(
            [
                'product_id' => $product->id,
                'lot_number' => (string) $data['lot_number'],
            ],
            [
                'supplier_id' => $data['supplier_id'] ?? null,
                'expiry_date' => $data['expiry_date'] ?? null,
                'quantity' => 0,
                'unit_cost' => $data['unit_cost'] ?? 0,
            ],
        );

        $batch->forceFill([
            'supplier_id' => $data['supplier_id'] ?? $batch->supplier_id,
            'expiry_date' => $data['expiry_date'] ?? $batch->expiry_date,
            'quantity' => $batch->quantity + $signed,
            'unit_cost' => $data['unit_cost'] ?? $batch->unit_cost,
        ])->save();

        return $batch->id;
    }
}
