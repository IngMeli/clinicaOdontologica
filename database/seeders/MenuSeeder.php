<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Support\Permissions;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        MenuItem::query()->delete();

        $menu = [
            [
                'label' => 'Panel',
                'icon' => 'layout-dashboard',
                'route_name' => 'dashboard',
                'permission_name' => Permissions::DASHBOARD_VIEW,
                'sort_order' => 10,
            ],
            [
                'label' => 'Clínica',
                'icon' => 'stethoscope',
                'sort_order' => 20,
                'children' => [
                    ['label' => 'Pacientes', 'icon' => 'users', 'route_name' => 'patients.index', 'permission_name' => Permissions::PATIENTS_VIEW],
                    ['label' => 'Agenda', 'icon' => 'calendar-days', 'route_name' => 'appointments.index', 'permission_name' => Permissions::APPOINTMENTS_VIEW],
                    ['label' => 'Consultas', 'icon' => 'clipboard-plus', 'route_name' => 'consultations.index', 'permission_name' => Permissions::CONSULTATIONS_VIEW],
                    ['label' => 'Planes de tratamiento', 'icon' => 'clipboard-list', 'route_name' => 'treatment-plans.index', 'permission_name' => Permissions::TREATMENT_PLANS_VIEW],
                    ['label' => 'Catálogo de tratamientos', 'icon' => 'list', 'route_name' => 'treatments.index', 'permission_name' => Permissions::TREATMENTS_VIEW],
                    ['label' => 'Recetas', 'icon' => 'pill', 'route_name' => 'prescriptions.index', 'permission_name' => Permissions::PRESCRIPTIONS_VIEW],
                ],
            ],
            [
                'label' => 'Operaciones',
                'icon' => 'package',
                'sort_order' => 30,
                'children' => [
                    ['label' => 'Inventario', 'icon' => 'boxes', 'route_name' => 'inventory.index', 'permission_name' => Permissions::INVENTORY_VIEW],
                    ['label' => 'Pagos', 'icon' => 'credit-card', 'route_name' => 'payments.index', 'permission_name' => Permissions::PAYMENTS_VIEW],
                    ['label' => 'Ventas de farmacia', 'icon' => 'shopping-cart', 'route_name' => 'pharmacy-sales.index', 'permission_name' => Permissions::PAYMENTS_VIEW],
                ],
            ],
            [
                'label' => 'Análisis',
                'icon' => 'bar-chart-3',
                'sort_order' => 40,
                'children' => [
                    ['label' => 'Reportes', 'icon' => 'file-text', 'route_name' => 'reports.index', 'permission_name' => Permissions::REPORTS_VIEW],
                    ['label' => 'Auditoría', 'icon' => 'shield-check', 'route_name' => 'audit.index', 'permission_name' => Permissions::AUDIT_VIEW],
                ],
            ],
            [
                'label' => 'Administración',
                'icon' => 'settings',
                'sort_order' => 50,
                'children' => [
                    ['label' => 'Usuarios', 'icon' => 'user-cog', 'route_name' => 'admin.users.index', 'permission_name' => Permissions::USERS_VIEW],
                    ['label' => 'Roles y permisos', 'icon' => 'key-round', 'route_name' => 'admin.roles.index', 'permission_name' => Permissions::ROLES_VIEW],
                    ['label' => 'Menú', 'icon' => 'menu', 'route_name' => 'admin.menu.index', 'permission_name' => Permissions::MENU_MANAGE],
                    ['label' => 'Especialidades y horarios', 'icon' => 'calendar-clock', 'route_name' => 'admin.specialties.index', 'permission_name' => Permissions::SPECIALTIES_VIEW],
                ],
            ],
            [
                'label' => 'Portal del paciente',
                'icon' => 'heart-pulse',
                'permission_name' => Permissions::PORTAL_ACCESS,
                'sort_order' => 60,
                'children' => [
                    ['label' => 'Mi resumen', 'icon' => 'home', 'route_name' => 'patient.dashboard', 'permission_name' => Permissions::PORTAL_ACCESS],
                    ['label' => 'Mi historial', 'icon' => 'history', 'route_name' => 'patient.history', 'permission_name' => Permissions::PORTAL_HISTORY],
                    ['label' => 'Mis citas', 'icon' => 'calendar-check', 'route_name' => 'patient.appointments', 'permission_name' => Permissions::PORTAL_APPOINTMENTS],
                    ['label' => 'Mis pagos', 'icon' => 'wallet', 'route_name' => 'patient.payments', 'permission_name' => Permissions::PORTAL_PAYMENTS],
                    ['label' => 'Mis recetas', 'icon' => 'pill', 'route_name' => 'patient.prescriptions', 'permission_name' => Permissions::PORTAL_PRESCRIPTIONS],
                ],
            ],
        ];

        $this->createItems($menu);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    private function createItems(array $items, ?int $parentId = null): void
    {
        foreach ($items as $index => $item) {
            $created = MenuItem::create([
                'parent_id' => $parentId,
                'label' => $item['label'],
                'icon' => $item['icon'] ?? null,
                'route_name' => $item['route_name'] ?? null,
                'url' => $item['url'] ?? null,
                'permission_name' => $item['permission_name'] ?? null,
                'sort_order' => $item['sort_order'] ?? ($index + 1),
                'active' => true,
            ]);

            if (! empty($item['children'])) {
                $this->createItems($item['children'], $created->id);
            }
        }
    }
}
