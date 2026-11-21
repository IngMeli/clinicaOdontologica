<?php

namespace App\Http\Requests\Payments;

use App\Enums\PaymentMethodType;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
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
            'patient_id' => ['nullable', 'integer', 'exists:patients,id'],
            'payment_method_id' => ['nullable', 'integer', 'exists:payment_methods,id'],
            'payment_method_type' => ['nullable', Rule::enum(PaymentMethodType::class)],
            'type' => ['required', Rule::enum(PaymentType::class)],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['nullable', 'string', 'size:3'],
            'status' => ['required', Rule::enum(PaymentStatus::class)],
            'paid_at' => ['nullable', 'date'],
            'reference' => ['nullable', 'string', 'max:255', Rule::unique('payments', 'reference')],
            'gateway' => ['nullable', 'string', 'max:40'],
            'gateway_reference' => ['nullable', 'string', 'max:255'],
        ];
    }
}
