<?php

namespace App\Models;

use App\Enums\TreatmentItemStatus;
use Database\Factories\TreatmentPlanItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TreatmentPlanItem extends Model
{
    /** @use HasFactory<TreatmentPlanItemFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'status' => TreatmentItemStatus::class,
        ];
    }

    public function currentStatus(): TreatmentItemStatus
    {
        return TreatmentItemStatus::from((string) $this->getRawOriginal('status'));
    }

    /**
     * @return BelongsTo<TreatmentPlan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(TreatmentPlan::class, 'treatment_plan_id');
    }

    /**
     * @return BelongsTo<Treatment, $this>
     */
    public function treatment(): BelongsTo
    {
        return $this->belongsTo(Treatment::class);
    }
}
