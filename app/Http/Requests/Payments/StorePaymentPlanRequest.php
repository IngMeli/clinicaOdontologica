<?php

namespace App\Http\Requests\Payments;

use App\Models\User;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->can(Permissions::PAYMENTS_CREATE);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'treatment_plan_id' => ['nullable', 'integer', 'exists:treatment_plans,id'],
            'concept' => ['required', 'string', 'max:255'],
            'total' => ['required', 'numeric', 'min:0.01'],
            'installments_count' => ['required', 'integer', 'min:1', 'max:60'],
            'frequency' => ['required', Rule::in(['mensual', 'quincenal', 'semanal'])],
            'start_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
