<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AppointmentScheduler
{
    /**
     * @var array<string, array<int, string>>
     */
    private const TRANSITIONS = [
        'programada' => ['confirmada', 'cancelada', 'no_asistio'],
        'confirmada' => ['atendida', 'cancelada', 'no_asistio'],
        'atendida' => [],
        'cancelada' => [],
        'no_asistio' => [],
    ];

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?User $user = null): Appointment
    {
        $patientId = (int) $data['patient_id'];
        $doctorId = (int) $data['doctor_id'];
        $scheduledAt = CarbonImmutable::parse((string) $data['scheduled_at']);
        $duration = (int) $data['duration_minutes'];

        return DB::transaction(function () use ($data, $duration, $doctorId, $patientId, $scheduledAt, $user): Appointment {
            $doctor = Doctor::query()
                ->whereKey($doctorId)
                ->lockForUpdate()
                ->first();

            if (! $doctor instanceof Doctor || ! $doctor->active) {
                throw ValidationException::withMessages([
                    'doctor_id' => 'El doctor seleccionado no está disponible.',
                ]);
            }

            $this->assertWithinSchedule($doctorId, $scheduledAt, $duration);
            $this->assertNoOverlap($doctorId, $scheduledAt, $duration);

            $appointment = Appointment::query()->create([
                'patient_id' => $patientId,
                'doctor_id' => $doctorId,
                'created_by' => $user?->id,
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => $duration,
                'status' => AppointmentStatus::Programada->value,
                'reason' => $this->nullableString($data['reason'] ?? null),
                'notes' => $this->nullableString($data['notes'] ?? null),
            ]);

            return $appointment;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Appointment $appointment, array $data): Appointment
    {
        $patientId = (int) $data['patient_id'];
        $doctorId = (int) $data['doctor_id'];
        $scheduledAt = CarbonImmutable::parse((string) $data['scheduled_at']);
        $duration = (int) $data['duration_minutes'];

        return DB::transaction(function () use ($appointment, $data, $doctorId, $duration, $patientId, $scheduledAt): Appointment {
            $doctor = Doctor::query()
                ->whereKey($doctorId)
                ->lockForUpdate()
                ->first();

            if (! $doctor instanceof Doctor || ! $doctor->active) {
                throw ValidationException::withMessages([
                    'doctor_id' => 'El doctor seleccionado no está disponible.',
                ]);
            }

            $this->assertWithinSchedule($doctorId, $scheduledAt, $duration);
            $this->assertNoOverlap($doctorId, $scheduledAt, $duration, $appointment->id);

            $appointment->fill([
                'patient_id' => $patientId,
                'doctor_id' => $doctorId,
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => $duration,
                'reason' => $this->nullableString($data['reason'] ?? null),
                'notes' => $this->nullableString($data['notes'] ?? null),
            ])->save();

            return $appointment;
        });
    }

    public function changeStatus(Appointment $appointment, AppointmentStatus $status): Appointment
    {
        $current = AppointmentStatus::tryFrom((string) $appointment->getRawOriginal('status'))
            ?? AppointmentStatus::Programada;

        if ($current === $status) {
            return $appointment;
        }

        $allowed = self::TRANSITIONS[$current->value];

        if (! in_array($status->value, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => 'La transición de estado seleccionada no es válida.',
            ]);
        }

        $appointment->forceFill(['status' => $status->value])->save();

        return $appointment->refresh();
    }

    private function assertWithinSchedule(
        int $doctorId,
        CarbonImmutable $scheduledAt,
        int $duration,
    ): void {
        $hasSchedules = DoctorSchedule::query()
            ->where('doctor_id', $doctorId)
            ->where('active', true)
            ->exists();

        if (! $hasSchedules) {
            return;
        }

        $end = $scheduledAt->addMinutes($duration);

        $insideSchedule = $scheduledAt->toDateString() === $end->toDateString()
            && DoctorSchedule::query()
                ->where('doctor_id', $doctorId)
                ->where('active', true)
                ->where('weekday', $scheduledAt->isoWeekday())
                ->where('start_time', '<=', $scheduledAt->format('H:i:s'))
                ->where('end_time', '>=', $end->format('H:i:s'))
                ->exists();

        if (! $insideSchedule) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'El horario seleccionado está fuera de la disponibilidad del doctor.',
            ]);
        }
    }

    private function assertNoOverlap(
        int $doctorId,
        CarbonImmutable $scheduledAt,
        int $duration,
        ?int $ignoreAppointmentId = null,
    ): void {
        $end = $scheduledAt->addMinutes($duration);
        $windowStart = $scheduledAt->subDay();
        $windowEnd = $end->addDay();

        $candidates = Appointment::query()
            ->where('doctor_id', $doctorId)
            ->whereIn('status', [
                AppointmentStatus::Programada->value,
                AppointmentStatus::Confirmada->value,
                AppointmentStatus::Atendida->value,
            ])
            ->when(
                $ignoreAppointmentId !== null,
                fn ($query) => $query->whereKeyNot($ignoreAppointmentId),
            )
            ->whereBetween('scheduled_at', [$windowStart, $windowEnd])
            ->get(['id', 'scheduled_at', 'duration_minutes']);

        foreach ($candidates as $candidate) {
            $candidateStart = CarbonImmutable::parse((string) $candidate->scheduled_at);
            $candidateEnd = $candidateStart->addMinutes((int) $candidate->duration_minutes);

            if ($candidateStart < $end && $candidateEnd > $scheduledAt) {
                throw ValidationException::withMessages([
                    'scheduled_at' => 'El doctor ya tiene una cita en el horario seleccionado.',
                ]);
            }
        }
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
