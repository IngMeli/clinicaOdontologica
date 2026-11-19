<?php

namespace App\Services;

use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\Treatment;
use App\Models\TreatmentPlan;
use App\Models\User;
use App\Support\Permissions;
use Carbon\CarbonImmutable;

class SearchService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function search(User $user, string $term): array
    {
        $term = trim($term);

        if (mb_strlen($term) < 2) {
            return [];
        }

        $like = '%'.$term.'%';
        $results = [];

        if ($user->can(Permissions::PATIENTS_VIEW)) {
            foreach (Patient::query()
                ->where(fn ($query) => $query
                    ->where('first_name', 'ilike', $like)
                    ->orWhere('last_name', 'ilike', $like)
                    ->orWhere('ci', 'ilike', $like)
                    ->orWhere('code', 'ilike', $like))
                ->limit(5)
                ->get() as $patient) {
                $results[] = [
                    'group' => 'Pacientes',
                    'label' => $patient->full_name,
                    'subtitle' => trim(($patient->ci ? 'CI '.$patient->ci : '').' · '.$patient->code),
                    'url' => route('patients.show', $patient),
                    'icon' => 'users',
                ];
            }
        }

        if ($user->can(Permissions::CONSULTATIONS_VIEW)) {
            foreach (Consultation::query()
                ->with('patient')
                ->where(fn ($query) => $query
                    ->where('code', 'ilike', $like)
                    ->orWhere('reason', 'ilike', $like)
                    ->orWhere('diagnosis', 'ilike', $like)
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->where('first_name', 'ilike', $like)
                        ->orWhere('last_name', 'ilike', $like)))
                ->limit(5)
                ->get() as $consultation) {
                $results[] = [
                    'group' => 'Consultas',
                    'label' => $consultation->code.' · '.($consultation->patient->full_name ?? 'Sin paciente'),
                    'subtitle' => 'Consulta del '.CarbonImmutable::parse((string) $consultation->getRawOriginal('consulted_at'))->format('d/m/Y'),
                    'url' => route('consultations.show', $consultation),
                    'icon' => 'clipboard-plus',
                ];
            }
        }

        if ($user->can(Permissions::TREATMENTS_VIEW)) {
            foreach (Treatment::query()
                ->where(fn ($query) => $query
                    ->where('name', 'ilike', $like)
                    ->orWhere('code', 'ilike', $like)
                    ->orWhere('category', 'ilike', $like))
                ->limit(5)
                ->get() as $treatment) {
                $results[] = [
                    'group' => 'Tratamientos',
                    'label' => $treatment->name,
                    'subtitle' => $treatment->code.' · Bs. '.number_format((float) $treatment->price, 2),
                    'url' => route('treatments.index'),
                    'icon' => 'list',
                ];
            }
        }

        if ($user->can(Permissions::TREATMENT_PLANS_VIEW)) {
            foreach (TreatmentPlan::query()
                ->with('patient')
                ->where(fn ($query) => $query
                    ->where('code', 'ilike', $like)
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->where('first_name', 'ilike', $like)
                        ->orWhere('last_name', 'ilike', $like)))
                ->limit(5)
                ->get() as $plan) {
                $results[] = [
                    'group' => 'Planes de tratamiento',
                    'label' => $plan->code.' · '.($plan->patient->full_name ?? 'Sin paciente'),
                    'subtitle' => 'Total Bs. '.number_format((float) $plan->total, 2),
                    'url' => route('treatment-plans.show', $plan),
                    'icon' => 'clipboard-list',
                ];
            }
        }

        if ($user->can(Permissions::PRESCRIPTIONS_VIEW)) {
            foreach (Prescription::query()
                ->with('patient')
                ->where(fn ($query) => $query
                    ->where('code', 'ilike', $like)
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->where('first_name', 'ilike', $like)
                        ->orWhere('last_name', 'ilike', $like))
                    ->orWhereHas('items', fn ($items) => $items->where('medication', 'ilike', $like)))
                ->limit(5)
                ->get() as $prescription) {
                $results[] = [
                    'group' => 'Recetas',
                    'label' => $prescription->code.' · '.($prescription->patient->full_name ?? 'Sin paciente'),
                    'subtitle' => 'Emitida el '.CarbonImmutable::parse((string) $prescription->getRawOriginal('issued_at'))->format('d/m/Y'),
                    'url' => route('prescriptions.show', $prescription),
                    'icon' => 'pill',
                ];
            }
        }

        if ($user->can(Permissions::INVENTORY_VIEW)) {
            foreach (Product::query()
                ->where(fn ($query) => $query
                    ->where('name', 'ilike', $like)
                    ->orWhere('sku', 'ilike', $like))
                ->limit(5)
                ->get() as $product) {
                $results[] = [
                    'group' => 'Inventario',
                    'label' => $product->name,
                    'subtitle' => $product->sku.' · Stock '.$product->stock,
                    'url' => route('inventory.index'),
                    'icon' => 'boxes',
                ];
            }
        }

        if ($user->can(Permissions::PAYMENTS_VIEW)) {
            foreach (Payment::query()
                ->with('patient')
                ->where(fn ($query) => $query
                    ->where('reference', 'ilike', $like)
                    ->orWhere('gateway_reference', 'ilike', $like)
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->where('first_name', 'ilike', $like)
                        ->orWhere('last_name', 'ilike', $like)))
                ->limit(5)
                ->get() as $payment) {
                $results[] = [
                    'group' => 'Pagos',
                    'label' => $payment->reference ?? 'Pago #'.$payment->id,
                    'subtitle' => 'Bs. '.number_format((float) $payment->amount, 2).' · '.$payment->status->label(),
                    'url' => route('payments.index'),
                    'icon' => 'credit-card',
                ];
            }
        }

        return $results;
    }
}
