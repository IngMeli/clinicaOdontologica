<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Http\Requests\Payments\StorePaymentRequest;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Payment::class);

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $status = $request->string('status')->toString();
        $type = $request->string('type')->toString();
        $from = $request->string('from')->toString();
        $to = $request->string('to')->toString();

        $payments = Payment::query()
            ->with(['patient', 'method', 'receipt', 'creator'])
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(reference) like ?', [$like])
                    ->orWhereRaw('lower(gateway_reference) like ?', [$like])
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->whereRaw('lower(first_name) like ?', [$like])
                        ->orWhereRaw('lower(last_name) like ?', [$like])
                        ->orWhereRaw('lower(code) like ?', [$like])),
            ))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($type !== '', fn ($query) => $query->where('type', $type))
            ->when($from !== '', fn ($query) => $query->whereDate('created_at', '>=', $from))
            ->when($to !== '', fn ($query) => $query->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $paidBase = Payment::query()->where('status', PaymentStatus::Pagado->value);

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'type' => $type,
                'from' => $from,
                'to' => $to,
            ],
            'metrics' => [
                'income_month' => (float) (clone $paidBase)
                    ->whereBetween('paid_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->sum('amount'),
                'paid_today' => (float) (clone $paidBase)
                    ->whereDate('paid_at', today())
                    ->sum('amount'),
                'pending_amount' => (float) Payment::query()
                    ->where('status', PaymentStatus::Pendiente->value)
                    ->sum('amount'),
                'pending_count' => Payment::query()
                    ->where('status', PaymentStatus::Pendiente->value)
                    ->count(),
            ],
            'types' => array_map(
                fn (PaymentType $case): array => ['value' => $case->value, 'label' => $case->label()],
                PaymentType::cases(),
            ),
            'statuses' => array_map(
                fn (PaymentStatus $case): array => ['value' => $case->value, 'label' => $case->label()],
                PaymentStatus::cases(),
            ),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Payment::class);

        return Inertia::render('payments/create', [
            'patients' => Patient::query()
                ->where('active', true)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get(['id', 'code', 'first_name', 'last_name']),
            'types' => array_map(
                fn (PaymentType $case): array => ['value' => $case->value, 'label' => $case->label()],
                PaymentType::cases(),
            ),
            'statuses' => array_map(
                fn (PaymentStatus $case): array => ['value' => $case->value, 'label' => $case->label()],
                PaymentStatus::cases(),
            ),
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $payment = $this->payments->create($request->validated(), $this->currentUser($request));

        $this->audit->log('Pago registrado', $payment, [
            'reference' => $payment->reference,
            'amount' => $payment->amount,
            'status' => $payment->getRawOriginal('status'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Pago registrado correctamente.',
        ]);

        return to_route('payments.show', $payment);
    }

    public function show(Payment $payment): Response
    {
        Gate::authorize('view', $payment);

        $payment->load(['patient', 'method', 'creator', 'receipt', 'gatewayTransactions']);

        return Inertia::render('payments/show', [
            'payment' => $payment,
            'canManage' => Gate::allows('manage', $payment),
            'statuses' => array_map(
                fn (PaymentStatus $case): array => ['value' => $case->value, 'label' => $case->label()],
                PaymentStatus::cases(),
            ),
        ]);
    }

    public function updateStatus(Request $request, Payment $payment): RedirectResponse
    {
        Gate::authorize('manage', $payment);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(PaymentStatus::class)],
        ]);

        $this->payments->changeStatus(
            $payment,
            PaymentStatus::from((string) $validated['status']),
        );

        $this->audit->log('Estado del pago actualizado', $payment, [
            'reference' => $payment->reference,
            'status' => $validated['status'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Estado del pago actualizado correctamente.',
        ]);

        return back();
    }

    private function currentUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user;
    }
}
