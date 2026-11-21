<?php

namespace App\Http\Requests\Prescriptions;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canIssuePrescriptions() ?? false;
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
            'issued_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medication' => ['required', 'string', 'max:150'],
            'items.*.presentation' => ['nullable', 'string', 'max:100'],
            'items.*.dose' => ['nullable', 'string', 'max:100'],
            'items.*.frequency' => ['nullable', 'string', 'max:100'],
            'items.*.duration' => ['nullable', 'string', 'max:100'],
            'items.*.quantity' => ['required', 'integer', 'between:1,999'],
            'items.*.instructions' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
