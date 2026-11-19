<?php

namespace App\Http\Requests\Inventory;

use App\Models\User;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->can(Permissions::INVENTORY_MANAGE);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['compra', 'ajuste_positivo', 'ajuste_negativo', 'devolucion'])],
            'quantity' => ['required', 'integer', 'min:1'],
            'batch_id' => ['nullable', 'integer', 'exists:batches,id'],
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'lot_number' => ['nullable', 'string', 'max:60'],
            'expiry_date' => ['nullable', 'date'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
