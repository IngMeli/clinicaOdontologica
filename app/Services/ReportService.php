<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PaymentPlanInstallment;
use App\Models\PharmacySale;
use App\Models\Product;
use App\Models\TreatmentPlanItem;
use Carbon\CarbonImmutable;

class ReportService
{
    /**
     * @return array<string, mixed>
     */
    public function build(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $start = $from->startOfDay();
        $end = $to->endOfDay();

        $paidQuery = Payment::query()
            ->where('status', PaymentStatus::Pagado->value)
            ->whereBetween('paid_at', [$start, $end]);

        $income = (float) (clone $paidQuery)->sum('amount');
        $paidCount = (clone $paidQuery)->count();
        $appointments = Appointment::query()
            ->whereBetween('scheduled_at', [$start, $end]);

        return [
            'range' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'metrics' => [
                'income' => $income,
                'paid_count' => $paidCount,
                'average_ticket' => $paidCount > 0 ? round($income / $paidCount, 2) : 0,
                'pharmacy_total' => (float) PharmacySale::query()
                    ->where('status', 'completada')
                    ->whereBetween('sold_at', [$start, $end])
                    ->sum('total'),
                'new_patients' => Patient::query()->whereBetween('created_at', [$start, $end])->count(),
                'appointments' => (clone $appointments)->count(),
                'consultations' => Consultation::query()->whereBetween('consulted_at', [$start, $end])->count(),
                'pending_installments' => (float) PaymentPlanInstallment::query()
                    ->where('status', 'pendiente')
                    ->sum('amount'),
                'low_stock' => Product::query()
                    ->where('active', true)
                    ->whereColumn('stock', '<=', 'min_stock')
                    ->count(),
            ],
            'charts' => [
                'income_by_day' => $this->incomeByDay($start, $end),
                'income_by_type' => $this->incomeByType($start, $end),
                'payment_status' => $this->paymentStatus($start, $end),
                'appointments_by_status' => $this->appointmentsByStatus($start, $end),
                'top_treatments' => $this->topTreatments($start, $end),
                'top_products' => $this->topProducts($start, $end),
            ],
        ];
    }

    /**
     * @return array<int, array{label: string, value: float}>
     */
    private function incomeByDay(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Payment::query()
            ->selectRaw('DATE(paid_at) as day, SUM(amount) as total')
            ->where('status', PaymentStatus::Pagado->value)
            ->whereBetween('paid_at', [$start, $end])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row): array => [
                'label' => CarbonImmutable::parse((string) $row->getAttribute('day'))->format('d/m'),
                'value' => (float) $row->getAttribute('total'),
            ])
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: float}>
     */
    private function incomeByType(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Payment::query()
            ->selectRaw('type, SUM(amount) as total')
            ->where('status', PaymentStatus::Pagado->value)
            ->whereBetween('paid_at', [$start, $end])
            ->groupBy('type')
            ->orderByDesc('total')
            ->get()
            ->map(function ($row): array {
                $raw = (string) $row->getRawOriginal('type');
                $type = PaymentType::tryFrom($raw);

                return [
                    'label' => $type?->label() ?? $raw,
                    'value' => (float) $row->getAttribute('total'),
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function paymentStatus(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Payment::query()
            ->selectRaw('status, COUNT(*) as total')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('status')
            ->get()
            ->map(function ($row): array {
                $raw = (string) $row->getRawOriginal('status');
                $status = PaymentStatus::tryFrom($raw);

                return [
                    'label' => $status?->label() ?? $raw,
                    'value' => (int) $row->getAttribute('total'),
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function appointmentsByStatus(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Appointment::query()
            ->selectRaw('status, COUNT(*) as total')
            ->whereBetween('scheduled_at', [$start, $end])
            ->groupBy('status')
            ->get()
            ->map(function ($row): array {
                $raw = (string) $row->getRawOriginal('status');
                $status = AppointmentStatus::tryFrom($raw);

                return [
                    'label' => $status?->label() ?? $raw,
                    'value' => (int) $row->getAttribute('total'),
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: float}>
     */
    private function topTreatments(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return TreatmentPlanItem::query()
            ->join('treatments', 'treatments.id', '=', 'treatment_plan_items.treatment_id')
            ->selectRaw('treatments.name as label, SUM(treatment_plan_items.subtotal) as total')
            ->whereBetween('treatment_plan_items.created_at', [$start, $end])
            ->groupBy('treatments.name')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn ($row): array => [
                'label' => (string) $row->getAttribute('label'),
                'value' => (float) $row->getAttribute('total'),
            ])
            ->all();
    }

    /**
     * @return array<int, array{label: string, value: float}>
     */
    private function topProducts(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return Product::query()
            ->join('pharmacy_sale_items', 'pharmacy_sale_items.product_id', '=', 'products.id')
            ->join('pharmacy_sales', 'pharmacy_sales.id', '=', 'pharmacy_sale_items.pharmacy_sale_id')
            ->selectRaw('products.name as label, SUM(pharmacy_sale_items.subtotal) as total')
            ->where('pharmacy_sales.status', 'completada')
            ->whereBetween('pharmacy_sales.sold_at', [$start, $end])
            ->groupBy('products.name')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn ($row): array => [
                'label' => (string) $row->getAttribute('label'),
                'value' => (float) $row->getAttribute('total'),
            ])
            ->all();
    }
}
