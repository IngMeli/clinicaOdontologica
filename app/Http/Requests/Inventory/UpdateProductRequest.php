<?php

namespace App\Http\Requests\Inventory;

use App\Models\Product;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        $product = $this->route('product');

        return [
            'category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'sku' => [
                'required',
                'string',
                'max:40',
                Rule::unique('products', 'sku')->ignore($product instanceof Product ? $product->id : null),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'unit' => ['required', 'string', 'max:20'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'active' => ['boolean'],
        ];
    }
}
