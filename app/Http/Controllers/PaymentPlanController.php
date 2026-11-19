<?php

namespace App\Http\Controllers;

use App\Enums\PaymentPlanStatus;
use App\Http\Requests\Payments\StorePaymentPlanRequest;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentPlan;
use App\Models\PaymentPlanInstallment;
use App\Models\TreatmentPlan;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\PaymentPlanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PaymentPlanController extends Controller
{
    public function __construct(
        private readonly PaymentPlanService $plans,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', PaymentPlan::class);

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $status = $request->string('status')->toString();

        $plans = PaymentPlan::query()
            ->with(['patient', 'treatmentPlan', 'creator'])
            ->withCount([
                'installments',
                'installments as pending_installments_count' => fn ($query) => $query->where('status', 'pendiente'),
            ])
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(concept) like ?', [$like])
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->whereRaw('lower(first_name) like ?', [$like])
                        ->orWhereRaw('lower(last_name) like ?', [$like])
                        ->orWhereRaw('lower(code) like ?', [$like])),
            ))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('payments/plans/index', [
            'plans' => $plans,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', PaymentPlan::class);

        return Inertia::render('payments/plans/create', [
            'patients' => Patient::query()
                ->where('active', true)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get(['id', 'code', 'first_name', 'last_name']),
            'treatmentPlans' => TreatmentPlan::query()
                ->with(['patient:id,first_name,last_name,code'])
                ->whereIn('status', ['borrador', 'aprobado', 'en_progreso'])
                ->latest()
                ->limit(200)
                ->get(['id', 'code', 'patient_id', 'total', 'status']),
            'selectedPatientId' => $request->integer('patient_id') ?: null,
            'selectedTreatmentPlanId' => $request->integer('treatment_plan_id') ?: null,
        ]);
    }

    public function store(StorePaymentPlanRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (! empty($validated['treatment_plan_id'])) {
            $treatmentPlan = TreatmentPlan::query()->findOrFail((int) $validated['treatment_plan_id']);

            if ($treatmentPlan->patient_id !== (int) $validated['patient_id']) {
                throw ValidationException::withMessages([
                    'treatment_plan_id' => 'El plan de tratamiento pertenece a otro paciente.',
                ]);
            }
        }

        $plan = $this->plans->create($validated, $this->currentUser($request));

        $this->audit->log('Plan de pagos creado', $plan, [
            'concept' => $plan->concept,
            'total' => $plan->total,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Plan de pagos creado correctamente.',
        ]);

        return to_route('payment-plans.show', $plan);
    }

    public function show(PaymentPlan $plan): Response
    {
        Gate::authorize('view', $plan);

        $plan->load([
            'patient',
            'treatmentPlan',
            'creator',
            'installments.payments.receipt',
        ]);

        return Inertia::render('payments/plans/show', [
            'plan' => $plan,
            'canPay' => Gate::allows('create', Payment::class),
            'canManageStatus' => Gate::allows('manageStatus', $plan),
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function payInstallment(
        Request $request,
        PaymentPlan $plan,
        PaymentPlanInstallment $installment,
    ): RedirectResponse {
        Gate::authorize('create', Payment::class);

        if ($installment->payment_plan_id !== $plan->id) {
            abort(404);
        }

        $payment = $this->plans->payInstallment($installment, $this->currentUser($request));

        $this->audit->log('Cuota pagada', $installment, [
            'plan_id' => $plan->id,
            'reference' => $payment->reference,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Cuota registrada como pagada.',
        ]);

        return back();
    }

    public function updateStatus(Request $request, PaymentPlan $plan): RedirectResponse
    {
        Gate::authorize('manageStatus', $plan);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(PaymentPlanStatus::class)],
        ]);

        $this->plans->changeStatus(
            $plan,
            PaymentPlanStatus::from((string) $validated['status']),
        );

        $this->audit->log('Estado del plan de pagos actualizado', $plan, [
            'status' => $validated['status'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Estado del plan de pagos actualizado correctamente.',
        ]);

        return back();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return array_map(
            fn (PaymentPlanStatus $case): array => ['value' => $case->value, 'label' => $case->label()],
            PaymentPlanStatus::cases(),
        );
    }

    private function currentUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user;
    }
}
