<?php

namespace App\Policies;

use App\Models\TreatmentPlan;
use App\Models\User;
use App\Support\Permissions;

class TreatmentPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::TREATMENT_PLANS_VIEW);
    }

    public function view(User $user, TreatmentPlan $plan): bool
    {
        return $user->can(Permissions::TREATMENT_PLANS_VIEW) && $this->canAccessDoctorRecord($user, $plan);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::TREATMENT_PLANS_CREATE);
    }

    public function update(User $user, TreatmentPlan $plan): bool
    {
        return $user->can(Permissions::TREATMENT_PLANS_MANAGE) && $this->canAccessDoctorRecord($user, $plan);
    }

    public function manageStatus(User $user, TreatmentPlan $plan): bool
    {
        return $this->update($user, $plan);
    }

    public function delete(User $user, TreatmentPlan $plan): bool
    {
        return $this->update($user, $plan);
    }

    private function canAccessDoctorRecord(User $user, TreatmentPlan $plan): bool
    {
        if (! $user->hasRole('doctor')) {
            return true;
        }

        return $user->doctor !== null && $plan->doctor_id === $user->doctor->id;
    }
}
