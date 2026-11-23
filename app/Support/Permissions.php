<?php

namespace App\Support;

use App\Enums\RoleName;

final class Permissions
{
    public const DASHBOARD_VIEW = 'dashboard.view';

    public const PATIENTS_VIEW = 'patients.view';

    public const PATIENTS_CREATE = 'patients.create';

    public const PATIENTS_UPDATE = 'patients.update';

    public const PATIENTS_DELETE = 'patients.delete';

    public const APPOINTMENTS_VIEW = 'appointments.view';

    public const APPOINTMENTS_CREATE = 'appointments.create';

    public const APPOINTMENTS_UPDATE = 'appointments.update';

    public const APPOINTMENTS_DELETE = 'appointments.delete';

    public const CONSULTATIONS_VIEW = 'consultations.view';

    public const CONSULTATIONS_CREATE = 'consultations.create';

    public const CONSULTATIONS_UPDATE = 'consultations.update';

    public const ODONTOGRAM_VIEW = 'odontogram.view';

    public const ODONTOGRAM_MANAGE = 'odontogram.manage';

    public const TREATMENTS_VIEW = 'treatments.view';

    public const TREATMENTS_CREATE = 'treatments.create';

    public const TREATMENTS_UPDATE = 'treatments.update';

    public const TREATMENTS_DELETE = 'treatments.delete';

    public const TREATMENT_PLANS_VIEW = 'treatment_plans.view';

    public const TREATMENT_PLANS_CREATE = 'treatment_plans.create';

    public const TREATMENT_PLANS_MANAGE = 'treatment_plans.manage';

    public const PRESCRIPTIONS_VIEW = 'prescriptions.view';

    public const PRESCRIPTIONS_CREATE = 'prescriptions.create';

    public const INVENTORY_VIEW = 'inventory.view';

    public const INVENTORY_MANAGE = 'inventory.manage';

    public const PAYMENTS_VIEW = 'payments.view';

    public const PAYMENTS_CREATE = 'payments.create';

    public const PAYMENTS_MANAGE = 'payments.manage';

    public const PAYMENT_METHODS_VIEW = 'payment_methods.view';

    public const PAYMENT_METHODS_MANAGE = 'payment_methods.manage';

    public const PHARMACY_VIEW = 'pharmacy.view';

    public const PHARMACY_CREATE = 'pharmacy.create';

    public const PHARMACY_MANAGE = 'pharmacy.manage';

    public const REPORTS_VIEW = 'reports.view';

    public const AUDIT_VIEW = 'audit.view';

    public const USERS_VIEW = 'users.view';

    public const USERS_MANAGE = 'users.manage';

    public const ROLES_VIEW = 'roles.view';

    public const ROLES_MANAGE = 'roles.manage';

    public const MENU_MANAGE = 'menu.manage';

    public const SPECIALTIES_VIEW = 'specialties.view';

    public const SPECIALTIES_MANAGE = 'specialties.manage';

    public const SETTINGS_MANAGE = 'settings.manage';

    public const PORTAL_ACCESS = 'portal.access';

    public const PORTAL_HISTORY = 'portal.history';

    public const PORTAL_APPOINTMENTS = 'portal.appointments';

    public const PORTAL_PAYMENTS = 'portal.payments';

    public const PORTAL_PRESCRIPTIONS = 'portal.prescriptions';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [
            self::DASHBOARD_VIEW,
            self::PATIENTS_VIEW, self::PATIENTS_CREATE, self::PATIENTS_UPDATE, self::PATIENTS_DELETE,
            self::APPOINTMENTS_VIEW, self::APPOINTMENTS_CREATE, self::APPOINTMENTS_UPDATE, self::APPOINTMENTS_DELETE,
            self::CONSULTATIONS_VIEW, self::CONSULTATIONS_CREATE, self::CONSULTATIONS_UPDATE,
            self::ODONTOGRAM_VIEW, self::ODONTOGRAM_MANAGE,
            self::TREATMENTS_VIEW, self::TREATMENTS_CREATE, self::TREATMENTS_UPDATE, self::TREATMENTS_DELETE,
            self::TREATMENT_PLANS_VIEW, self::TREATMENT_PLANS_CREATE, self::TREATMENT_PLANS_MANAGE,
            self::PRESCRIPTIONS_VIEW, self::PRESCRIPTIONS_CREATE,
            self::INVENTORY_VIEW, self::INVENTORY_MANAGE,
            self::PAYMENTS_VIEW, self::PAYMENTS_CREATE, self::PAYMENTS_MANAGE,
            self::PAYMENT_METHODS_VIEW, self::PAYMENT_METHODS_MANAGE,
            self::PHARMACY_VIEW, self::PHARMACY_CREATE, self::PHARMACY_MANAGE,
            self::REPORTS_VIEW, self::AUDIT_VIEW,
            self::USERS_VIEW, self::USERS_MANAGE, self::ROLES_VIEW, self::ROLES_MANAGE,
            self::MENU_MANAGE, self::SPECIALTIES_VIEW, self::SPECIALTIES_MANAGE, self::SETTINGS_MANAGE,
            self::PORTAL_ACCESS, self::PORTAL_HISTORY, self::PORTAL_APPOINTMENTS,
            self::PORTAL_PAYMENTS, self::PORTAL_PRESCRIPTIONS,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function forRole(RoleName $role): array
    {
        return match ($role) {
            RoleName::Administrador => array_values(array_diff(self::all(), [
                self::PRESCRIPTIONS_CREATE,
                self::TREATMENT_PLANS_CREATE,
                self::TREATMENTS_CREATE,
                self::PHARMACY_CREATE,
            ])),
            RoleName::Encargado => array_values(array_diff(self::all(), [
                self::ROLES_VIEW,
                self::ROLES_MANAGE,
                self::PRESCRIPTIONS_VIEW,
                self::PRESCRIPTIONS_CREATE,
                self::TREATMENT_PLANS_VIEW,
                self::TREATMENT_PLANS_CREATE,
                self::TREATMENT_PLANS_MANAGE,
                self::PHARMACY_VIEW,
                self::PHARMACY_CREATE,
                self::PHARMACY_MANAGE,
            ])),
            RoleName::Doctor => [
                self::DASHBOARD_VIEW,
                self::PATIENTS_VIEW, self::PATIENTS_UPDATE,
                self::APPOINTMENTS_VIEW, self::APPOINTMENTS_CREATE, self::APPOINTMENTS_UPDATE,
                self::CONSULTATIONS_VIEW, self::CONSULTATIONS_CREATE, self::CONSULTATIONS_UPDATE,
                self::ODONTOGRAM_VIEW, self::ODONTOGRAM_MANAGE,
                self::TREATMENTS_VIEW,
                self::TREATMENT_PLANS_VIEW, self::TREATMENT_PLANS_CREATE, self::TREATMENT_PLANS_MANAGE,
                self::PRESCRIPTIONS_VIEW, self::PRESCRIPTIONS_CREATE,
                self::REPORTS_VIEW,
                self::SPECIALTIES_VIEW,
            ],
            RoleName::Secretaria => [
                self::DASHBOARD_VIEW,
                self::PATIENTS_VIEW, self::PATIENTS_CREATE, self::PATIENTS_UPDATE,
                self::APPOINTMENTS_VIEW, self::APPOINTMENTS_CREATE, self::APPOINTMENTS_UPDATE, self::APPOINTMENTS_DELETE,
                self::CONSULTATIONS_VIEW,
                self::TREATMENTS_VIEW,
                self::TREATMENT_PLANS_VIEW,
                self::PRESCRIPTIONS_VIEW,
                self::INVENTORY_VIEW,
                self::PAYMENTS_VIEW, self::PAYMENTS_CREATE,
                self::PAYMENT_METHODS_VIEW, self::PAYMENT_METHODS_MANAGE,
                self::PHARMACY_VIEW, self::PHARMACY_CREATE,
                self::REPORTS_VIEW,
                self::SPECIALTIES_VIEW,
            ],
            RoleName::Paciente => [
                self::PORTAL_ACCESS, self::PORTAL_HISTORY, self::PORTAL_APPOINTMENTS,
                self::PORTAL_PAYMENTS, self::PORTAL_PRESCRIPTIONS,
            ],
        };
    }
}
