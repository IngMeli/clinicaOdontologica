<?php

use App\Http\Controllers\AuditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientPortalController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::inertia('pacientes', 'modules/placeholder', [
        'title' => 'Pacientes',
        'description' => 'Fichas clínicas, datos de contacto y seguimiento de pacientes.',
        'icon' => 'users',
    ])->middleware('permission:'.Permissions::PATIENTS_VIEW)->name('patients.index');

    Route::inertia('agenda', 'modules/placeholder', [
        'title' => 'Agenda de citas',
        'description' => 'Programación, confirmación y seguimiento de citas odontológicas.',
        'icon' => 'calendar-days',
    ])->middleware('permission:'.Permissions::APPOINTMENTS_VIEW)->name('appointments.index');

    Route::inertia('consultas', 'modules/placeholder', [
        'title' => 'Consultas',
        'description' => 'Registro de consultas, diagnósticos y evolución clínica.',
        'icon' => 'clipboard-plus',
    ])->middleware('permission:'.Permissions::CONSULTATIONS_VIEW)->name('consultations.index');

    Route::inertia('planes-tratamiento', 'modules/placeholder', [
        'title' => 'Planes de tratamiento',
        'description' => 'Propuestas, aprobación y avance de tratamientos por paciente.',
        'icon' => 'clipboard-list',
    ])->middleware('permission:'.Permissions::TREATMENT_PLANS_VIEW)->name('treatment-plans.index');

    Route::inertia('tratamientos', 'modules/placeholder', [
        'title' => 'Catálogo de tratamientos',
        'description' => 'Procedimientos, precios y duración estimada.',
        'icon' => 'list',
    ])->middleware('permission:'.Permissions::TREATMENTS_VIEW)->name('treatments.index');

    Route::inertia('recetas', 'modules/placeholder', [
        'title' => 'Recetas',
        'description' => 'Prescripciones emitidas y medicamentos indicados.',
        'icon' => 'pill',
    ])->middleware('permission:'.Permissions::PRESCRIPTIONS_VIEW)->name('prescriptions.index');

    Route::inertia('inventario', 'modules/placeholder', [
        'title' => 'Inventario',
        'description' => 'Productos, lotes, stock mínimo y movimientos de almacén.',
        'icon' => 'boxes',
    ])->middleware('permission:'.Permissions::INVENTORY_VIEW)->name('inventory.index');

    Route::inertia('pagos', 'modules/placeholder', [
        'title' => 'Pagos',
        'description' => 'Pagos únicos, planes de cuotas y conciliación con la pasarela.',
        'icon' => 'credit-card',
    ])->middleware('permission:'.Permissions::PAYMENTS_VIEW)->name('payments.index');

    Route::inertia('ventas-farmacia', 'modules/placeholder', [
        'title' => 'Ventas de farmacia',
        'description' => 'Ventas de productos, dispensaciones y comprobantes.',
        'icon' => 'shopping-cart',
    ])->middleware('permission:'.Permissions::PAYMENTS_VIEW)->name('pharmacy-sales.index');

    Route::inertia('reportes', 'modules/placeholder', [
        'title' => 'Reportes',
        'description' => 'Indicadores de ingresos, productividad y ocupación.',
        'icon' => 'file-text',
    ])->middleware('permission:'.Permissions::REPORTS_VIEW)->name('reports.index');

    Route::get('auditoria', [AuditController::class, 'index'])
        ->middleware('permission:'.Permissions::AUDIT_VIEW)
        ->name('audit.index');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::inertia('usuarios', 'modules/placeholder', [
            'title' => 'Usuarios',
            'description' => 'Alta, roles y estado de las cuentas del personal y pacientes.',
            'icon' => 'user-cog',
        ])->middleware('permission:'.Permissions::USERS_VIEW)->name('users.index');

        Route::inertia('roles', 'modules/placeholder', [
            'title' => 'Roles y permisos',
            'description' => 'Matriz de acceso por rol y permisos del sistema.',
            'icon' => 'key-round',
        ])->middleware('permission:'.Permissions::ROLES_VIEW)->name('roles.index');

        Route::inertia('menu', 'modules/placeholder', [
            'title' => 'Menú dinámico',
            'description' => 'Configuración de la navegación visible según permisos.',
            'icon' => 'menu',
        ])->middleware('permission:'.Permissions::MENU_MANAGE)->name('menu.index');

        Route::inertia('especialidades', 'modules/placeholder', [
            'title' => 'Especialidades y horarios',
            'description' => 'Especialidades odontológicas y disponibilidad de doctores.',
            'icon' => 'calendar-clock',
        ])->middleware('permission:'.Permissions::SPECIALTIES_VIEW)->name('specialties.index');
    });
});

Route::middleware(['auth', 'verified', 'role:paciente'])
    ->prefix('portal')
    ->name('patient.')
    ->group(function () {
        Route::get('/', [PatientPortalController::class, 'dashboard'])->name('dashboard');
        Route::get('historial', [PatientPortalController::class, 'history'])->name('history');
        Route::get('citas', [PatientPortalController::class, 'appointments'])->name('appointments');
        Route::get('pagos', [PatientPortalController::class, 'payments'])->name('payments');
        Route::get('recetas', [PatientPortalController::class, 'prescriptions'])->name('prescriptions');
    });

require __DIR__.'/settings.php';
