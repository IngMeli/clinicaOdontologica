<?php

namespace App\Http\Requests\TreatmentPlans;

use App\Enums\TreatmentItemStatus;
use App\Models\TreatmentPlan;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTreatmentPlanItemProgressRequest extends FormRequest
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
            'status' => ['required', Rule::enum(TreatmentItemStatus::class)],
            'sessions_done' => ['required', 'integer', 'min:0', 'max:99'],
        ];
    }
}
