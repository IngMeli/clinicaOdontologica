<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\AccessLog;
use App\Models\Appointment;
use App\Models\LoginAttempt;
use App\Models\PageVisitCounter;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Product;
use App\Models\TreatmentPlan;
use App\Models\Visit;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function metrics(): array
    {
        return [
            'patients' => Patient::count(),
            'appointments_today' => Appointment::whereDate('scheduled_at', today())->count(),
            'pending_appointments' => Appointment::whereIn('status', [
                AppointmentStatus::Programada->value,
                AppointmentStatus::Confirmada->value,
            ])->count(),
            'active_treatment_plans' => TreatmentPlan::whereIn('status', ['aprobado', 'en_progreso'])->count(),
            'income_month' => (float) Payment::where('status', 'pagado')
                ->whereBetween('paid_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('amount'),
            'pending_payments' => Payment::where('status', 'pendiente')->count(),
            'low_stock' => Product::whereColumn('stock', '<=', 'min_stock')->count(),
            'visits_today' => Visit::whereDate('created_at', today())->count(),
            'visits_total' => (int) PageVisitCounter::sum('count'),
            'logins_success_today' => LoginAttempt::whereDate('created_at', today())->where('successful', true)->count(),
            'logins_failed_today' => LoginAttempt::whereDate('created_at', today())->where('successful', false)->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function charts(): array
    {
        return [
            'visits' => $this->visitsByDay(),
            'income' => $this->incomeByMonth(),
            'appointments' => $this->appointmentsByStatus(),
            'login_activity' => $this->loginActivity(),
            'top_pages' => PageVisitCounter::query()
                ->orderByDesc('count')
                ->limit(6)
                ->get(['path', 'count'])
                ->map(fn (PageVisitCounter $page) => [
                    'label' => $page->path,
                    'value' => $page->count,
                ])
                ->all(),
            'top_resources' => AccessLog::query()
                ->selectRaw('route_name, COUNT(*) as total')
                ->whereNotNull('route_name')
                ->groupBy('route_name')
                ->orderByDesc('total')
                ->limit(6)
                ->get()
                ->map(fn ($row) => [
                    'label' => $row->route_name,
                    'value' => (int) $row->getAttribute('total'),
                ])
                ->all(),
        ];
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function visitsByDay(): array
    {
        $rows = Visit::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy(fn ($row) => (string) $row->getAttribute('day'));

        $result = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $row = $rows->get($date->toDateString());
            $result[] = [
                'label' => $date->format('d/m'),
                'value' => $row ? (int) $row->getAttribute('total') : 0,
            ];
        }

        return $result;
    }

    /**
     * @return array<int, array{label: string, value: float}>
     */
    private function incomeByMonth(): array
    {
        $rows = Payment::query()
            ->selectRaw("TO_CHAR(paid_at, 'YYYY-MM') as month, SUM(amount) as total")
            ->where('status', 'pagado')
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $result = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $row = $rows->get($date->format('Y-m'));
            $result[] = [
                'label' => $date->translatedFormat('M Y'),
                'value' => $row ? (float) $row->getAttribute('total') : 0,
            ];
        }

        return $result;
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function appointmentsByStatus(): array
    {
        return Appointment::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->map(function ($row) {
                $value = (string) $row->getRawOriginal('status');
                $status = AppointmentStatus::tryFrom($value);

                return [
                    'label' => $status?->label() ?? $value,
                    'value' => (int) $row->getAttribute('total'),
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array{label: string, success: int, failed: int}>
     */
    private function loginActivity(): array
    {
        $rows = LoginAttempt::query()
            ->selectRaw('DATE(created_at) as day, successful, COUNT(*) as total')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy('day', 'successful')
            ->get();

        $result = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $success = (int) $rows->where('day', $date)->where('successful', true)->sum('total');
            $failed = (int) $rows->where('day', $date)->where('successful', false)->sum('total');

            $result[] = [
                'label' => now()->subDays($i)->format('d/m'),
                'success' => $success,
                'failed' => $failed,
            ];
        }

        return $result;
    }
}
