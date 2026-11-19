import { Head, useForm } from '@inertiajs/react';
import { Loader2, Lock, Save, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { AdminRole } from '@/types';

type Props = {
    roles: AdminRole[];
    permissionGroups: Record<string, string[]>;
    canManage: boolean;
};

const roleLabels: Record<string, string> = {
    administrador: 'Administrador del sistema',
    encargado: 'Encargado',
    doctor: 'Doctor',
    secretaria: 'Secretaria',
    paciente: 'Paciente',
};

const groupLabels: Record<string, string> = {
    dashboard: 'Panel',
    patients: 'Pacientes',
    appointments: 'Agenda',
    consultations: 'Consultas',
    odontogram: 'Odontograma',
    treatments: 'Tratamientos',
    treatment_plans: 'Planes de tratamiento',
    prescriptions: 'Recetas',
    inventory: 'Inventario',
    payments: 'Pagos',
    payment_methods: 'Métodos de pago',
    reports: 'Reportes',
    audit: 'Auditoría',
    users: 'Usuarios',
    roles: 'Roles y permisos',
    menu: 'Menú',
    specialties: 'Especialidades',
    settings: 'Configuración',
    portal: 'Portal del paciente',
};

const actionLabels: Record<string, string> = {
    view: 'Ver',
    create: 'Crear',
    update: 'Editar',
    delete: 'Eliminar',
    manage: 'Gestionar',
    access: 'Acceder',
    history: 'Historial',
    appointments: 'Citas',
    payments: 'Pagos',
    prescriptions: 'Recetas',
};

function permissionLabel(permission: string): string {
    const [, action = permission] = permission.split('.');

    return actionLabels[action] ?? action.replaceAll('_', ' ');
}

export default function AdminRolesIndex({
    roles,
    permissionGroups,
    canManage,
}: Props) {
    return (
        <>
            <Head title="Roles y permisos" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Administración"
                    title="Roles y permisos"
                    description="Matriz de accesos por rol. El rol administrador conserva todos los permisos."
                />

                <div className="grid gap-4 xl:grid-cols-2">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            permissionGroups={permissionGroups}
                            canManage={canManage}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

function RoleCard({
    role,
    permissionGroups,
    canManage,
}: {
    role: AdminRole;
    permissionGroups: Record<string, string[]>;
    canManage: boolean;
}) {
    const locked = role.name === 'administrador';
    const form = useForm({
        permissions: role.permissions.map((permission) => permission.name),
    });

    const togglePermission = (permission: string, checked: boolean) => {
        form.setData(
            'permissions',
            checked
                ? [...new Set([...form.data.permissions, permission])]
                : form.data.permissions.filter((value) => value !== permission),
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/admin/roles/${role.id}`, { preserveScroll: true });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="size-4" />
                            {roleLabels[role.name] ?? role.name}
                        </CardTitle>
                        <CardDescription>
                            {role.users_count ?? 0} usuario(s) con este rol ·{' '}
                            {role.permissions.length} permiso(s)
                        </CardDescription>
                    </div>
                    {locked && (
                        <Badge variant="secondary" className="gap-1">
                            <Lock className="size-3" />
                            Protegido
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-4">
                        {Object.entries(permissionGroups).map(
                            ([group, permissions]) => (
                                <div key={group}>
                                    <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        {groupLabels[group] ?? group}
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {permissions.map((permission) => (
                                            <label
                                                key={permission}
                                                htmlFor={`${role.id}-${permission}`}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Checkbox
                                                    id={`${role.id}-${permission}`}
                                                    checked={form.data.permissions.includes(
                                                        permission,
                                                    )}
                                                    disabled={
                                                        locked || !canManage
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        togglePermission(
                                                            permission,
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                                {permissionLabel(permission)}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>

                    {locked ? (
                        <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                            El rol administrador no se puede modificar desde
                            esta matriz.
                        </p>
                    ) : (
                        canManage && (
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={form.processing}
                                >
                                    {form.processing ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Save className="size-4" />
                                    )}
                                    Guardar permisos
                                </Button>
                            </div>
                        )
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
