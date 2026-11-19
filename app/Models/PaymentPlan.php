<?php

namespace App\Models;

use App\Enums\PaymentPlanStatus;
use Database\Factories\PaymentPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentPlan extends Model
{
    /** @use HasFactory<PaymentPlanFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    public function currentStatus(): PaymentPlanStatus
    {
        return PaymentPlanStatus::from((string) $this->getRawOriginal('status'));
    }

    public function isCanceled(): bool
    {
        return $this->currentStatus() === PaymentPlanStatus::Cancelado;
    }

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'start_date' => 'date',
            'status' => PaymentPlanStatus::class,
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * @return BelongsTo<TreatmentPlan, $this>
     */
    public function treatmentPlan(): BelongsTo
    {
        return $this->belongsTo(TreatmentPlan::class);
    }

    /**
     * @return HasMany<PaymentPlanInstallment, $this>
     */
    public function installments(): HasMany
    {
        return $this->hasMany(PaymentPlanInstallment::class)->orderBy('number');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
