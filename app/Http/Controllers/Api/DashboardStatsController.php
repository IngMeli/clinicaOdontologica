<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardStatsController extends Controller
{
    public function __invoke(DashboardService $dashboard): JsonResponse
    {
        return response()->json([
            'metrics' => $dashboard->metrics(),
            'charts' => $dashboard->charts(),
        ]);
    }
}
