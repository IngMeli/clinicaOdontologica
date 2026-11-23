<?php

namespace App\Http\Controllers;

use App\Enums\TreatmentItemStatus;
use App\Enums\TreatmentPlanStatus;
use App\Http\Requests\TreatmentPlans\StoreTreatmentPlanItemRequest;
use App\Http\Requests\TreatmentPlans\StoreTreatmentPlanRequest;
use App\Http\Requests\TreatmentPlans\UpdateTreatmentPlanItemProgressRequest;
use App\Http\Requests\TreatmentPlans\UpdateTreatmentPlanItemRequest;
use App\Http\Requests\TreatmentPlans\UpdateTreatmentPlanRequest;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Treatment;
use App\Models\TreatmentPlan;
use App\Models\TreatmentPlanItem;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\TreatmentPlanManager;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentPlanController extends Controller
{
    public function __construct(
        private readonly TreatmentPlanManager $plans,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', TreatmentPlan::class);

        $user = $this->currentUser($request);
        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $status = $request->string('status')->toString();
        $validStatuses = array_map(
            fn (TreatmentPlanStatus $case): string => $case->value,
            TreatmentPlanStatus::cases(),
        );

        if (! in_array($status, $validStatuses, true)) {
            $status = '';
        }

        $doctorFilter = $request->integer('doctor_id');
        $doctorId = $user->hasRole('doctor')
            ? ($this->doctorIdFor($user) ?? 0)
            : ($doctorFilter > 0 ? $doctorFilter : null);

        $plans = TreatmentPlan::query()
            ->with(['patient', 'doctor.user', 'doctor.specialty', 'consultation'])
            ->withCount('items')
            ->when($doctorId !== null, fn ($query) => $query->where('doctor_id', $doctorId))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(code) like ?', [$like])
                    ->orWhereRaw('lower(notes) like ?', [$like])
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->whereRaw('lower(first_name) like ?', [$like])
                        ->orWhereRaw('lower(last_name) like ?', [$like])
                        ->orWhereRaw('lower(code) like ?', [$like])),
            ))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('treatment-plans/index', [
            'plans' => $plans,
            'doctors' => $this->doctorOptions(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'doctor_id' => $doctorId,
            ],
            'isDoctor' => $user->hasRole('doctor'),
            'can' => [
                'create' => $user->canCreateTreatmentPlans(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $this->currentUser($request);

        abort_unless($user->canCreateTreatmentPlans(), 403);

        return Inertia::render('treatment-plans/create', [
            ...$this->formOptions(),
            'selectedPatientId' => $request->integer('patient_id') ?: null,
            'selectedConsultationId' => $request->integer('consultation_id') ?: null,
            'currentDoctorId' => $this->doctorIdFor($user),
            'isDoctor' => $user->hasRole('doctor'),
        ]);
    }

    public function store(StoreTreatmentPlanRequest $request): RedirectResponse
    {
        $user = $this->currentUser($request);
        $data = $this->prepareData($request->validated(), $user);
        $plan = $this->plans->create($data, $user);

        $this->audit->log('Plan de tratamiento creado', $plan, [
            'code' => $plan->code,
            'patient_id' => $plan->patient_id,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Plan de tratamiento creado. Agrega los procedimientos.',
        ]);

        return to_route('treatment-plans.show', $plan);
    }

    public function show(TreatmentPlan $plan): Response
    {
        Gate::authorize('view', $plan);

        $plan->load([
            'patient',
            'doctor.user',
            'doctor.specialty',
            'consultation',
            'creator',
            'items.treatment',
        ]);

        $isDraft = $plan->isDraft();
        $canUpdate = Gate::allows('update', $plan);

        return Inertia::render('treatment-plans/show', [
            'plan' => $plan,
            'treatments' => Treatment::query()
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'price', 'duration_minutes']),
            'transitions' => $this->transitions($plan),
            'can' => [
                'update' => $canUpdate && $isDraft,
                'manage_status' => Gate::allows('manageStatus', $plan),
                'manage_items' => $canUpdate && $isDraft,
                'record_progress' => $canUpdate && in_array($plan->currentStatus(), [
                    TreatmentPlanStatus::Aprobado,
                    TreatmentPlanStatus::EnProgreso,
                ], true),
            ],
        ]);
    }

    public function edit(Request $request, TreatmentPlan $plan): Response|RedirectResponse
    {
        Gate::authorize('update', $plan);

        if (! $plan->isDraft()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Solo puedes editar un plan en borrador.',
            ]);

            return to_route('treatment-plans.show', $plan);
        }

        $user = $this->currentUser($request);

        return Inertia::render('treatment-plans/edit', [
            'plan' => $plan->load(['patient', 'doctor.user', 'consultation']),
            ...$this->formOptions(),
            'currentDoctorId' => $this->doctorIdFor($user),
            'isDoctor' => $user->hasRole('doctor'),
        ]);
    }

    public function update(UpdateTreatmentPlanRequest $request, TreatmentPlan $plan): RedirectResponse
    {
        $user = $this->currentUser($request);
        $data = $this->prepareData($request->validated(), $user);
        $this->plans->update($plan, $data);

        $this->audit->log('Plan de tratamiento actualizado', $plan, [
            'code' => $plan->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Plan de tratamiento actualizado correctamente.',
        ]);

        return to_route('treatment-plans.show', $plan);
    }

    public function storeItem(StoreTreatmentPlanItemRequest $request, TreatmentPlan $plan): RedirectResponse
    {
        $item = $this->plans->addItem($plan, $request->validated());

        $this->audit->log('Procedimiento agregado al plan', $item, [
            'plan_code' => $plan->code,
            'treatment_id' => $item->treatment_id,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Procedimiento agregado correctamente.',
        ]);

        return back();
    }

    public function updateItem(
        UpdateTreatmentPlanItemRequest $request,
        TreatmentPlan $plan,
        TreatmentPlanItem $item,
    ): RedirectResponse {
        $this->assertItemBelongsToPlan($plan, $item);

        $item = $this->plans->updateItem($plan, $item, $request->validated());

        $this->audit->log('Procedimiento del plan actualizado', $item, [
            'plan_code' => $plan->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Procedimiento actualizado correctamente.',
        ]);

        return back();
    }

    public function deleteItem(TreatmentPlan $plan, TreatmentPlanItem $item): RedirectResponse
    {
        Gate::authorize('update', $plan);
        $this->assertItemBelongsToPlan($plan, $item);

        $this->plans->deleteItem($plan, $item);

        $this->audit->log('Procedimiento eliminado del plan', $plan, [
            'code' => $plan->code,
            'item_id' => $item->id,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Procedimiento eliminado correctamente.',
        ]);

        return back();
    }

    public function updateItemProgress(
        UpdateTreatmentPlanItemProgressRequest $request,
        TreatmentPlan $plan,
        TreatmentPlanItem $item,
    ): RedirectResponse {
        $this->assertItemBelongsToPlan($plan, $item);

        $validated = $request->validated();
        $item = $this->plans->updateItemProgress(
            $plan,
            $item,
            TreatmentItemStatus::from((string) $validated['status']),
            (int) $validated['sessions_done'],
        );

        $this->audit->log('Avance de procedimiento actualizado', $item, [
            'plan_code' => $plan->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Avance actualizado correctamente.',
        ]);

        return back();
    }

    public function updateStatus(Request $request, TreatmentPlan $plan): RedirectResponse
    {
        Gate::authorize('manageStatus', $plan);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(TreatmentPlanStatus::class)],
        ]);

        $status = TreatmentPlanStatus::from((string) $validated['status']);
        $this->plans->changeStatus($plan, $status);

        $this->audit->log('Estado del plan actualizado', $plan, [
            'code' => $plan->code,
            'status' => $status->value,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Estado del plan actualizado correctamente.',
        ]);

        return back();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareData(array $data, User $user): array
    {
        $doctorId = (int) $data['doctor_id'];

        if (! empty($data['consultation_id'])) {
            $consultation = Consultation::query()->findOrFail((int) $data['consultation_id']);

            if ($consultation->patient_id !== (int) $data['patient_id']) {
                throw ValidationException::withMessages([
                    'consultation_id' => 'La consulta seleccionada pertenece a otro paciente.',
                ]);
            }

            $doctorId = $consultation->doctor_id;
        }

        if ($user->hasRole('doctor')) {
            $ownDoctorId = $this->doctorIdFor($user);

            if ($ownDoctorId === null || $ownDoctorId !== $doctorId) {
                throw ValidationException::withMessages([
                    'doctor_id' => 'Solo puedes gestionar planes propios.',
                ]);
            }

            $doctorId = $ownDoctorId;
        }

        $data['doctor_id'] = $doctorId;

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'patients' => Patient::query()
                ->where('active', true)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get(['id', 'code', 'first_name', 'last_name', 'ci', 'phone']),
            'doctors' => $this->doctorOptions(),
            'consultations' => Consultation::query()
                ->with(['patient:id,first_name,last_name,code'])
                ->latest('consulted_at')
                ->limit(200)
                ->get(['id', 'code', 'patient_id', 'doctor_id', 'consulted_at', 'status']),
        ];
    }

    /**
     * @return Collection<int, Doctor>
     */
    private function doctorOptions(): Collection
    {
        return Doctor::query()
            ->with(['user:id,name', 'specialty:id,name'])
            ->where('active', true)
            ->orderBy('id')
            ->get();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function transitions(TreatmentPlan $plan): array
    {
        return match ($plan->currentStatus()) {
            TreatmentPlanStatus::Borrador => [
                ['value' => TreatmentPlanStatus::Aprobado->value, 'label' => 'Aprobar plan'],
                ['value' => TreatmentPlanStatus::Cancelado->value, 'label' => 'Cancelar plan'],
            ],
            TreatmentPlanStatus::Aprobado => [
                ['value' => TreatmentPlanStatus::EnProgreso->value, 'label' => 'Iniciar tratamiento'],
                ['value' => TreatmentPlanStatus::Cancelado->value, 'label' => 'Cancelar plan'],
            ],
            TreatmentPlanStatus::EnProgreso => [
                ['value' => TreatmentPlanStatus::Completado->value, 'label' => 'Marcar como completado'],
                ['value' => TreatmentPlanStatus::Cancelado->value, 'label' => 'Cancelar plan'],
            ],
            TreatmentPlanStatus::Completado, TreatmentPlanStatus::Cancelado => [],
        };
    }

    private function assertItemBelongsToPlan(TreatmentPlan $plan, TreatmentPlanItem $item): void
    {
        abort_unless($item->treatment_plan_id === $plan->id, 404);
    }

    private function doctorIdFor(User $user): ?int
    {
        $doctorId = $user->doctor()->value('id');

        return is_numeric($doctorId) ? (int) $doctorId : null;
    }

    private function currentUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 401);

        return $user;
    }
}
