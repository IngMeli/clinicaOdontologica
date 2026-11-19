<?php

namespace App\Http\Requests\TreatmentPlans;

use App\Models\TreatmentPlan;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTreatmentPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $plan = $this->route('plan');

        return $plan instanceof TreatmentPlan
            && ($this->user()?->can('update', $plan) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', Rule::exists('patients', 'id')->where('active', true)],
            'doctor_id' => ['required', Rule::exists('doctors', 'id')->where('active', true)],
            'consultation_id' => ['nullable', Rule::exists('consultations', 'id')],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
