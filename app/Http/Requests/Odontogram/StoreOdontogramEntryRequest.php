<?php

namespace App\Http\Requests\Odontogram;

use App\Enums\OdontogramCondition;
use App\Enums\ToothSurface;
use App\Models\Consultation;
use App\Models\User;
use App\Support\Permissions;
use App\Support\Teeth;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOdontogramEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $consultation = $this->route('consultation');
        $user = $this->user();

        if (! $consultation instanceof Consultation || ! $user instanceof User) {
            return false;
        }

        return $user->can(Permissions::ODONTOGRAM_MANAGE)
            && $user->can('update', $consultation);
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'tooth' => ['required', 'integer', Rule::in(Teeth::permanent())],
            'surface' => ['nullable', Rule::enum(ToothSurface::class)],
            'condition' => ['required', Rule::enum(OdontogramCondition::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
