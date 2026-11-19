<?php

namespace App\Policies;

use App\Models\PaymentPlan;
use App\Models\User;
use App\Support\Permissions;

class PaymentPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::PAYMENTS_VIEW);
    }

    public function view(User $user, PaymentPlan $plan): bool
    {
        return $user->can(Permissions::PAYMENTS_VIEW);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::PAYMENTS_CREATE);
    }

    public function manageStatus(User $user, PaymentPlan $plan): bool
    {
        return $user->can(Permissions::PAYMENTS_MANAGE);
    }
}
