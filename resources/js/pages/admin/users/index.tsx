import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AdminUser, Option, Paginated } from '@/types';

type Props = {
    users: Paginated<AdminUser>;
    roles: Option[];
    filters: {
        search: string;
        role: string;
        active: string;
    };
    canManage: boolean;
};

const activeOptions = [
    { value: '1', label: 'Solo activos' },
    { value: '0', label: 'Solo inactivos' },
];

export default function AdminUsersIndex({
    users,
    roles,
    filters,
    canManage,
}: Props) {
    const { auth } = usePage().props;
    const currentUserId = auth.user.id;
    const roleLabels = new Map(
        roles.map((role) => [String(role.value), role.label]),
    );

    return (
        <>
            <Head title="Usuarios" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Administración"
                    title="Usuarios"
                    description="Cuentas del personal, roles y acceso al sistema."
                    actions={
                        canManage ? (
                            <Button asChild>
                                <Link href="/admin/usuarios/crear">
                                    <Plus className="size-4" />
                                    Nuevo usuario
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                <form action="/admin/usuarios" method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/admin/usuarios">Limpiar</Link>
                                </Button>
                                <Button type="submit">
                                    <Search className="size-4" />
                                    Buscar
                                </Button>
                            </>
                        }
                    >
                        <div className="min-w-56 flex-1 space-y-1">
                            <label
                                htmlFor="search"
                                className="text-xs text-muted-foreground"
                            >
                                Buscar
                            </label>
                            <Input
                                id="search"
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Nombre, correo o teléfono"
                            />
                        </div>
                        <div className="w-52 space-y-1">
                            <label
                                htmlFor="role"
                                className="text-xs text-muted-foreground"
                            >
                                Rol
                            </label>
                            <EntitySelect
                                id="role"
                                name="role"
                                defaultValue={filters.role}
                                options={roles}
                                placeholder="Todos los roles"
                            />
                        </div>
                        <div className="w-44 space-y-1">
                            <label
                                htmlFor="active"
                                className="text-xs text-muted-foreground"
                            >
                                Estado
                            </label>
                            <EntitySelect
                                id="active"
                                name="active"
                                defaultValue={filters.active}
                                options={activeOptions}
                                placeholder="Todos"
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent>
                        <DataTable
                            rows={users.data}
                            getRowKey={(user) => user.id}
                            emptyMessage="No se encontraron usuarios."
                            columns={[
                                {
                                    key: 'user',
                                    header: 'Usuario',
                                    cell: (user) => (
                                        <div>
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.email}
                                                {user.phone
                                                    ? ` · ${user.phone}`
                                                    : ''}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'roles',
                                    header: 'Roles',
                                    cell: (user) => (
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.length === 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    Sin rol
                                                </span>
                                            )}
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={role.id}
                                                    variant="outline"
                                                >
                                                    {roleLabels.get(
                                                        role.name,
                                                    ) ?? role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'profile',
                                    header: 'Perfil',
                                    cell: (user) => {
                                        if (user.doctor) {
                                            return (
                                                <div className="text-xs">
                                                    <p>
                                                        {user.doctor.specialty
                                                            ?.name ??
                                                            'Sin especialidad'}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        Mat.{' '}
                                                        {user.doctor
                                                            .license_number ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            );
                                        }

                                        if (user.patient) {
                                            return (
                                                <div className="text-xs">
                                                    <p>
                                                        {
                                                            user.patient
                                                                .first_name
                                                        }{' '}
                                                        {user.patient.last_name}
                                                    </p>
                                                    <p className="font-mono text-muted-foreground">
                                                        {user.patient.code}
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <span className="text-xs text-muted-foreground">
                                                —
                                            </span>
                                        );
                                    },
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (user) => (
                                        <StatusBadge
                                            status={
                                                user.active
                                                    ? 'activo'
                                                    : 'inactivo'
                                            }
                                        />
                                    ),
                                },
                                {
                                    key: 'actions',
                                    header: '',
                                    headerClassName: 'text-right',
                                    className: 'text-right',
                                    cell: (user) =>
                                        canManage ? (
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/usuarios/${user.id}/editar`}
                                                        aria-label={`Editar ${user.name}`}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                {user.id !== currentUserId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={
                                                            user.active
                                                                ? 'Desactivar usuario'
                                                                : 'Activar usuario'
                                                        }
                                                        onClick={() =>
                                                            router.patch(
                                                                `/admin/usuarios/${user.id}/estado`,
                                                                {
                                                                    active: !user.active,
                                                                },
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        {user.active ? (
                                                            <ToggleRight className="size-4 text-emerald-600" />
                                                        ) : (
                                                            <ToggleLeft className="size-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        ) : null,
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={users.links}
                                    from={users.from}
                                    to={users.to}
                                    total={users.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
