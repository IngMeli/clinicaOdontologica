<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Enums\PaymentStatus;
use App\Http\Requests\Patients\StorePatientRequest;
use App\Http\Requests\Patients\UpdatePatientRequest;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\TreatmentPlan;
use App\Services\AuditLogger;
use App\Services\DocumentNumberService;
use App\Services\OdontogramService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function __construct(
        private readonly DocumentNumberService $documents,
        private readonly AuditLogger $audit,
        private readonly OdontogramService $odontogram,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Patient::class);

        $search = trim($request->string('search')->toString());
        $active = $request->string('active')->toString();
        $like = '%'.mb_strtolower($search).'%';

        $patients = Patient::query()
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(first_name) like ?', [$like])
                    ->orWhereRaw('lower(last_name) like ?', [$like])
                    ->orWhereRaw('lower(code) like ?', [$like])
                    ->orWhereRaw('lower(ci) like ?', [$like])
                    ->orWhereRaw('lower(phone) like ?', [$like])
                    ->orWhereRaw('lower(email) like ?', [$like]),
            ))
            ->when($active === '1', fn ($query) => $query->where('active', true))
            ->when($active === '0', fn ($query) => $query->where('active', false))
            ->withCount('appointments')
            ->withMax('appointments as last_appointment_at', 'scheduled_at')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'filters' => [
                'search' => $search,
                'active' => $active,
            ],
            'can' => [
                'create' => Gate::allows('create', Patient::class),
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Patient::class);

        return Inertia::render('patients/create');
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $patient = DB::transaction(function () use ($data, $request): Patient {
            return Patient::query()->create([
                ...$data,
                'code' => $this->documents->next(Patient::class, 'code', 'PAC'),
                'active' => true,
                'created_by' => $request->user()?->id,
            ]);
        });

        $this->audit->log('Paciente creado', $patient, [
            'code' => $patient->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Paciente registrado correctamente.',
        ]);

        return to_route('patients.show', $patient);
    }

    public function show(Request $request, Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        $tab = $request->string('tab')->toString();

        $patient->load([
            'appointments' => fn ($query) => $query
                ->with(['doctor.user', 'doctor.specialty'])
                ->orderByDesc('scheduled_at')
                ->limit(20),
            'consultations' => fn ($query) => $query
                ->with('doctor.user')
                ->orderByDesc('consulted_at')
                ->limit(20),
            'treatmentPlans' => fn ($query) => $query
                ->with('doctor.user')
                ->withCount('items')
                ->orderByDesc('created_at')
                ->limit(20),
            'prescriptions' => fn ($query) => $query
                ->with('doctor.user')
                ->withCount('items')
                ->orderByDesc('issued_at')
                ->limit(20),
            'payments' => fn ($query) => $query
                ->with(['method', 'receipt'])
                ->orderByDesc('paid_at')
                ->limit(20),
            'paymentPlans' => fn ($query) => $query
                ->withCount('installments')
                ->orderByDesc('created_at')
                ->limit(10),
        ]);

        $paidTotal = (float) $patient->payments()
            ->where('status', PaymentStatus::Pagado->value)
            ->sum('amount');

        $upcomingAppointments = $patient->appointments()
            ->where('scheduled_at', '>=', now())
            ->whereIn('status', [
                AppointmentStatus::Programada->value,
                AppointmentStatus::Confirmada->value,
            ])
            ->count();

        $canViewOdontogram = $request->user()?->can(Permissions::ODONTOGRAM_VIEW) ?? false;
        $allowedTabs = ['citas', 'consultas', 'planes', 'recetas', 'pagos'];

        if ($canViewOdontogram) {
            $allowedTabs[] = 'odontograma';
        }

        return Inertia::render('patients/show', [
            'patient' => $patient,
            'initialTab' => in_array($tab, $allowedTabs, true)
                ? $tab
                : 'citas',
            'odontogram' => $canViewOdontogram ? $this->odontogram->latest($patient) : [],
            'odontogramHistory' => $canViewOdontogram ? $this->odontogram->history($patient) : [],
            'stats' => [
                'paid_total' => $paidTotal,
                'upcoming_appointments' => $upcomingAppointments,
            ],
            'can' => [
                'update' => Gate::allows('update', $patient),
                'deactivate' => Gate::allows('deactivate', $patient),
                'create_appointment' => Gate::allows('create', Appointment::class),
                'view_odontogram' => $canViewOdontogram,
                'create_treatment_plan' => Gate::allows('create', TreatmentPlan::class),
                'create_prescription' => Gate::allows('create', Prescription::class),
            ],
        ]);
    }

    public function edit(Patient $patient): Response
    {
        Gate::authorize('update', $patient);

        return Inertia::render('patients/edit', [
            'patient' => $patient,
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        $patient->fill($request->validated())->save();

        $this->audit->log('Paciente actualizado', $patient, [
            'code' => $patient->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Paciente actualizado correctamente.',
        ]);

        return to_route('patients.show', $patient);
    }

    public function deactivate(Patient $patient): RedirectResponse
    {
        Gate::authorize('deactivate', $patient);

        $patient->forceFill(['active' => false])->save();

        $this->audit->log('Paciente desactivado', $patient, [
            'code' => $patient->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Paciente desactivado. Su historial se conserva.',
        ]);

        return to_route('patients.show', $patient);
    }

    public function activate(Patient $patient): RedirectResponse
    {
        Gate::authorize('activate', $patient);

        $patient->forceFill(['active' => true])->save();

        $this->audit->log('Paciente reactivado', $patient, [
            'code' => $patient->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Paciente reactivado correctamente.',
        ]);

        return to_route('patients.show', $patient);
    }
}
