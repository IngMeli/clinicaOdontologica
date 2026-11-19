<?php

namespace App\Models;

use App\Enums\TreatmentPlanStatus;
use Database\Factories\TreatmentPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class TreatmentPlan extends Model
{
    /** @use HasFactory<TreatmentPlanFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total' => 'decimal:2',
            'status' => TreatmentPlanStatus::class,
        ];
    }

    public function currentStatus(): TreatmentPlanStatus
    {
        return TreatmentPlanStatus::from((string) $this->getRawOriginal('status'));
    }

    public function isDraft(): bool
    {
        return $this->currentStatus() === TreatmentPlanStatus::Borrador;
    }

    public function isCanceled(): bool
    {
        return $this->currentStatus() === TreatmentPlanStatus::Cancelado;
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * @return BelongsTo<Consultation, $this>
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    /**
     * @return HasMany<TreatmentPlanItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(TreatmentPlanItem::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return MorphMany<Payment, $this>
     */
    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
