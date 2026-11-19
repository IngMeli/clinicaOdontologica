<?php

namespace App\Http\Controllers;

use App\Enums\StockMovementType;
use App\Http\Requests\Inventory\AdjustStockRequest;
use App\Http\Requests\Inventory\StoreProductRequest;
use App\Http\Requests\Inventory\UpdateProductRequest;
use App\Models\Batch;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\StockService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        private readonly StockService $stock,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Product::class);

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $category = $request->integer('category_id');
        $stockFilter = $request->string('stock')->toString();
        $active = $request->string('active')->toString();

        $products = Product::query()
            ->with('category')
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(sku) like ?', [$like])
                    ->orWhereRaw('lower(name) like ?', [$like])
                    ->orWhereRaw('lower(unit) like ?', [$like]),
            ))
            ->when($category > 0, fn ($query) => $query->where('category_id', $category))
            ->when($stockFilter === 'low', fn ($query) => $query->whereColumn('stock', '<=', 'min_stock'))
            ->when($stockFilter === 'out', fn ($query) => $query->where('stock', '<=', 0))
            ->when(in_array($active, ['0', '1'], true), fn ($query) => $query->where('active', $active === '1'))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('inventory/index', [
            'products' => $products,
            'categories' => ProductCategory::query()->orderBy('name')->get(['id', 'name']),
            'metrics' => [
                'products' => Product::query()->where('active', true)->count(),
                'low_stock' => Product::query()
                    ->where('active', true)
                    ->whereColumn('stock', '<=', 'min_stock')
                    ->count(),
                'out_of_stock' => Product::query()->where('active', true)->where('stock', '<=', 0)->count(),
                'stock_value' => (float) Product::query()
                    ->where('active', true)
                    ->sum(\DB::raw('stock * sale_price')),
                'expiring_batches' => Batch::query()
                    ->where('quantity', '>', 0)
                    ->whereNotNull('expiry_date')
                    ->whereBetween('expiry_date', [today(), today()->addDays(90)])
                    ->count(),
            ],
            'filters' => [
                'search' => $search,
                'category_id' => $category ?: null,
                'stock' => $stockFilter,
                'active' => $active,
            ],
            'canManage' => $request->user()?->can(Permissions::INVENTORY_MANAGE) ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Product::class);

        return Inertia::render('inventory/create', [
            ...$this->formOptions(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $actor = $this->currentUser($request);
        $initialStock = (int) ($validated['initial_stock'] ?? 0);

        $product = Product::query()->create([
            'category_id' => $validated['category_id'] ?? null,
            'sku' => $validated['sku'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'unit' => $validated['unit'],
            'min_stock' => (int) $validated['min_stock'],
            'sale_price' => $validated['sale_price'],
            'active' => (bool) ($validated['active'] ?? true),
        ]);

        if ($initialStock > 0) {
            $this->stock->adjust($product, [
                'type' => StockMovementType::Compra->value,
                'quantity' => $initialStock,
                'lot_number' => $validated['initial_lot'] ?? null,
                'expiry_date' => $validated['initial_expiry_date'] ?? null,
                'unit_cost' => $validated['initial_unit_cost'] ?? null,
                'supplier_id' => $validated['initial_supplier_id'] ?? null,
                'reason' => 'Carga inicial',
            ], $actor);
        }

        $this->audit->log('Producto creado', $product, [
            'sku' => $product->sku,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Producto registrado correctamente.',
        ]);

        return to_route('inventory.index');
    }

    public function edit(Product $product): Response
    {
        Gate::authorize('update', $product);

        return Inertia::render('inventory/edit', [
            'product' => $product->load('category'),
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        $this->audit->log('Producto actualizado', $product, [
            'sku' => $product->sku,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Producto actualizado correctamente.',
        ]);

        return to_route('inventory.index');
    }

    public function toggleStatus(Request $request, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $product->forceFill(['active' => $validated['active']])->save();

        $this->audit->log(
            $product->active ? 'Producto activado' : 'Producto desactivado',
            $product,
            ['sku' => $product->sku],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $product->active
                ? 'Producto activado correctamente.'
                : 'Producto desactivado correctamente.',
        ]);

        return back();
    }

    public function adjustStockForm(Product $product): Response
    {
        Gate::authorize('update', $product);

        return Inertia::render('inventory/adjust', [
            'product' => $product->load('category'),
            'batches' => $product->batches()->orderBy('expiry_date')->get(),
            'suppliers' => Supplier::query()->where('active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function adjust(AdjustStockRequest $request, Product $product): RedirectResponse
    {
        $this->stock->adjust($product, $request->validated(), $this->currentUser($request));

        $this->audit->log('Movimiento de inventario registrado', $product, [
            'sku' => $product->sku,
            'type' => $request->string('type')->toString(),
            'quantity' => $request->integer('quantity'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Movimiento de inventario registrado correctamente.',
        ]);

        return to_route('inventory.index');
    }

    public function movements(Request $request): Response
    {
        Gate::authorize('viewAny', Product::class);

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $type = $request->string('type')->toString();

        $movements = StockMovement::query()
            ->with(['product', 'batch', 'creator'])
            ->when($search !== '', fn ($query) => $query->whereHas(
                'product',
                fn ($product) => $product
                    ->whereRaw('lower(name) like ?', [$like])
                    ->orWhereRaw('lower(sku) like ?', [$like]),
            ))
            ->when($type !== '', fn ($query) => $query->where('type', $type))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('inventory/movements', [
            'movements' => $movements,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
            'types' => array_map(
                fn (StockMovementType $case): array => ['value' => $case->value, 'label' => $case->label()],
                StockMovementType::cases(),
            ),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'categories' => ProductCategory::query()->orderBy('name')->get(['id', 'name']),
            'suppliers' => Supplier::query()->where('active', true)->orderBy('name')->get(['id', 'name']),
            'units' => ['unidad', 'caja', 'frasco', 'paquete', 'jeringa', 'tableta', 'tubo'],
        ];
    }

    private function currentUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user;
    }
}
