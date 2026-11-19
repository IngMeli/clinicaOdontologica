<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoleName;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialty;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\DocumentNumberService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(
        private readonly DocumentNumberService $documents,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = trim($request->string('search')->toString());
        $like = '%'.mb_strtolower($search).'%';
        $role = $request->string('role')->toString();
        $active = $request->string('active')->toString();

        $users = User::query()
            ->with(['roles', 'doctor.specialty', 'patient'])
            ->when($search !== '', fn ($query) => $query->where(
                fn ($query) => $query
                    ->whereRaw('lower(name) like ?', [$like])
                    ->orWhereRaw('lower(email) like ?', [$like])
                    ->orWhereRaw('lower(phone) like ?', [$like]),
            ))
            ->when($role !== '', fn ($query) => $query->whereHas(
                'roles',
                fn ($roles) => $roles->where('name', $role),
            ))
            ->when(in_array($active, ['0', '1'], true), fn ($query) => $query->where('active', $active === '1'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $this->roleOptions(),
            'filters' => [
                'search' => $search,
                'role' => $role,
                'active' => $active,
            ],
            'canManage' => $request->user()?->can(Permissions::USERS_MANAGE) ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('admin/users/create', [
            ...$this->formOptions(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated): User {
            $user = User::query()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => $validated['password'],
                'active' => true,
                'email_verified_at' => now(),
            ]);

            $user->syncRoles($validated['roles']);
            $this->syncProfiles($user, $validated);

            return $user;
        });

        $this->audit->log('Usuario creado', $user, [
            'email' => $user->email,
            'roles' => $validated['roles'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Usuario creado correctamente.',
        ]);

        return to_route('admin.users.index');
    }

    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('admin/users/edit', [
            'user' => $user->load(['roles', 'doctor.specialty', 'patient']),
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $actor = $request->user();

        if ($actor instanceof User && $actor->is($user)) {
            if (! in_array(RoleName::Administrador->value, $validated['roles'], true)) {
                throw ValidationException::withMessages([
                    'roles' => 'No puedes quitarte el rol de administrador.',
                ]);
            }

            if (array_key_exists('active', $validated) && ! $validated['active']) {
                throw ValidationException::withMessages([
                    'active' => 'No puedes desactivar tu propia cuenta.',
                ]);
            }
        }

        DB::transaction(function () use ($user, $validated): void {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'active' => (bool) ($validated['active'] ?? $user->active),
                ...(! empty($validated['password']) ? ['password' => $validated['password']] : []),
            ]);

            $user->syncRoles($validated['roles']);
            $this->syncProfiles($user, $validated);
        });

        $this->audit->log('Usuario actualizado', $user, [
            'email' => $user->email,
            'roles' => $validated['roles'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Usuario actualizado correctamente.',
        ]);

        return to_route('admin.users.index');
    }

    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('deactivate', $user);

        $validated = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $user->forceFill(['active' => $validated['active']])->save();
        $user->doctor?->forceFill(['active' => $validated['active']])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $user->active
                ? 'Usuario activado correctamente.'
                : 'Usuario desactivado correctamente.',
        ]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'roles' => $this->roleOptions(),
            'specialties' => Specialty::query()->where('active', true)->orderBy('name')->get(['id', 'name']),
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function roleOptions(): array
    {
        $labels = [];

        foreach (Role::query()->orderBy('name')->get() as $role) {
            $enum = RoleName::tryFrom($role->name);
            $labels[] = [
                'value' => $role->name,
                'label' => $enum?->label() ?? $role->name,
            ];
        }

        return $labels;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function syncProfiles(User $user, array $data): void
    {
        $roles = is_array($data['roles'] ?? null) ? $data['roles'] : [];
        $isDoctor = in_array(RoleName::Doctor->value, $roles, true);
        $isPatient = in_array(RoleName::Paciente->value, $roles, true);

        if ($isDoctor) {
            Doctor::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'specialty_id' => $data['specialty_id'] ?? null,
                    'license_number' => $data['license_number'] ?? null,
                    'active' => $user->active,
                ],
            );
        } elseif ($user->doctor !== null) {
            $user->doctor->forceFill(['active' => false])->save();
        }

        if ($isPatient && $user->patient === null) {
            $parts = preg_split('/\s+/', trim($user->name)) ?: [$user->name];
            $firstName = (string) array_shift($parts);
            $lastName = $parts !== [] ? implode(' ', $parts) : 'Sin apellido';

            Patient::query()->create([
                'user_id' => $user->id,
                'code' => $this->documents->next(Patient::class, 'code', 'PAC'),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $user->email,
                'phone' => $user->phone,
                'active' => $user->active,
            ]);
        }
    }
}
