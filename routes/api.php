<?php

use App\Http\Controllers\Api\DashboardStatsController;
use App\Http\Controllers\Api\PreferenceController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Middleware\AuditAccess;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('health', fn () => response()->json([
        'status' => 'ok',
        'time' => now()->toIso8601String(),
    ]));

    Route::middleware(['auth:sanctum', AuditAccess::class])->group(function () {
        Route::get('user', fn (Request $request) => $request->user());

        Route::get('search', SearchController::class)->name('api.search');

        Route::get('dashboard/stats', DashboardStatsController::class)
            ->middleware('permission:'.Permissions::DASHBOARD_VIEW)
            ->name('api.dashboard.stats');

        Route::patch('preferences', PreferenceController::class)->name('api.preferences.update');
    });
});
