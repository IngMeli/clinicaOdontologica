<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\User;
use App\Services\AuditLogger;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): Response
    {
        $this->authorizeView($request);

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';

        return Inertia::render('inventory/suppliers', [
            'suppliers' => Supplier::query()
                ->withCount('purchases')
                ->when($search !== '', fn ($query) => $query->where(
                    fn ($query) => $query
                        ->whereRaw('lower(name) like ?', [$like])
                        ->orWhereRaw('lower(tax_id) like ?', [$like])
                        ->orWhereRaw('lower(contact_name) like ?', [$like]),
                ))
                ->orderBy('name')
                ->paginate(20)
                ->withQueryString(),
            'filters' => ['search' => $search],
            'canManage' => $this->canManage($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:30'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $supplier = Supplier::query()->create([...$validated, 'active' => true]);

        $this->audit->log('Proveedor registrado', $supplier, ['name' => $supplier->name]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Proveedor registrado correctamente.',
        ]);

        return back();
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorizeManage($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:30'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $supplier->update($validated);

        $this->audit->log('Proveedor actualizado', $supplier, ['name' => $supplier->name]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Proveedor actualizado correctamente.',
        ]);

        return back();
    }

    public function toggleStatus(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorizeManage($request);

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $supplier->forceFill(['active' => $validated['active']])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $supplier->active
                ? 'Proveedor activado correctamente.'
                : 'Proveedor desactivado correctamente.',
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
