<?php

namespace App\Policies;

use App\Models\MenuItem;
use App\Models\User;
use App\Support\Permissions;

class MenuItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MENU_MANAGE);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MENU_MANAGE);
    }

    public function update(User $user, MenuItem $item): bool
    {
        return $user->can(Permissions::MENU_MANAGE);
    }

    public function delete(User $user, MenuItem $item): bool
    {
        return $user->can(Permissions::MENU_MANAGE);
    }
}
