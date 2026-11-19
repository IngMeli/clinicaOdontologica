<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Enums\ConsultationStatus;
use App\Http\Requests\Appointments\StoreAppointmentRequest;
use App\Http\Requests\Appointments\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use App\Services\AppointmentScheduler;
use App\Services\AuditLogger;
use App\Services\DocumentNumberService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AppointmentController extends Controller
{
    public function __construct(
        private readonly AppointmentScheduler $scheduler,
        private readonly DocumentNumberService $documents,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Appointment::class);

        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        $weekStart = $this->weekStart($request);
        $weekEnd = $weekStart->endOfWeek();

        $doctorFilter = $request->integer('doctor_id');
        $doctorId = $user->hasRole('doctor')
            ? ($this->doctorIdFor($user) ?? 0)
            : ($doctorFilter > 0 ? $doctorFilter : null);

        $status = $request->string('status')->toString();
        $validStatuses = array_map(
            fn (AppointmentStatus $case): string => $case->value,
            AppointmentStatus::cases(),
        );

        if (! in_array($status, $validStatuses, true)) {
            $status = '';
        }

        $appointments = Appointment::query()
            ->with(['patient', 'doctor.user', 'doctor.specialty'])
            ->whereBetween('scheduled_at', [$weekStart, $weekEnd])
            ->when($doctorId !== null, fn ($query) => $query->where('doctor_id', $doctorId))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->orderBy('scheduled_at')
            ->get();

        $doctors = Doctor::query()
            ->with(['user', 'specialty'])
            ->where('active', true)
            ->orderBy('id')
            ->get();

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'doctors' => $doctors,
            'week' => [
                'start' => $weekStart->toDateString(),
                'end' => $weekEnd->toDateString(),
            ],
            'filters' => [
                'week' => $weekStart->toDateString(),
                'doctor_id' => $doctorId,
                'status' => $status,
            ],
            'isDoctor' => $user->hasRole('doctor'),
            'can' => [
                'create' => Gate::allows('create', Appointment::class),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Appointment::class);

        $patientId = $request->integer('patient_id');
        $date = $request->string('date')->toString();

        return Inertia::render('appointments/create', [
            ...$this->formOptions($request->user()),
            'defaults' => [
                'patient_id' => $patientId > 0 ? $patientId : null,
                'date' => $date !== '' ? $date : now()->toDateString(),
            ],
        ]);
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $data = $this->normalizeDoctorForUser($request->validated(), $request->user());
        $appointment = $this->scheduler->create($data, $request->user());

        $this->audit->log('Cita creada', $appointment, [
            'scheduled_at' => CarbonImmutable::parse((string) $appointment->scheduled_at)->toDateTimeString(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Cita programada correctamente.',
        ]);

        return to_route('appointments.index', [
            'week' => CarbonImmutable::parse((string) $appointment->scheduled_at)->toDateString(),
        ]);
    }

    public function show(Appointment $appointment): Response
    {
        Gate::authorize('view', $appointment);

        $appointment->load(['patient', 'doctor.user', 'doctor.specialty', 'consultation']);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
            'can' => [
                'update' => Gate::allows('update', $appointment),
                'change_status' => Gate::allows('changeStatus', $appointment),
                'create_consultation' => Gate::allows('createConsultation', $appointment),
            ],
        ]);
    }

    public function edit(Request $request, Appointment $appointment): Response
    {
        Gate::authorize('update', $appointment);

        return Inertia::render('appointments/edit', [
            'appointment' => $appointment,
            ...$this->formOptions($request->user()),
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $data = $this->normalizeDoctorForUser($request->validated(), $request->user());
        $appointment = $this->scheduler->update($appointment, $data);

        $this->audit->log('Cita actualizada', $appointment, [
            'scheduled_at' => CarbonImmutable::parse((string) $appointment->scheduled_at)->toDateTimeString(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Cita actualizada correctamente.',
        ]);

        return to_route('appointments.show', $appointment);
    }

    public function changeStatus(Request $request, Appointment $appointment): RedirectResponse
    {
        Gate::authorize('changeStatus', $appointment);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(AppointmentStatus::class)],
        ]);

        $status = AppointmentStatus::from((string) $validated['status']);
        $this->scheduler->changeStatus($appointment, $status);

        $this->audit->log('Estado de cita actualizado', $appointment, [
            'status' => $status->value,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Estado de la cita actualizado.',
        ]);

        return back();
    }

    public function createConsultation(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('createConsultation', $appointment);

        $currentStatus = AppointmentStatus::tryFrom((string) $appointment->getRawOriginal('status'));

        if ($currentStatus !== AppointmentStatus::Atendida) {
            throw ValidationException::withMessages([
                'appointment' => 'Primero marca la cita como atendida para iniciar la consulta.',
            ]);
        }

        if ($appointment->consultation()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Esta cita ya tiene una consulta asociada.',
            ]);

            return back();
        }

        $consultation = DB::transaction(function () use ($appointment): Consultation {
            return Consultation::query()->create([
                'code' => $this->documents->next(Consultation::class, 'code', 'CON'),
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'appointment_id' => $appointment->id,
                'consulted_at' => now(),
                'reason' => $appointment->reason ?: 'Consulta odontológica',
                'status' => ConsultationStatus::Abierta->value,
            ]);
        });

        $this->audit->log('Consulta iniciada desde cita', $consultation, [
            'appointment_id' => $appointment->id,
            'code' => $consultation->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Consulta iniciada. Continúa con el registro clínico.',
        ]);

        return to_route('consultations.show', $consultation);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizeDoctorForUser(array $data, ?User $user): array
    {
        if ($user instanceof User && $user->hasRole('doctor')) {
            $data['doctor_id'] = $this->doctorIdFor($user) ?? 0;
        }

        return $data;
    }

    /**
     * @return array{patients: Collection<int, Patient>, doctors: Collection<int, Doctor>}
     */
    private function formOptions(?User $user = null): array
    {
        $doctorQuery = Doctor::query()
            ->with(['user', 'specialty'])
            ->where('active', true)
            ->orderBy('id');

        if ($user instanceof User && $user->hasRole('doctor')) {
            $doctorQuery->whereKey($this->doctorIdFor($user) ?? 0);
        }

        return [
            'patients' => Patient::query()
                ->where('active', true)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get(['id', 'code', 'first_name', 'last_name']),
            'doctors' => $doctorQuery->get(),
        ];
    }

    private function doctorIdFor(User $user): ?int
    {
        $doctorId = $user->doctor()->value('id');

        return is_numeric($doctorId) ? (int) $doctorId : null;
    }

    private function weekStart(Request $request): CarbonImmutable
    {
        $week = $request->string('week')->toString();

        if ($week !== '') {
            try {
                return CarbonImmutable::parse($week)->startOfWeek();
            } catch (Throwable) {
                // Fall back to the current week when the query value is invalid.
            }
        }

        return CarbonImmutable::now()->startOfWeek();
    }
}
