<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\User;
use App\Services\AuditLogger;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MenuItemController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): Response
    {
        $this->authorizeManage();

        $items = MenuItem::query()
            ->with('parent')
            ->orderBy('sort_order')
            ->orderBy('label')
            ->get();

        $routeNames = [];

        foreach (Route::getRoutes()->getRoutes() as $route) {
            $name = $route->getName();

            if ($name !== null) {
                $routeNames[] = $name;
            }
        }

        $routeNames = array_values(array_unique($routeNames));
        sort($routeNames);

        return Inertia::render('admin/menu/index', [
            'items' => $this->flatten($items),
            'parentOptions' => $this->parentOptions($items),
            'permissions' => Permissions::all(),
            'routeNames' => $routeNames,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage();

        $validated = $this->validated($request);
        $item = MenuItem::query()->create($validated);

        $this->audit->log('Elemento de menú creado', $item, ['label' => $item->label]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Elemento de menú creado correctamente.',
        ]);

        return back();
    }

    public function update(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $this->authorizeManage();

        $validated = $this->validated($request, $menuItem);

        if (isset($validated['parent_id'])) {
            $parentId = (int) $validated['parent_id'];

            if ($parentId === $menuItem->id || in_array($parentId, $this->descendantIds($menuItem), true)) {
                throw ValidationException::withMessages([
                    'parent_id' => 'No puedes mover un elemento dentro de sí mismo.',
                ]);
            }
        }

        $menuItem->update($validated);

        $this->audit->log('Elemento de menú actualizado', $menuItem, ['label' => $menuItem->label]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Elemento de menú actualizado correctamente.',
        ]);

        return back();
    }

    public function toggleStatus(Request $request, MenuItem $menuItem): RedirectResponse
    {
        $this->authorizeManage();

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $menuItem->forceFill(['active' => $validated['active']])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $menuItem->active
                ? 'Elemento de menú activado correctamente.'
                : 'Elemento de menú desactivado correctamente.',
        ]);

        return back();
    }

    public function destroy(MenuItem $menuItem): RedirectResponse
    {
        $this->authorizeManage();

        if ($menuItem->children()->exists()) {
            throw ValidationException::withMessages([
                'item' => 'Elimina primero los elementos hijos.',
            ]);
        }

        $label = $menuItem->label;
        $menuItem->delete();

        $this->audit->log('Elemento de menú eliminado', $menuItem, ['label' => $label]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Elemento de menú eliminado correctamente.',
        ]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?MenuItem $item = null): array
    {
        return $request->validate([
            'parent_id' => ['nullable', 'integer', 'exists:menu_items,id'],
            'label' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:60'],
            'route_name' => ['nullable', 'string', 'max:255', function (string $attribute, mixed $value, \Closure $fail): void {
                if ($value !== null && $value !== '' && ! Route::has((string) $value)) {
                    $fail('La ruta seleccionada no existe.');
                }
            }],
            'url' => ['nullable', 'string', 'max:255'],
            'permission_name' => ['nullable', 'string', Rule::in(Permissions::all())],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'active' => ['boolean'],
        ]) + ['active' => $request->boolean('active', true)];
    }

    /**
     * @param  Collection<int, MenuItem>  $items
     * @return array<int, array<string, mixed>>
     */
    private function flatten($items, ?int $parentId = null, int $depth = 0): array
    {
        $result = [];

        foreach ($items->where('parent_id', $parentId)->sortBy('sort_order') as $item) {
            $result[] = [
                ...$item->toArray(),
                'depth' => $depth,
            ];
            $result = [...$result, ...$this->flatten($items, $item->id, $depth + 1)];
        }

        return $result;
    }

    /**
     * @param  Collection<int, MenuItem>  $items
     * @return array<int, array{id: int, label: string}>
     */
    private function parentOptions($items): array
    {
        return $items
            ->map(fn (MenuItem $item): array => ['id' => $item->id, 'label' => $item->label])
            ->values()
            ->all();
    }

    /**
     * @return array<int, int>
     */
    private function descendantIds(MenuItem $item): array
    {
        $ids = [];

        foreach ($item->children as $child) {
            $ids[] = $child->id;
            $ids = [...$ids, ...$this->descendantIds($child)];
        }

        return $ids;
    }

    private function authorizeManage(): void
    {
        $user = request()->user();

        abort_unless($user instanceof User && $user->can(Permissions::MENU_MANAGE), 403);
    }
}
