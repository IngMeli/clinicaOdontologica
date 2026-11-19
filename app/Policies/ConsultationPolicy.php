<?php

namespace App\Policies;

use App\Models\Consultation;
use App\Models\User;
use App\Support\Permissions;

class ConsultationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::CONSULTATIONS_VIEW);
    }

    public function view(User $user, Consultation $consultation): bool
    {
        return $user->can(Permissions::CONSULTATIONS_VIEW) && $this->canAccessDoctorRecord($user, $consultation);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::CONSULTATIONS_CREATE);
    }

    public function update(User $user, Consultation $consultation): bool
    {
        return $user->can(Permissions::CONSULTATIONS_UPDATE) && $this->canAccessDoctorRecord($user, $consultation);
    }

    public function close(User $user, Consultation $consultation): bool
    {
        return $this->update($user, $consultation);
    }

    private function canAccessDoctorRecord(User $user, Consultation $consultation): bool
    {
        if (! $user->hasRole('doctor')) {
            return true;
        }

        return $user->doctor !== null && $consultation->doctor_id === $user->doctor->id;
    }
}
