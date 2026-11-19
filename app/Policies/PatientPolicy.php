<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;
use App\Support\Permissions;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::PATIENTS_VIEW);
    }

    public function view(User $user, Patient $patient): bool
    {
        return $user->can(Permissions::PATIENTS_VIEW) || $this->ownsPatient($user, $patient);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::PATIENTS_CREATE);
    }

    public function update(User $user, Patient $patient): bool
    {
        return $user->can(Permissions::PATIENTS_UPDATE);
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->can(Permissions::PATIENTS_DELETE);
    }

    public function deactivate(User $user, Patient $patient): bool
    {
        return $user->can(Permissions::PATIENTS_DELETE);
    }

    public function activate(User $user, Patient $patient): bool
    {
        return $user->can(Permissions::PATIENTS_UPDATE);
    }

    public function viewMedicalRecord(User $user, Patient $patient): bool
    {
        return $this->view($user, $patient);
    }

    private function ownsPatient(User $user, Patient $patient): bool
    {
        return $user->patient !== null && $patient->is($user->patient);
    }
}
