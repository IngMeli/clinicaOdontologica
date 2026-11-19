<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoctorSchedule;
use App\Models\User;
use App\Services\AuditLogger;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class DoctorScheduleController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage($request);
        $validated = $this->validated($request);
        $this->assertNoOverlap($validated);

        $schedule = DoctorSchedule::query()->create($validated);

        $this->audit->log('Horario de doctor creado', $schedule, [
            'doctor_id' => $schedule->doctor_id,
            'weekday' => $schedule->weekday,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Horario registrado correctamente.',
        ]);

        return back();
    }

    public function update(Request $request, DoctorSchedule $schedule): RedirectResponse
    {
        $this->authorizeManage($request);
        $validated = $this->validated($request);
        $this->assertNoOverlap($validated, $schedule);

        $schedule->update($validated);

        $this->audit->log('Horario de doctor actualizado', $schedule, [
            'doctor_id' => $schedule->doctor_id,
            'weekday' => $schedule->weekday,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Horario actualizado correctamente.',
        ]);

        return back();
    }

    public function toggleStatus(Request $request, DoctorSchedule $schedule): RedirectResponse
    {
        $this->authorizeManage($request);

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $schedule->forceFill(['active' => $validated['active']])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $schedule->active
                ? 'Horario activado correctamente.'
                : 'Horario desactivado correctamente.',
        ]);

        return back();
    }

    public function destroy(Request $request, DoctorSchedule $schedule): RedirectResponse
    {
        $this->authorizeManage($request);

        $schedule->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Horario eliminado correctamente.',
        ]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'weekday' => ['required', 'integer', 'between:1,7'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'slot_minutes' => ['required', 'integer', 'min:5', 'max:240'],
            'room' => ['nullable', 'string', 'max:40'],
            'active' => ['boolean'],
        ]) + ['active' => $request->boolean('active', true)];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertNoOverlap(array $data, ?DoctorSchedule $ignore = null): void
    {
        $overlap = DoctorSchedule::query()
            ->where('doctor_id', (int) $data['doctor_id'])
            ->where('weekday', (int) $data['weekday'])
            ->where('active', true)
            ->when($ignore !== null, fn ($query) => $query->whereKeyNot($ignore->id))
            ->where('start_time', '<', $data['end_time'])
            ->where('end_time', '>', $data['start_time'])
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'start_time' => 'El horario se superpone con otro horario activo del doctor.',
            ]);
        }
    }

    private function authorizeManage(Request $request): void
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->can(Permissions::SPECIALTIES_MANAGE), 403);
    }
}
