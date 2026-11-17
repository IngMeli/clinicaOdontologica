<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PaymentPlanInstallment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientPortalController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $patient = $this->patient($request);

        return Inertia::render('portal/dashboard', [
            'patient' => $patient,
            'nextAppointment' => $patient->appointments()
                ->with('doctor.user', 'doctor.specialty')
                ->where('scheduled_at', '>=', now())
                ->orderBy('scheduled_at')
                ->first(),
            'activePlan' => $patient->treatmentPlans()
                ->with('items.treatment', 'doctor.user')
                ->whereIn('status', ['aprobado', 'en_progreso'])
                ->latest()
                ->first(),
            'pendingInstallments' => $this->pendingInstallments($patient),
            'recentPrescriptions' => $patient->prescriptions()
                ->with('doctor.user', 'items')
                ->latest('issued_at')
                ->limit(3)
                ->get(),
        ]);
    }

    public function history(Request $request): Response
    {
        $patient = $this->patient($request);

        return Inertia::render('portal/history', [
            'patient' => $patient,
            'consultations' => $patient->consultations()
                ->with('doctor.user', 'odontogramEntries')
                ->latest('consulted_at')
                ->get(),
            'treatmentPlans' => $patient->treatmentPlans()
                ->with('items.treatment', 'doctor.user')
                ->latest()
                ->get(),
        ]);
    }

    public function appointments(Request $request): Response
    {
        $patient = $this->patient($request);

        return Inertia::render('portal/appointments', [
            'patient' => $patient,
            'appointments' => $patient->appointments()
                ->with('doctor.user', 'doctor.specialty')
                ->orderByDesc('scheduled_at')
                ->get(),
        ]);
    }

    public function payments(Request $request): Response
    {
        $patient = $this->patient($request);

        return Inertia::render('portal/payments', [
            'patient' => $patient,
            'paymentPlans' => $patient->paymentPlans()
                ->with('installments')
                ->latest()
                ->get(),
            'payments' => $patient->payments()
                ->with('method', 'receipt')
                ->latest()
                ->get(),
        ]);
    }

    public function prescriptions(Request $request): Response
    {
        $patient = $this->patient($request);

        return Inertia::render('portal/prescriptions', [
            'patient' => $patient,
            'prescriptions' => $patient->prescriptions()
                ->with('doctor.user', 'items')
                ->latest('issued_at')
                ->get(),
        ]);
    }

    private function patient(Request $request): Patient
    {
        $patient = $request->user()?->patient;

        abort_if(! $patient instanceof Patient, 403, 'No tienes un perfil de paciente asociado.');

        return $patient;
    }

    /**
     * @return Collection<int, PaymentPlanInstallment>
     */
    private function pendingInstallments(Patient $patient): Collection
    {
        return PaymentPlanInstallment::query()
            ->with('plan')
            ->where('status', 'pendiente')
            ->whereHas('plan', fn ($query) => $query->where('patient_id', $patient->id))
            ->orderBy('due_date')
            ->get();
    }
}
