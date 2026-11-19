<?php

use App\Http\Controllers\Admin\DoctorScheduleController;
use App\Http\Controllers\Admin\MenuItemController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SpecialtyController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientPortalController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentPlanController;
use App\Http\Controllers\PharmacySaleController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\TreatmentPlanController;
use App\Support\Permissions;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('pacientes')->name('patients.')->group(function () {
        Route::get('/', [PatientController::class, 'index'])
            ->middleware('permission:'.Permissions::PATIENTS_VIEW)
            ->name('index');
        Route::get('crear', [PatientController::class, 'create'])
            ->middleware('permission:'.Permissions::PATIENTS_CREATE)
            ->name('create');
        Route::post('/', [PatientController::class, 'store'])
            ->middleware('permission:'.Permissions::PATIENTS_CREATE)
            ->name('store');
        Route::get('{patient}', [PatientController::class, 'show'])
            ->middleware('permission:'.Permissions::PATIENTS_VIEW)
            ->name('show');
        Route::get('{patient}/editar', [PatientController::class, 'edit'])
            ->middleware('permission:'.Permissions::PATIENTS_UPDATE)
            ->name('edit');
        Route::put('{patient}', [PatientController::class, 'update'])
            ->middleware('permission:'.Permissions::PATIENTS_UPDATE)
            ->name('update');
        Route::patch('{patient}/desactivar', [PatientController::class, 'deactivate'])
            ->middleware('permission:'.Permissions::PATIENTS_DELETE)
            ->name('deactivate');
        Route::patch('{patient}/activar', [PatientController::class, 'activate'])
            ->middleware('permission:'.Permissions::PATIENTS_UPDATE)
            ->name('activate');
    });

    Route::prefix('agenda')->name('appointments.')->group(function () {
        Route::get('/', [AppointmentController::class, 'index'])
            ->middleware('permission:'.Permissions::APPOINTMENTS_VIEW)
            ->name('index');
        Route::get('crear', [AppointmentController::class, 'create'])
            ->middleware('permission:'.Permissions::APPOINTMENTS_CREATE)
            ->name('create');
        Route::post('/', [AppointmentController::class, 'store'])
            ->middleware('permission:'.Permissions::APPOINTMENTS_CREATE)
            ->name('store');
        Route::get('{appointment}', [AppointmentController::class, 'show'])
            ->middleware('permission:'.Permissions::APPOINTMENTS_VIEW)
            ->name('show');
        Route::get('{appointment}/editar', [AppointmentController::class, 'edit'])
            ->middleware('permission:'.Permissions::APPOINTMENTS_UPDATE)
            ->name('edit');
        Route::put('{appointment}', [AppointmentController::class, 'update'])
            ->middleware('permission:'.Permissions::APPOINTMENTS_UPDATE)
            ->name('update');
        Route::patch('{appointment}/estado', [AppointmentController::class, 'changeStatus'])
            ->middleware('permission:'.Permissions::APPOINTMENTS_UPDATE)
            ->name('status');
        Route::post('{appointment}/consulta', [AppointmentController::class, 'createConsultation'])
            ->middleware('permission:'.Permissions::CONSULTATIONS_CREATE)
            ->name('consultation');
    });

    Route::prefix('consultas')->name('consultations.')->group(function () {
        Route::get('/', [ConsultationController::class, 'index'])
            ->middleware('permission:'.Permissions::CONSULTATIONS_VIEW)
            ->name('index');
        Route::get('{consultation}', [ConsultationController::class, 'show'])
            ->middleware('permission:'.Permissions::CONSULTATIONS_VIEW)
            ->name('show');
        Route::get('{consultation}/editar', [ConsultationController::class, 'edit'])
            ->middleware('permission:'.Permissions::CONSULTATIONS_UPDATE)
            ->name('edit');
        Route::put('{consultation}', [ConsultationController::class, 'update'])
            ->middleware('permission:'.Permissions::CONSULTATIONS_UPDATE)
            ->name('update');
        Route::patch('{consultation}/cerrar', [ConsultationController::class, 'close'])
            ->middleware('permission:'.Permissions::CONSULTATIONS_UPDATE)
            ->name('close');
        Route::post('{consultation}/odontograma', [ConsultationController::class, 'storeOdontogram'])
            ->middleware('permission:'.Permissions::ODONTOGRAM_MANAGE)
            ->name('odontogram.store');
    });

    Route::prefix('planes-tratamiento')->name('treatment-plans.')->group(function () {
        Route::get('/', [TreatmentPlanController::class, 'index'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_VIEW)
            ->name('index');
        Route::get('crear', [TreatmentPlanController::class, 'create'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('create');
        Route::post('/', [TreatmentPlanController::class, 'store'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('store');
        Route::get('{plan}', [TreatmentPlanController::class, 'show'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_VIEW)
            ->name('show');
        Route::get('{plan}/editar', [TreatmentPlanController::class, 'edit'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('edit');
        Route::put('{plan}', [TreatmentPlanController::class, 'update'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('update');
        Route::patch('{plan}/estado', [TreatmentPlanController::class, 'updateStatus'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('status');
        Route::post('{plan}/items', [TreatmentPlanController::class, 'storeItem'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('items.store');
        Route::put('{plan}/items/{item}', [TreatmentPlanController::class, 'updateItem'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('items.update');
        Route::delete('{plan}/items/{item}', [TreatmentPlanController::class, 'deleteItem'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('items.destroy');
        Route::patch('{plan}/items/{item}/avance', [TreatmentPlanController::class, 'updateItemProgress'])
            ->middleware('permission:'.Permissions::TREATMENT_PLANS_MANAGE)
            ->name('items.progress');
    });

    Route::prefix('tratamientos')->name('treatments.')->group(function () {
        Route::get('/', [TreatmentController::class, 'index'])
            ->middleware('permission:'.Permissions::TREATMENTS_VIEW)
            ->name('index');
        Route::get('crear', [TreatmentController::class, 'create'])
            ->middleware('permission:'.Permissions::TREATMENTS_CREATE)
            ->name('create');
        Route::post('/', [TreatmentController::class, 'store'])
            ->middleware('permission:'.Permissions::TREATMENTS_CREATE)
            ->name('store');
        Route::get('{treatment}/editar', [TreatmentController::class, 'edit'])
            ->middleware('permission:'.Permissions::TREATMENTS_UPDATE)
            ->name('edit');
        Route::put('{treatment}', [TreatmentController::class, 'update'])
            ->middleware('permission:'.Permissions::TREATMENTS_UPDATE)
            ->name('update');
        Route::patch('{treatment}/estado', [TreatmentController::class, 'toggleStatus'])
            ->middleware('permission:'.Permissions::TREATMENTS_UPDATE)
            ->name('status');
    });

    Route::prefix('recetas')->name('prescriptions.')->group(function () {
        Route::get('/', [PrescriptionController::class, 'index'])
            ->middleware('permission:'.Permissions::PRESCRIPTIONS_VIEW)
            ->name('index');
        Route::get('crear', [PrescriptionController::class, 'create'])
            ->middleware('permission:'.Permissions::PRESCRIPTIONS_CREATE)
            ->name('create');
        Route::post('/', [PrescriptionController::class, 'store'])
            ->middleware('permission:'.Permissions::PRESCRIPTIONS_CREATE)
            ->name('store');
        Route::get('{prescription}', [PrescriptionController::class, 'show'])
            ->middleware('permission:'.Permissions::PRESCRIPTIONS_VIEW)
            ->name('show');
        Route::get('{prescription}/imprimir', [PrescriptionController::class, 'print'])
            ->middleware('permission:'.Permissions::PRESCRIPTIONS_VIEW)
            ->name('print');
    });

    Route::prefix('inventario')->name('inventory.')->group(function () {
        Route::get('/', [InventoryController::class, 'index'])
            ->middleware('permission:'.Permissions::INVENTORY_VIEW)
            ->name('index');
        Route::get('crear', [InventoryController::class, 'create'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('create');
        Route::post('/', [InventoryController::class, 'store'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('store');
        Route::get('movimientos', [InventoryController::class, 'movements'])
            ->middleware('permission:'.Permissions::INVENTORY_VIEW)
            ->name('movements');
        Route::get('proveedores', [SupplierController::class, 'index'])
            ->middleware('permission:'.Permissions::INVENTORY_VIEW)
            ->name('suppliers.index');
        Route::post('proveedores', [SupplierController::class, 'store'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('suppliers.store');
        Route::put('proveedores/{supplier}', [SupplierController::class, 'update'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('suppliers.update');
        Route::patch('proveedores/{supplier}/estado', [SupplierController::class, 'toggleStatus'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('suppliers.status');
        Route::get('categorias', [ProductCategoryController::class, 'index'])
            ->middleware('permission:'.Permissions::INVENTORY_VIEW)
            ->name('categories.index');
        Route::post('categorias', [ProductCategoryController::class, 'store'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('categories.store');
        Route::put('categorias/{category}', [ProductCategoryController::class, 'update'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('categories.update');
        Route::delete('categorias/{category}', [ProductCategoryController::class, 'destroy'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('categories.destroy');
        Route::get('{product}/editar', [InventoryController::class, 'edit'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('edit');
        Route::put('{product}', [InventoryController::class, 'update'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('update');
        Route::patch('{product}/estado', [InventoryController::class, 'toggleStatus'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('status');
        Route::get('{product}/ajustar', [InventoryController::class, 'adjustStockForm'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('adjust');
        Route::post('{product}/ajustar', [InventoryController::class, 'adjust'])
            ->middleware('permission:'.Permissions::INVENTORY_MANAGE)
            ->name('adjust.store');
    });

    Route::prefix('pagos/planes')->name('payment-plans.')->group(function () {
        Route::get('/', [PaymentPlanController::class, 'index'])
            ->middleware('permission:'.Permissions::PAYMENTS_VIEW)
            ->name('index');
        Route::get('crear', [PaymentPlanController::class, 'create'])
            ->middleware('permission:'.Permissions::PAYMENTS_CREATE)
            ->name('create');
        Route::post('/', [PaymentPlanController::class, 'store'])
            ->middleware('permission:'.Permissions::PAYMENTS_CREATE)
            ->name('store');
        Route::get('{plan}', [PaymentPlanController::class, 'show'])
            ->middleware('permission:'.Permissions::PAYMENTS_VIEW)
            ->name('show');
        Route::post('{plan}/cuotas/{installment}/pagar', [PaymentPlanController::class, 'payInstallment'])
            ->middleware('permission:'.Permissions::PAYMENTS_CREATE)
            ->name('installments.pay');
        Route::patch('{plan}/estado', [PaymentPlanController::class, 'updateStatus'])
            ->middleware('permission:'.Permissions::PAYMENTS_MANAGE)
            ->name('status');
    });

    Route::prefix('pagos')->name('payments.')->group(function () {
        Route::get('/', [PaymentController::class, 'index'])
            ->middleware('permission:'.Permissions::PAYMENTS_VIEW)
            ->name('index');
        Route::get('crear', [PaymentController::class, 'create'])
            ->middleware('permission:'.Permissions::PAYMENTS_CREATE)
            ->name('create');
        Route::post('/', [PaymentController::class, 'store'])
            ->middleware('permission:'.Permissions::PAYMENTS_CREATE)
            ->name('store');
        Route::get('{payment}', [PaymentController::class, 'show'])
            ->middleware('permission:'.Permissions::PAYMENTS_VIEW)
            ->name('show');
        Route::patch('{payment}/estado', [PaymentController::class, 'updateStatus'])
            ->middleware('permission:'.Permissions::PAYMENTS_MANAGE)
            ->name('status');
    });

    Route::prefix('ventas-farmacia')->name('pharmacy-sales.')->group(function () {
        Route::get('/', [PharmacySaleController::class, 'index'])
            ->middleware('permission:'.Permissions::PAYMENTS_VIEW)
            ->name('index');
        Route::get('crear', [PharmacySaleController::class, 'create'])
            ->middleware('permission:'.Permissions::PAYMENTS_CREATE)
            ->name('create');
        Route::post('/', [PharmacySaleController::class, 'store'])
            ->middleware('permission:'.Permissions::PAYMENTS_CREATE)
            ->name('store');
        Route::get('{sale}', [PharmacySaleController::class, 'show'])
            ->middleware('permission:'.Permissions::PAYMENTS_VIEW)
            ->name('show');
        Route::get('{sale}/imprimir', [PharmacySaleController::class, 'print'])
            ->middleware('permission:'.Permissions::PAYMENTS_VIEW)
            ->name('print');
        Route::patch('{sale}/anular', [PharmacySaleController::class, 'cancel'])
            ->middleware('permission:'.Permissions::PAYMENTS_MANAGE)
            ->name('cancel');
    });

    Route::get('reportes', ReportController::class)
        ->middleware('permission:'.Permissions::REPORTS_VIEW)
        ->name('reports.index');

    Route::get('auditoria', [AuditController::class, 'index'])
        ->middleware('permission:'.Permissions::AUDIT_VIEW)
        ->name('audit.index');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::prefix('usuarios')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])
                ->middleware('permission:'.Permissions::USERS_VIEW)
                ->name('index');
            Route::get('crear', [UserController::class, 'create'])
                ->middleware('permission:'.Permissions::USERS_MANAGE)
                ->name('create');
            Route::post('/', [UserController::class, 'store'])
                ->middleware('permission:'.Permissions::USERS_MANAGE)
                ->name('store');
            Route::get('{user}/editar', [UserController::class, 'edit'])
                ->middleware('permission:'.Permissions::USERS_MANAGE)
                ->name('edit');
            Route::put('{user}', [UserController::class, 'update'])
                ->middleware('permission:'.Permissions::USERS_MANAGE)
                ->name('update');
            Route::patch('{user}/estado', [UserController::class, 'toggleStatus'])
                ->middleware('permission:'.Permissions::USERS_MANAGE)
                ->name('status');
        });

        Route::get('roles', [RoleController::class, 'index'])
            ->middleware('permission:'.Permissions::ROLES_VIEW)
            ->name('roles.index');
        Route::put('roles/{role}', [RoleController::class, 'update'])
            ->middleware('permission:'.Permissions::ROLES_MANAGE)
            ->name('roles.update');

        Route::get('menu', [MenuItemController::class, 'index'])
            ->middleware('permission:'.Permissions::MENU_MANAGE)
            ->name('menu.index');
        Route::post('menu', [MenuItemController::class, 'store'])
            ->middleware('permission:'.Permissions::MENU_MANAGE)
            ->name('menu.store');
        Route::put('menu/{menuItem}', [MenuItemController::class, 'update'])
            ->middleware('permission:'.Permissions::MENU_MANAGE)
            ->name('menu.update');
        Route::patch('menu/{menuItem}/estado', [MenuItemController::class, 'toggleStatus'])
            ->middleware('permission:'.Permissions::MENU_MANAGE)
            ->name('menu.status');
        Route::delete('menu/{menuItem}', [MenuItemController::class, 'destroy'])
            ->middleware('permission:'.Permissions::MENU_MANAGE)
            ->name('menu.destroy');

        Route::get('especialidades', [SpecialtyController::class, 'index'])
            ->middleware('permission:'.Permissions::SPECIALTIES_VIEW)
            ->name('specialties.index');
        Route::post('especialidades', [SpecialtyController::class, 'store'])
            ->middleware('permission:'.Permissions::SPECIALTIES_MANAGE)
            ->name('specialties.store');
        Route::put('especialidades/{specialty}', [SpecialtyController::class, 'update'])
            ->middleware('permission:'.Permissions::SPECIALTIES_MANAGE)
            ->name('specialties.update');
        Route::patch('especialidades/{specialty}/estado', [SpecialtyController::class, 'toggleStatus'])
            ->middleware('permission:'.Permissions::SPECIALTIES_MANAGE)
            ->name('specialties.status');
        Route::post('especialidades/horarios', [DoctorScheduleController::class, 'store'])
            ->middleware('permission:'.Permissions::SPECIALTIES_MANAGE)
            ->name('specialties.schedules.store');
        Route::put('especialidades/horarios/{schedule}', [DoctorScheduleController::class, 'update'])
            ->middleware('permission:'.Permissions::SPECIALTIES_MANAGE)
            ->name('specialties.schedules.update');
        Route::patch('especialidades/horarios/{schedule}/estado', [DoctorScheduleController::class, 'toggleStatus'])
            ->middleware('permission:'.Permissions::SPECIALTIES_MANAGE)
            ->name('specialties.schedules.status');
        Route::delete('especialidades/horarios/{schedule}', [DoctorScheduleController::class, 'destroy'])
            ->middleware('permission:'.Permissions::SPECIALTIES_MANAGE)
            ->name('specialties.schedules.destroy');
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
