<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, DashboardService $dashboard): Response|RedirectResponse
    {
        if ($request->user()->isPatient()) {
            return redirect()->route('patient.dashboard');
        }

        return Inertia::render('dashboard', [
            'metrics' => $dashboard->metrics(),
            'charts' => $dashboard->charts(),
        ]);
    }
}
