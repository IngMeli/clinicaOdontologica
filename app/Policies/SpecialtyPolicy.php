<?php

namespace App\Policies;

use App\Models\Specialty;
use App\Models\User;
use App\Support\Permissions;

class SpecialtyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::SPECIALTIES_VIEW);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::SPECIALTIES_MANAGE);
    }

    public function update(User $user, Specialty $specialty): bool
    {
        return $user->can(Permissions::SPECIALTIES_MANAGE);
    }

    public function delete(User $user, Specialty $specialty): bool
    {
        return $user->can(Permissions::SPECIALTIES_MANAGE);
    }
}
