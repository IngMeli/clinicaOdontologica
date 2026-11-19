<?php

namespace App\Models;

use App\Enums\ConsultationStatus;
use Database\Factories\ConsultationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consultation extends Model
{
    /** @use HasFactory<ConsultationFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'consulted_at' => 'datetime',
            'status' => ConsultationStatus::class,
        ];
    }

    public function currentStatus(): ConsultationStatus
    {
        return ConsultationStatus::from((string) $this->getRawOriginal('status'));
    }

    public function isOpen(): bool
    {
        return $this->currentStatus() === ConsultationStatus::Abierta;
    }

    public function isClosed(): bool
    {
        return $this->currentStatus() === ConsultationStatus::Cerrada;
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
     * @return BelongsTo<Appointment, $this>
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * @return HasMany<OdontogramEntry, $this>
     */
    public function odontogramEntries(): HasMany
    {
        return $this->hasMany(OdontogramEntry::class);
    }

    /**
     * @return HasMany<Prescription, $this>
     */
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * @return HasMany<TreatmentPlan, $this>
     */
    public function treatmentPlans(): HasMany
    {
        return $this->hasMany(TreatmentPlan::class);
    }
}
