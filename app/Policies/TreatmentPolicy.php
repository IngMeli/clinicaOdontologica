<?php

namespace App\Policies;

use App\Models\Treatment;
use App\Models\User;
use App\Support\Permissions;

class TreatmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::TREATMENTS_VIEW);
    }

    public function view(User $user, Treatment $treatment): bool
    {
        return $user->can(Permissions::TREATMENTS_VIEW);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::TREATMENTS_CREATE);
    }

    public function update(User $user, Treatment $treatment): bool
    {
        return $user->can(Permissions::TREATMENTS_UPDATE);
    }

    public function delete(User $user, Treatment $treatment): bool
    {
        return $user->can(Permissions::TREATMENTS_DELETE);
    }
}
