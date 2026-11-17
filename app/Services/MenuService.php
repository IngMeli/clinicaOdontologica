<?php

namespace App\Services;

use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;

class MenuService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function forUser(?User $user): array
    {
        if (! $user) {
            return [];
        }

        $items = MenuItem::query()
            ->active()
            ->roots()
            ->with(['children' => fn ($query) => $query->where('active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return $this->filter($items, $user);
    }

    /**
     * @param  Collection<int, MenuItem>  $items
     * @return array<int, array<string, mixed>>
     */
    private function filter(Collection $items, User $user): array
    {
        $result = [];

        foreach ($items as $item) {
            if ($item->permission_name && ! $user->can($item->permission_name)) {
                continue;
            }

            $children = $this->filter($item->children, $user);

            if (! $item->route_name && ! $item->url && $children === []) {
                continue;
            }

            $result[] = [
                'id' => $item->id,
                'label' => $item->label,
                'icon' => $item->icon,
                'routeName' => $item->route_name,
                'url' => $this->resolveUrl($item),
                'permission' => $item->permission_name,
                'children' => $children,
            ];
        }

        return $result;
    }

    private function resolveUrl(MenuItem $item): ?string
    {
        if ($item->route_name && Route::has($item->route_name)) {
            return route($item->route_name);
        }

        return $item->url;
    }
}
