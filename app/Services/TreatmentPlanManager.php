<?php

namespace App\Services;

use App\Enums\TreatmentItemStatus;
use App\Enums\TreatmentPlanStatus;
use App\Models\TreatmentPlan;
use App\Models\TreatmentPlanItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TreatmentPlanManager
{
    public function __construct(private readonly DocumentNumberService $documents) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?User $user): TreatmentPlan
    {
        return DB::transaction(function () use ($data, $user): TreatmentPlan {
            return TreatmentPlan::query()->create([
                ...$data,
                'code' => $this->documents->next(TreatmentPlan::class, 'code', 'TP'),
                'status' => TreatmentPlanStatus::Borrador->value,
                'total' => 0,
                'created_by' => $user?->id,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(TreatmentPlan $plan, array $data): TreatmentPlan
    {
        $this->assertDraft($plan);

        $plan->fill($data)->save();

        return $plan->refresh();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function addItem(TreatmentPlan $plan, array $data): TreatmentPlanItem
    {
        $this->assertDraft($plan);

        return DB::transaction(function () use ($plan, $data): TreatmentPlanItem {
            $quantity = (int) $data['quantity'];
            $unitPrice = (float) $data['unit_price'];

            $item = $plan->items()->create([
                ...$data,
                'subtotal' => $quantity * $unitPrice,
                'status' => TreatmentItemStatus::Pendiente->value,
                'sessions_done' => 0,
            ]);

            $this->recalculate($plan);

            return $item->load('treatment');
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateItem(TreatmentPlan $plan, TreatmentPlanItem $item, array $data): TreatmentPlanItem
    {
        $this->assertDraft($plan);

        return DB::transaction(function () use ($plan, $item, $data): TreatmentPlanItem {
            $quantity = (int) $data['quantity'];
            $unitPrice = (float) $data['unit_price'];

            $item->fill([
                ...$data,
                'subtotal' => $quantity * $unitPrice,
            ])->save();

            $this->recalculate($plan);

            return $item->refresh()->load('treatment');
        });
    }

    public function deleteItem(TreatmentPlan $plan, TreatmentPlanItem $item): void
    {
        $this->assertDraft($plan);

        DB::transaction(function () use ($plan, $item): void {
            $item->delete();
            $this->recalculate($plan);
        });
    }

    public function updateItemProgress(
        TreatmentPlan $plan,
        TreatmentPlanItem $item,
        TreatmentItemStatus $status,
        int $sessionsDone,
    ): TreatmentPlanItem {
        if ($plan->isDraft()) {
            throw ValidationException::withMessages([
                'status' => 'Aprueba el plan antes de registrar avances.',
            ]);
        }

        if ($plan->isCanceled()) {
            throw ValidationException::withMessages([
                'status' => 'No se puede registrar avance en un plan cancelado.',
            ]);
        }

        if ($sessionsDone > $item->sessions_planned) {
            throw ValidationException::withMessages([
                'sessions_done' => 'Las sesiones realizadas no pueden superar las planificadas.',
            ]);
        }

        return DB::transaction(function () use ($plan, $item, $status, $sessionsDone): TreatmentPlanItem {
            $item->forceFill([
                'status' => $status->value,
                'sessions_done' => $status === TreatmentItemStatus::Completado
                    ? $item->sessions_planned
                    : $sessionsDone,
            ])->save();

            $this->syncProgress($plan);

            return $item->refresh()->load('treatment');
        });
    }

    public function changeStatus(TreatmentPlan $plan, TreatmentPlanStatus $status): TreatmentPlan
    {
        $allowed = match ($plan->currentStatus()) {
            TreatmentPlanStatus::Borrador => [
                TreatmentPlanStatus::Aprobado,
                TreatmentPlanStatus::Cancelado,
            ],
            TreatmentPlanStatus::Aprobado => [
                TreatmentPlanStatus::EnProgreso,
                TreatmentPlanStatus::Cancelado,
            ],
            TreatmentPlanStatus::EnProgreso => [
                TreatmentPlanStatus::Completado,
                TreatmentPlanStatus::Cancelado,
            ],
            TreatmentPlanStatus::Completado, TreatmentPlanStatus::Cancelado => [],
        };

        if (! in_array($status, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => 'La transición de estado del plan no es válida.',
            ]);
        }

        if ($status === TreatmentPlanStatus::Aprobado && ! $plan->items()->exists()) {
            throw ValidationException::withMessages([
                'status' => 'Agrega al menos un procedimiento antes de aprobar el plan.',
            ]);
        }

        $dates = [];

        if ($status === TreatmentPlanStatus::Aprobado && $plan->start_date === null) {
            $dates['start_date'] = now()->toDateString();
        }

        if (in_array($status, [TreatmentPlanStatus::Completado, TreatmentPlanStatus::Cancelado], true)) {
            $dates['end_date'] = now()->toDateString();
        }

        $plan->forceFill([
            ...$dates,
            'status' => $status->value,
        ])->save();

        return $plan->refresh();
    }

    public function recalculate(TreatmentPlan $plan): void
    {
        $total = (float) $plan->items()->sum('subtotal');

        $plan->forceFill(['total' => $total])->save();
    }

    private function syncProgress(TreatmentPlan $plan): void
    {
        if ($plan->isCanceled()) {
            return;
        }

        $items = $plan->items()->get(['status']);
        $allCompleted = $items->isNotEmpty() && $items->every(
            fn (TreatmentPlanItem $item): bool => $item->currentStatus() === TreatmentItemStatus::Completado,
        );

        if ($allCompleted) {
            $plan->forceFill([
                'status' => TreatmentPlanStatus::Completado->value,
                'end_date' => $plan->end_date ?? now()->toDateString(),
            ])->save();

            return;
        }

        $hasProgress = $items->contains(
            fn (TreatmentPlanItem $item): bool => in_array($item->currentStatus(), [
                TreatmentItemStatus::EnProgreso,
                TreatmentItemStatus::Completado,
            ], true),
        );

        if ($hasProgress && $plan->currentStatus() === TreatmentPlanStatus::Aprobado) {
            $plan->forceFill(['status' => TreatmentPlanStatus::EnProgreso->value])->save();
        }
    }

    private function assertDraft(TreatmentPlan $plan): void
    {
        if (! $plan->isDraft()) {
            throw ValidationException::withMessages([
                'plan' => 'Solo puedes modificar el plan mientras está en borrador.',
            ]);
        }
    }
}
