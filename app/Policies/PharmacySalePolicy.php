<?php

namespace App\Policies;

use App\Models\PharmacySale;
use App\Models\User;
use App\Support\Permissions;

class PharmacySalePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::PHARMACY_VIEW);
    }

    public function view(User $user, PharmacySale $sale): bool
    {
        if ($user->can(Permissions::PHARMACY_VIEW)) {
            return true;
        }

        return $user->patient !== null && $sale->patient_id === $user->patient->id;
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::PHARMACY_CREATE);
    }

    public function cancel(User $user, PharmacySale $sale): bool
    {
        return $user->can(Permissions::PHARMACY_MANAGE);
    }
}
