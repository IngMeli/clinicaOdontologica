<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoleName;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): Response
    {
        $this->authorizeView($request);

        $allPermissions = Permissions::all();
        $groups = [];

        foreach ($allPermissions as $permission) {
            $group = str_contains($permission, '.') ? explode('.', $permission)[0] : 'general';
            $groups[$group][] = $permission;
        }

        return Inertia::render('admin/roles/index', [
            'roles' => Role::query()
                ->with('permissions:id,name')
                ->withCount('users')
                ->orderBy('name')
                ->get(),
            'permissionGroups' => $groups,
            'canManage' => $this->canManage($request),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->authorizeManage($request);

        if ($role->name === RoleName::Administrador->value) {
            throw ValidationException::withMessages([
                'permissions' => 'El rol Administrador no se puede modificar.',
            ]);
        }

        $validated = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string', Rule::in(Permissions::all())],
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->audit->log('Permisos de rol actualizados', $role, [
            'role' => $role->name,
            'permissions' => $validated['permissions'] ?? [],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Permisos del rol actualizados correctamente.',
        ]);

        return back();
    }

    private function authorizeView(Request $request): void
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->can(Permissions::ROLES_VIEW), 403);
    }

    private function authorizeManage(Request $request): void
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->can(Permissions::ROLES_MANAGE), 403);
    }

    private function canManage(Request $request): bool
    {
        $user = $request->user();

        return $user instanceof User && $user->can(Permissions::ROLES_MANAGE);
    }
}
