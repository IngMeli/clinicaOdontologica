<?php

namespace App\Models;

use App\Enums\InstallmentStatus;
use Database\Factories\PaymentPlanInstallmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PaymentPlanInstallment extends Model
{
    /** @use HasFactory<PaymentPlanInstallmentFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    public function currentStatus(): InstallmentStatus
    {
        return InstallmentStatus::from((string) $this->getRawOriginal('status'));
    }

    public function isPaid(): bool
    {
        return $this->currentStatus() === InstallmentStatus::Pagado;
    }

    public function isCanceled(): bool
    {
        return $this->currentStatus() === InstallmentStatus::Anulado;
    }

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'status' => InstallmentStatus::class,
        ];
    }

    /**
     * @return BelongsTo<PaymentPlan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(PaymentPlan::class, 'payment_plan_id');
    }

    /**
     * @return MorphMany<Payment, $this>
     */
    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
