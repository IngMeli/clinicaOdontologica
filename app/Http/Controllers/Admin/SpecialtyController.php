<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Specialty;
use App\Services\AuditLogger;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SpecialtyController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): Response
    {
        Gate::authorize('viewAny', Specialty::class);

        return Inertia::render('admin/specialties/index', [
            'specialties' => Specialty::query()
                ->withCount('doctors')
                ->orderBy('name')
                ->get(),
            'doctors' => Doctor::query()
                ->with(['user', 'specialty'])
                ->orderBy('id')
                ->get(),
            'schedules' => DoctorSchedule::query()
                ->with(['doctor.user', 'doctor.specialty'])
                ->orderBy('weekday')
                ->orderBy('start_time')
                ->get(),
            'weekdays' => $this->weekdays(),
            'canManage' => request()->user()?->can(Permissions::SPECIALTIES_MANAGE) ?? false,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Specialty::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('specialties', 'name')],
            'description' => ['nullable', 'string', 'max:2000'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $specialty = Specialty::query()->create([...$validated, 'active' => true]);

        $this->audit->log('Especialidad creada', $specialty, ['name' => $specialty->name]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Especialidad creada correctamente.',
        ]);

        return back();
    }

    public function update(Request $request, Specialty $specialty): RedirectResponse
    {
        Gate::authorize('update', $specialty);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('specialties', 'name')->ignore($specialty->id),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $specialty->update($validated);

        $this->audit->log('Especialidad actualizada', $specialty, ['name' => $specialty->name]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Especialidad actualizada correctamente.',
        ]);

        return back();
    }

    public function toggleStatus(Request $request, Specialty $specialty): RedirectResponse
    {
        Gate::authorize('update', $specialty);

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $specialty->forceFill(['active' => $validated['active']])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $specialty->active
                ? 'Especialidad activada correctamente.'
                : 'Especialidad desactivada correctamente.',
        ]);

        return back();
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function weekdays(): array
    {
        return [
            ['value' => 1, 'label' => 'Lunes'],
            ['value' => 2, 'label' => 'Martes'],
            ['value' => 3, 'label' => 'Miércoles'],
            ['value' => 4, 'label' => 'Jueves'],
            ['value' => 5, 'label' => 'Viernes'],
            ['value' => 6, 'label' => 'Sábado'],
            ['value' => 7, 'label' => 'Domingo'],
        ];
    }
}
