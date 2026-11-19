<?php

namespace App\Http\Requests\Consultations;

use App\Models\Consultation;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $consultation = $this->route('consultation');

        return $consultation instanceof Consultation
            && ($this->user()?->can('update', $consultation) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'consulted_at' => ['required', 'date'],
            'reason' => ['required', 'string', 'max:2000'],
            'diagnosis' => ['nullable', 'string', 'max:5000'],
            'observations' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
