<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeView($request);

        return Inertia::render('inventory/categories', [
            'categories' => ProductCategory::query()
                ->withCount('products')
                ->orderBy('name')
                ->get(),
            'canManage' => $this->canManage($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('product_categories', 'name')],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        ProductCategory::query()->create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Categoría registrada correctamente.',
        ]);

        return back();
    }

    public function update(Request $request, ProductCategory $category): RedirectResponse
    {
        $this->authorizeManage($request);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_categories', 'name')->ignore($category->id),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $category->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Categoría actualizada correctamente.',
        ]);

        return back();
    }

    public function destroy(Request $request, ProductCategory $category): RedirectResponse
    {
        $this->authorizeManage($request);

        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'No puedes eliminar una categoría con productos asociados.',
            ]);
        }

        $category->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Categoría eliminada correctamente.',
        ]);

        return back();
    }

    private function authorizeView(Request $request): void
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->can(Permissions::INVENTORY_VIEW), 403);
    }

    private function authorizeManage(Request $request): void
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->can(Permissions::INVENTORY_MANAGE), 403);
    }

    private function canManage(Request $request): bool
    {
        $user = $request->user();

        return $user instanceof User && $user->can(Permissions::INVENTORY_MANAGE);
    }
}
