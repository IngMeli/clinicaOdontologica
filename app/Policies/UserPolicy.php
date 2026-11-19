<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::USERS_VIEW);
    }

    public function view(User $user, User $model): bool
    {
        return $user->can(Permissions::USERS_VIEW);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::USERS_MANAGE);
    }

    public function update(User $user, User $model): bool
    {
        return $user->can(Permissions::USERS_MANAGE);
    }

    public function deactivate(User $user, User $model): bool
    {
        return $user->can(Permissions::USERS_MANAGE) && ! $user->is($model);
    }

    public function delete(User $user, User $model): bool
    {
        return false;
    }
}
