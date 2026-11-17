<?php

namespace App\Http\Controllers;

use App\Models\AccessLog;
use App\Models\LoginAttempt;
use App\Models\PageVisitCounter;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('audit/index', [
            'loginAttempts' => LoginAttempt::query()
                ->with('user')
                ->latest('created_at')
                ->limit(30)
                ->get(),
            'recentAccess' => AccessLog::query()
                ->with('user')
                ->latest('created_at')
                ->limit(20)
                ->get(),
            'topResources' => AccessLog::query()
                ->selectRaw('route_name, COUNT(*) as total')
                ->whereNotNull('route_name')
                ->groupBy('route_name')
                ->orderByDesc('total')
                ->limit(10)
                ->get(),
            'topPages' => PageVisitCounter::query()
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
        ]);
    }
}
