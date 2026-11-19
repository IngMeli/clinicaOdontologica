<?php

namespace App\Http\Requests\Treatments;

use App\Models\Treatment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTreatmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $treatment = $this->route('treatment');

        return $treatment instanceof Treatment
            && ($this->user()?->can('update', $treatment) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'duration_minutes' => ['required', 'integer', 'between:5,480'],
        ];
    }
}
