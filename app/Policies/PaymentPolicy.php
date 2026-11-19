<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use App\Support\Permissions;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::PAYMENTS_VIEW);
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->can(Permissions::PAYMENTS_VIEW)) {
            return true;
        }

        return $user->patient !== null && $payment->patient_id === $user->patient->id;
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::PAYMENTS_CREATE);
    }

    public function manage(User $user, Payment $payment): bool
    {
        return $user->can(Permissions::PAYMENTS_MANAGE);
    }

    public function refund(User $user, Payment $payment): bool
    {
        return $user->can(Permissions::PAYMENTS_MANAGE);
    }
}
