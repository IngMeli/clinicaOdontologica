<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;
use App\Support\Permissions;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::APPOINTMENTS_VIEW);
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $user->can(Permissions::APPOINTMENTS_VIEW) && $this->canAccessDoctorRecord($user, $appointment);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::APPOINTMENTS_CREATE);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $user->can(Permissions::APPOINTMENTS_UPDATE) && $this->canAccessDoctorRecord($user, $appointment);
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->can(Permissions::APPOINTMENTS_DELETE);
    }

    public function changeStatus(User $user, Appointment $appointment): bool
    {
        return $this->update($user, $appointment);
    }

    public function createConsultation(User $user, Appointment $appointment): bool
    {
        return $user->can(Permissions::CONSULTATIONS_CREATE) && $this->canAccessDoctorRecord($user, $appointment);
    }

    private function canAccessDoctorRecord(User $user, Appointment $appointment): bool
    {
        if (! $user->hasRole('doctor')) {
            return true;
        }

        return $user->doctor !== null && $appointment->doctor_id === $user->doctor->id;
    }
}
