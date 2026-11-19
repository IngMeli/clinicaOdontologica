<?php

namespace App\Http\Controllers;

use App\Http\Requests\Pharmacy\StorePharmacySaleRequest;
use App\Models\Patient;
use App\Models\PharmacySale;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\PharmacySaleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PharmacySaleController extends Controller
{
    public function __construct(
        private readonly PharmacySaleService $sales,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', PharmacySale::class);

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $status = $request->string('status')->toString();

        $sales = PharmacySale::query()
            ->with(['patient', 'seller', 'items.product'])
            ->withCount('items')
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(sale_number) like ?', [$like])
                    ->orWhereHas('patient', fn ($patient) => $patient
                        ->whereRaw('lower(first_name) like ?', [$like])
                        ->orWhereRaw('lower(last_name) like ?', [$like])
                        ->orWhereRaw('lower(code) like ?', [$like])),
            ))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest('sold_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('pharmacy-sales/index', [
            'sales' => $sales,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'metrics' => [
                'today_count' => PharmacySale::query()
                    ->whereDate('sold_at', today())
                    ->where('status', 'completada')
                    ->count(),
                'today_total' => (float) PharmacySale::query()
                    ->whereDate('sold_at', today())
                    ->where('status', 'completada')
                    ->sum('total'),
                'month_total' => (float) PharmacySale::query()
                    ->whereBetween('sold_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->where('status', 'completada')
                    ->sum('total'),
                'low_stock' => Product::query()
                    ->where('active', true)
                    ->whereColumn('stock', '<=', 'min_stock')
                    ->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', PharmacySale::class);

        return Inertia::render('pharmacy-sales/create', [
            'patients' => Patient::query()
                ->where('active', true)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get(['id', 'code', 'first_name', 'last_name']),
            'prescriptions' => Prescription::query()
                ->with(['patient:id,first_name,last_name,code'])
                ->latest('issued_at')
                ->limit(200)
                ->get(['id', 'code', 'patient_id', 'issued_at']),
            'products' => Product::query()
                ->where('active', true)
                ->where('stock', '>', 0)
                ->orderBy('name')
                ->get(['id', 'sku', 'name', 'unit', 'stock', 'sale_price']),
        ]);
    }

    public function store(StorePharmacySaleRequest $request): RedirectResponse
    {
        $sale = $this->sales->create($request->validated(), $this->currentUser($request));

        $this->audit->log('Venta de farmacia registrada', $sale, [
            'sale_number' => $sale->sale_number,
            'total' => $sale->total,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Venta de farmacia registrada correctamente.',
        ]);

        return to_route('pharmacy-sales.show', $sale);
    }

    public function show(PharmacySale $sale): Response
    {
        Gate::authorize('view', $sale);

        return Inertia::render('pharmacy-sales/show', [
            'sale' => $this->salePayload($sale),
            'canCancel' => Gate::allows('cancel', $sale) && $sale->status === 'completada',
        ]);
    }

    public function print(PharmacySale $sale): Response
    {
        Gate::authorize('view', $sale);

        return Inertia::render('pharmacy-sales/print', [
            'sale' => $this->salePayload($sale),
        ]);
    }

    public function cancel(Request $request, PharmacySale $sale): RedirectResponse
    {
        Gate::authorize('cancel', $sale);

        $this->sales->cancel($sale, $this->currentUser($request));

        $this->audit->log('Venta de farmacia anulada', $sale, [
            'sale_number' => $sale->sale_number,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Venta anulada y stock restituido.',
        ]);

        return back();
    }

    private function salePayload(PharmacySale $sale): PharmacySale
    {
        return $sale->load([
            'patient',
            'seller',
            'items.product',
            'items.batch',
            'payments.receipt',
            'receipts',
        ]);
    }

    private function currentUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user;
    }
}
