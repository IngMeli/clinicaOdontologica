<?php

namespace App\Policies;

use App\Models\Prescription;
use App\Models\User;
use App\Support\Permissions;

class PrescriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::PRESCRIPTIONS_VIEW);
    }

    public function view(User $user, Prescription $prescription): bool
    {
        return $user->can(Permissions::PRESCRIPTIONS_VIEW) && $this->canAccessDoctorRecord($user, $prescription);
    }

    public function create(User $user): bool
    {
        return $user->canIssuePrescriptions();
    }

    private function canAccessDoctorRecord(User $user, Prescription $prescription): bool
    {
        if (! $user->hasRole('doctor')) {
            return true;
        }

        return $user->doctor !== null && $prescription->doctor_id === $user->doctor->id;
    }
}
