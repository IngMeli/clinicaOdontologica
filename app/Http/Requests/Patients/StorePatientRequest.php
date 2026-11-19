<?php

namespace App\Http\Requests\Patients;

use App\Support\Permissions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(Permissions::PATIENTS_CREATE) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'ci' => ['nullable', 'string', 'max:20', Rule::unique('patients', 'ci')],
            'birth_date' => [
                'nullable',
                'regex:/^\d{4}-\d{2}-\d{2}$/',
                'date_format:Y-m-d',
                'after_or_equal:1900-01-01',
                'before_or_equal:today',
            ],
            'gender' => ['nullable', Rule::in(['Femenino', 'Masculino', 'Otro'])],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'blood_type' => ['nullable', Rule::in(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])],
            'allergies' => ['nullable', 'string', 'max:2000'],
            'medical_notes' => ['nullable', 'string', 'max:5000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'birth_date.regex' => 'La fecha de nacimiento debe tener un año de 4 dígitos (AAAA-MM-DD).',
            'birth_date.date_format' => 'La fecha de nacimiento debe usar el formato AAAA-MM-DD.',
        ];
    }
}
