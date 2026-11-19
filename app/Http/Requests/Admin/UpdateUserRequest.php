<?php

namespace App\Http\Requests\Admin;

use App\Enums\RoleName;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->can(Permissions::USERS_MANAGE);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $target = $this->route('user');
        $doctor = $target instanceof User ? $target->doctor : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($target instanceof User ? $target->id : null),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', Password::defaults(), 'confirmed'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', Rule::in(array_map(fn (RoleName $role): string => $role->value, RoleName::cases()))],
            'specialty_id' => ['nullable', 'integer', 'exists:specialties,id'],
            'license_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('doctors', 'license_number')->ignore($doctor?->id),
            ],
            'active' => ['boolean'],
        ];
    }
}
