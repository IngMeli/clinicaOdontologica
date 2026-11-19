<?php

namespace App\Http\Controllers;

use App\Http\Requests\Treatments\StoreTreatmentRequest;
use App\Http\Requests\Treatments\UpdateTreatmentRequest;
use App\Models\Treatment;
use App\Services\AuditLogger;
use App\Services\DocumentNumberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentController extends Controller
{
    public function __construct(
        private readonly DocumentNumberService $documents,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Treatment::class);

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $active = $request->string('active')->toString();
        $category = $request->string('category')->toString();

        $treatments = Treatment::query()
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(code) like ?', [$like])
                    ->orWhereRaw('lower(name) like ?', [$like])
                    ->orWhereRaw('lower(category) like ?', [$like]),
            ))
            ->when(in_array($active, ['0', '1'], true), fn ($query) => $query->where('active', $active === '1'))
            ->when($category !== '', fn ($query) => $query->where('category', $category))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $categories = Treatment::query()
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('treatments/index', [
            'treatments' => $treatments,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'active' => $active,
                'category' => $category,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Treatment::class);

        return Inertia::render('treatments/create', [
            'categories' => Treatment::query()
                ->whereNotNull('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
        ]);
    }

    public function store(StoreTreatmentRequest $request): RedirectResponse
    {
        $treatment = Treatment::query()->create([
            ...$request->validated(),
            'code' => $this->documents->next(Treatment::class, 'code', 'TR'),
            'active' => true,
        ]);

        $this->audit->log('Tratamiento creado', $treatment, [
            'code' => $treatment->code,
            'name' => $treatment->name,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Tratamiento registrado correctamente.',
        ]);

        return to_route('treatments.index');
    }

    public function edit(Treatment $treatment): Response
    {
        Gate::authorize('update', $treatment);

        return Inertia::render('treatments/edit', [
            'treatment' => $treatment,
            'categories' => Treatment::query()
                ->whereNotNull('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
        ]);
    }

    public function update(UpdateTreatmentRequest $request, Treatment $treatment): RedirectResponse
    {
        $treatment->update($request->validated());

        $this->audit->log('Tratamiento actualizado', $treatment, [
            'code' => $treatment->code,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Tratamiento actualizado correctamente.',
        ]);

        return to_route('treatments.index');
    }

    public function toggleStatus(Request $request, Treatment $treatment): RedirectResponse
    {
        Gate::authorize('update', $treatment);

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $treatment->forceFill(['active' => $validated['active']])->save();

        $this->audit->log(
            $treatment->active ? 'Tratamiento activado' : 'Tratamiento desactivado',
            $treatment,
            ['code' => $treatment->code],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $treatment->active
                ? 'Tratamiento activado correctamente.'
                : 'Tratamiento desactivado correctamente.',
        ]);

        return back();
    }
}
