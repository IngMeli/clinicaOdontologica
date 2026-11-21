<?php

namespace App\Http\Requests\Appointments;

use App\Models\Appointment;
use App\Support\Permissions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $appointment = $this->route('appointment');

        return $appointment instanceof Appointment
            && ($this->user()?->can(Permissions::APPOINTMENTS_UPDATE) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', Rule::exists('patients', 'id')->where('active', true)],
            'doctor_id' => ['required', Rule::exists('doctors', 'id')->where('active', true)],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'between:10,240'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
