<?php

namespace App\Http\Controllers;

use App\Http\Requests\Prescriptions\StorePrescriptionRequest;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\DocumentNumberService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function __construct(
        private readonly DocumentNumberService $documents,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Prescription::class);

        $user = $this->currentUser($request);
        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $doctorFilter = $request->integer('doctor_id');
        $doctorId = $user->hasRole('doctor')
            ? ($this->doctorIdFor($user) ?? 0)
            : ($doctorFilter > 0 ? $doctorFilter : null);

        $prescriptions = Prescription::query()
            ->with(['patient', 'doctor.user', 'doctor.specialty', 'consultation'])
            ->withCount('items')
            ->when($doctorId !== null, fn ($query) => $query->where('doctor_id', $doctorId))
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(code) like ?', [$like])
                    ->orWhereRaw('lower(notes) like ?', [$like])
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->whereRaw('lower(first_name) like ?', [$like])
                        ->orWhereRaw('lower(last_name) like ?', [$like])
                        ->orWhereRaw('lower(code) like ?', [$like]))
                    ->orWhereHas('items', fn ($items) => $items
                        ->whereRaw('lower(medication) like ?', [$like])),
            ))
            ->when($request->filled('date_from'), fn ($query) => $query
                ->whereDate('issued_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query
                ->whereDate('issued_at', '<=', $request->date('date_to')))
            ->latest('issued_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('prescriptions/index', [
            'prescriptions' => $prescriptions,
            'doctors' => $this->doctorOptions(),
            'filters' => [
                'search' => $search,
                'doctor_id' => $doctorId,
                'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(),
            ],
            'isDoctor' => $user->hasRole('doctor'),
            'can' => [
                'create' => Gate::allows('create', Prescription::class),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Prescription::class);
        $user = $this->currentUser($request);

        return Inertia::render('prescriptions/create', [
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
            'selectedPatientId' => $request->integer('patient_id') ?: null,
            'selectedConsultationId' => $request->integer('consultation_id') ?: null,
            'currentDoctorId' => $this->doctorIdFor($user),
            'isDoctor' => $user->hasRole('doctor'),
        ]);
    }

    public function store(StorePrescriptionRequest $request): RedirectResponse
    {
        $user = $this->currentUser($request);
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $data = $this->prepareData($data, $user);

        $prescription = DB::transaction(function () use ($data, $items): Prescription {
            $prescription = Prescription::query()->create([
                ...$data,
                'code' => $this->documents->next(Prescription::class, 'code', 'RX'),
            ]);

            $prescription->items()->createMany($items);

            return $prescription;
        });

        $this->audit->log('Receta emitida', $prescription, [
            'code' => $prescription->code,
            'patient_id' => $prescription->patient_id,
            'items' => count($items),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Receta emitida correctamente.',
        ]);

        return to_route('prescriptions.show', $prescription);
    }

    public function show(Prescription $prescription): Response
    {
        Gate::authorize('view', $prescription);

        return Inertia::render('prescriptions/show', [
            'prescription' => $this->loadPrescription($prescription),
        ]);
    }

    public function print(Prescription $prescription): Response
    {
        Gate::authorize('view', $prescription);

        return Inertia::render('prescriptions/print', [
            'prescription' => $this->loadPrescription($prescription),
        ]);
    }

    private function loadPrescription(Prescription $prescription): Prescription
    {
        return $prescription->load([
            'patient',
            'doctor.user',
            'doctor.specialty',
            'consultation',
            'items',
        ]);
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
                    'doctor_id' => 'Solo puedes emitir recetas propias.',
                ]);
            }

            $doctorId = $ownDoctorId;
        }

        $data['doctor_id'] = $doctorId;

        return $data;
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
