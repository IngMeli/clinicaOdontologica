<?php

namespace App\Policies;

use App\Models\Doctor;
use App\Models\User;
use App\Support\Permissions;

class DoctorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isStaff();
    }

    public function view(User $user, Doctor $doctor): bool
    {
        return $user->isStaff();
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::SPECIALTIES_MANAGE);
    }

    public function update(User $user, Doctor $doctor): bool
    {
        return $user->can(Permissions::SPECIALTIES_MANAGE);
    }

    public function delete(User $user, Doctor $doctor): bool
    {
        return $user->can(Permissions::SPECIALTIES_MANAGE);
    }
}
