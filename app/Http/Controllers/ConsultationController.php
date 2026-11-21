<?php

namespace App\Http\Controllers;

use App\Enums\ConsultationStatus;
use App\Enums\OdontogramCondition;
use App\Http\Requests\Consultations\UpdateConsultationRequest;
use App\Http\Requests\Odontogram\StoreOdontogramEntryRequest;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\OdontogramEntry;
use App\Models\TreatmentPlan;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\OdontogramService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationController extends Controller
{
    public function __construct(
        private readonly OdontogramService $odontogram,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Consultation::class);

        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $status = $request->string('status')->toString();
        $validStatuses = array_map(
            fn (ConsultationStatus $case): string => $case->value,
            ConsultationStatus::cases(),
        );

        if (! in_array($status, $validStatuses, true)) {
            $status = '';
        }

        $doctorFilter = $request->integer('doctor_id');
        $doctorId = $user->hasRole('doctor')
            ? ($this->doctorIdFor($user) ?? 0)
            : ($doctorFilter > 0 ? $doctorFilter : null);

        $consultations = Consultation::query()
            ->with(['patient', 'doctor.user', 'doctor.specialty', 'appointment'])
            ->withCount(['treatmentPlans', 'prescriptions', 'odontogramEntries'])
            ->when($doctorId !== null, fn ($query) => $query->where('doctor_id', $doctorId))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(code) like ?', [$like])
                    ->orWhereRaw('lower(reason) like ?', [$like])
                    ->orWhereRaw('lower(diagnosis) like ?', [$like])
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->whereRaw('lower(first_name) like ?', [$like])
                        ->orWhereRaw('lower(last_name) like ?', [$like])
                        ->orWhereRaw('lower(code) like ?', [$like])),
            ))
            ->when($request->filled('date_from'), fn ($query) => $query
                ->whereDate('consulted_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query
                ->whereDate('consulted_at', '<=', $request->date('date_to')))
            ->orderByDesc('consulted_at')
            ->paginate(15)
            ->withQueryString();

        $doctors = Doctor::query()
            ->with(['user', 'specialty'])
            ->where('active', true)
            ->orderBy('id')
            ->get();

        return Inertia::render('consultations/index', [
            'consultations' => $consultations,
            'doctors' => $doctors,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'doctor_id' => $doctorId,
                'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(),
            ],
            'isDoctor' => $user->hasRole('doctor'),
        ]);
    }

    public function show(Request $request, Consultation $consultation): Response
    {
        Gate::authorize('view', $consultation);

        $consultation->load([
            'patient',
            'doctor.user',
            'doctor.specialty',
            'appointment',
        ]);

        $treatmentPlans = $consultation->treatmentPlans()
            ->with(['doctor.user'])
            ->withCount('items')
            ->latest()
            ->get();

        $prescriptions = $consultation->prescriptions()
            ->with(['doctor.user'])
            ->withCount('items')
            ->latest('issued_at')
            ->get();

        $isOpen = $consultation->isOpen();
        $canViewOdontogram = Gate::allows(Permissions::ODONTOGRAM_VIEW);

        return Inertia::render('consultations/show', [
            'consultation' => $consultation,
            'odontogram' => $canViewOdontogram
                ? $this->odontogram->latest($consultation->patient)
                : [],
            'odontogramHistory' => $canViewOdontogram
                ? $this->odontogram->history($consultation->patient)
                : [],
            'treatmentPlans' => $treatmentPlans,
            'prescriptions' => $prescriptions,
            'conditions' => array_map(
                fn (OdontogramCondition $condition): array => [
                    'value' => $condition->value,
                    'label' => $condition->label(),
                    'code' => $condition->code(),
                ],
                OdontogramCondition::cases(),
            ),
            'can' => [
                'update' => $isOpen && Gate::allows('update', $consultation),
                'close' => $isOpen && Gate::allows('close', $consultation),
                'view_odontogram' => $canViewOdontogram,
                'manage_odontogram' => $isOpen
                    && $canViewOdontogram
                    && Gate::allows(Permissions::ODONTOGRAM_MANAGE)
                    && Gate::allows('update', $consultation),
                'create_treatment_plan' => Gate::allows('create', TreatmentPlan::class),
                'create_prescription' => $request->user()?->canIssuePrescriptions() ?? false,
            ],
        ]);
    }

    public function edit(Consultation $consultation): Response|RedirectResponse
    {
        Gate::authorize('update', $consultation);

        if ($consultation->isClosed()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'La consulta está cerrada y no puede editarse.',
            ]);

            return to_route('consultations.show', $consultation);
        }

        return Inertia::render('consultations/edit', [
            'consultation' => $consultation->load(['patient', 'doctor.user']),
        ]);
    }

    public function update(UpdateConsultationRequest $request, Consultation $consultation): RedirectResponse
    {
        if ($consultation->isClosed()) {
            throw ValidationException::withMessages([
                'consultation' => 'La consulta está cerrada y no puede editarse.',
            ]);
        }

        $consultation->update($request->validated());

        $this->audit->log('Consulta actualizada', $consultation, [
            'code' => $consultation->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Consulta actualizada correctamente.',
        ]);

        return to_route('consultations.show', $consultation);
    }

    public function close(Request $request, Consultation $consultation): RedirectResponse
    {
        Gate::authorize('close', $consultation);

        if ($consultation->isClosed()) {
            throw ValidationException::withMessages([
                'consultation' => 'La consulta ya está cerrada.',
            ]);
        }

        $diagnosis = trim((string) $request->input('diagnosis', $consultation->diagnosis));

        if ($diagnosis === '') {
            throw ValidationException::withMessages([
                'diagnosis' => 'Registra un diagnóstico antes de cerrar la consulta.',
            ]);
        }

        $consultation->forceFill([
            'diagnosis' => $diagnosis,
            'status' => ConsultationStatus::Cerrada->value,
        ])->save();

        $this->audit->log('Consulta cerrada', $consultation, [
            'code' => $consultation->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Consulta cerrada correctamente.',
        ]);

        return to_route('consultations.show', $consultation);
    }

    public function storeOdontogram(
        StoreOdontogramEntryRequest $request,
        Consultation $consultation,
    ): RedirectResponse {
        if ($consultation->isClosed()) {
            throw ValidationException::withMessages([
                'consultation' => 'No puedes modificar el odontograma de una consulta cerrada.',
            ]);
        }

        $data = $request->validated();

        $entry = OdontogramEntry::query()->create([
            'patient_id' => $consultation->patient_id,
            'consultation_id' => $consultation->id,
            'tooth' => $data['tooth'],
            'surface' => $data['surface'] ?? null,
            'condition' => $data['condition'],
            'notes' => $data['notes'] ?? null,
            'recorded_by' => $request->user()?->id,
            'recorded_at' => now(),
        ]);

        $this->audit->log('Odontograma actualizado', $entry, [
            'consultation_id' => $consultation->id,
            'tooth' => $entry->tooth,
            'surface' => $entry->surface,
            'condition' => $entry->condition,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Hallazgo registrado en el odontograma.',
        ]);

        return back();
    }

    private function doctorIdFor(User $user): ?int
    {
        $doctorId = $user->doctor()->value('id');

        return is_numeric($doctorId) ? (int) $doctorId : null;
    }
}
