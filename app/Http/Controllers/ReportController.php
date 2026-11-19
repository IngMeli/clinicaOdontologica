<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(Request $request, ReportService $reports): Response
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $from = CarbonImmutable::parse(
            (string) ($validated['from'] ?? now()->startOfMonth()->toDateString()),
        );
        $to = CarbonImmutable::parse(
            (string) ($validated['to'] ?? now()->toDateString()),
        );

        return Inertia::render('reports/index', [
            ...$reports->build($from, $to),
        ]);
    }
}
