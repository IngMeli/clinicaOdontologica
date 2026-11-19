<?php

namespace App\Http\Requests\TreatmentPlans;

use App\Models\TreatmentPlan;
use App\Support\Teeth;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTreatmentPlanItemRequest extends FormRequest
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
            'treatment_id' => ['required', Rule::exists('treatments', 'id')->where('active', true)],
            'tooth' => ['nullable', 'integer', Rule::in(Teeth::permanent())],
            'quantity' => ['required', 'integer', 'between:1,99'],
            'unit_price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'sessions_planned' => ['required', 'integer', 'between:1,99'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
