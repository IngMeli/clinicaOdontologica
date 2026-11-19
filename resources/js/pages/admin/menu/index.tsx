import { Head, router, useForm } from '@inertiajs/react';
import {
    Loader2,
    Pencil,
    Plus,
    Save,
    ToggleLeft,
    ToggleRight,
    Trash2,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminMenuItem } from '@/types';

type Props = {
    items: AdminMenuItem[];
    parentOptions: Array<{ id: number; label: string }>;
    permissions: string[];
    routeNames: string[];
};

type MenuFormData = {
    parent_id: string;
    label: string;
    icon: string;
    route_name: string;
    url: string;
    permission_name: string;
    sort_order: string;
    active: boolean;
};

const emptyForm: MenuFormData = {
    parent_id: '',
    label: '',
    icon: '',
    route_name: '',
    url: '',
    permission_name: '',
    sort_order: '10',
    active: true,
};

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

export default function AdminMenuIndex({
    items,
    parentOptions,
    permissions,
    routeNames,
}: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <>
            <Head title="Menú dinámico" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Administración"
                    title="Menú dinámico"
                    description="Elementos de navegación, permisos y orden de aparición."
                />

                <CreateMenuItem
                    parentOptions={parentOptions}
                    permissions={permissions}
                    routeNames={routeNames}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Elementos registrados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {items.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No hay elementos de menú registrados.
                            </p>
                        )}
                        {items.map((item) =>
                            editingId === item.id ? (
                                <EditMenuItem
                                    key={item.id}
                                    item={item}
                                    parentOptions={parentOptions}
                                    permissions={permissions}
                                    routeNames={routeNames}
                                    onClose={() => setEditingId(null)}
                                />
                            ) : (
                                <div
                                    key={item.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                                >
                                    <div
                                        className="min-w-0"
                                        style={{
                                            paddingLeft: `${item.depth * 20}px`,
                                        }}
                                    >
                                        <p className="flex items-center gap-2 font-medium">
                                            {item.depth > 0 && (
                                                <span className="text-muted-foreground">
                                                    └
                                                </span>
                                            )}
                                            {item.label}
                                            {item.icon && (
                                                <span className="text-xs text-muted-foreground">
                                                    ({item.icon})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.route_name ??
                                                item.url ??
                                                'Sin destino'}{' '}
                                            · orden {item.sort_order}
                                            {item.permission_name
                                                ? ` · ${item.permission_name}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <StatusBadge
                                            status={
                                                item.active
                                                    ? 'activo'
                                                    : 'inactivo'
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={
                                                item.active
                                                    ? 'Desactivar elemento'
                                                    : 'Activar elemento'
                                            }
                                            onClick={() =>
                                                router.patch(
                                                    `/admin/menu/${item.id}/estado`,
                                                    { active: !item.active },
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            {item.active ? (
                                                <ToggleRight className="size-4 text-emerald-600" />
                                            ) : (
                                                <ToggleLeft className="size-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Editar elemento"
                                            onClick={() =>
                                                setEditingId(item.id)
                                            }
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Eliminar elemento"
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        `¿Eliminar el elemento "${item.label}"?`,
                                                    )
                                                ) {
                                                    router.delete(
                                                        `/admin/menu/${item.id}`,
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }
                                            }}
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ),
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function CreateMenuItem({
    parentOptions,
    permissions,
    routeNames,
}: {
    parentOptions: Props['parentOptions'];
    permissions: string[];
    routeNames: string[];
}) {
    const form = useForm<MenuFormData>({ ...emptyForm });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/admin/menu', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Nuevo elemento
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <MenuFields
                        form={form}
                        parentOptions={parentOptions}
                        permissions={permissions}
                        routeNames={routeNames}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            Registrar elemento
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function EditMenuItem({
    item,
    parentOptions,
    permissions,
    routeNames,
    onClose,
}: {
    item: AdminMenuItem;
    parentOptions: Props['parentOptions'];
    permissions: string[];
    routeNames: string[];
    onClose: () => void;
}) {
    const form = useForm<MenuFormData>({
        parent_id: item.parent_id ? String(item.parent_id) : '',
        label: item.label,
        icon: item.icon ?? '',
        route_name: item.route_name ?? '',
        url: item.url ?? '',
        permission_name: item.permission_name ?? '',
        sort_order: String(item.sort_order),
        active: item.active,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/admin/menu/${item.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-md border border-primary/30 p-3"
        >
            <MenuFields
                form={form}
                parentOptions={parentOptions}
                permissions={permissions}
                routeNames={routeNames}
            />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={form.processing}>
                    Guardar
                </Button>
            </div>
        </form>
    );
}

function MenuFields({
    form,
    parentOptions,
    permissions,
    routeNames,
}: {
    form: ReturnType<typeof useForm<MenuFormData>>;
    parentOptions: Props['parentOptions'];
    permissions: string[];
    routeNames: string[];
}) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
                <Label htmlFor="menu-label">Etiqueta *</Label>
                <Input
                    id="menu-label"
                    value={form.data.label}
                    onChange={(event) =>
                        form.setData('label', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.label)}
                />
                <FieldError message={form.errors.label} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="menu-parent">Padre</Label>
                <EntitySelect
                    id="menu-parent"
                    value={form.data.parent_id}
                    onChange={(event) =>
                        form.setData('parent_id', event.target.value)
                    }
                    options={parentOptions.map((option) => ({
                        value: option.id,
                        label: option.label,
                    }))}
                    placeholder="Sin padre (raíz)"
                />
                <FieldError message={form.errors.parent_id} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="menu-icon">Icono</Label>
                <Input
                    id="menu-icon"
                    value={form.data.icon}
                    onChange={(event) =>
                        form.setData('icon', event.target.value)
                    }
                    placeholder="Ej. users, calendar-days"
                />
                <FieldError message={form.errors.icon} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="menu-route">Ruta nombrada</Label>
                <EntitySelect
                    id="menu-route"
                    value={form.data.route_name}
                    onChange={(event) =>
                        form.setData('route_name', event.target.value)
                    }
                    options={routeNames.map((route) => ({
                        value: route,
                        label: route,
                    }))}
                    placeholder="Sin ruta"
                />
                <FieldError message={form.errors.route_name} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="menu-url">URL manual</Label>
                <Input
                    id="menu-url"
                    value={form.data.url}
                    onChange={(event) =>
                        form.setData('url', event.target.value)
                    }
                    placeholder="/ruta-personalizada"
                />
                <FieldError message={form.errors.url} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="menu-permission">Permiso requerido</Label>
                <EntitySelect
                    id="menu-permission"
                    value={form.data.permission_name}
                    onChange={(event) =>
                        form.setData('permission_name', event.target.value)
                    }
                    options={permissions.map((permission) => ({
                        value: permission,
                        label: permission,
                    }))}
                    placeholder="Sin permiso"
                />
                <FieldError message={form.errors.permission_name} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="menu-order">Orden *</Label>
                <Input
                    id="menu-order"
                    type="number"
                    min={0}
                    max={9999}
                    value={form.data.sort_order}
                    onChange={(event) =>
                        form.setData('sort_order', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.sort_order)}
                />
                <FieldError message={form.errors.sort_order} />
            </div>

            <div className="flex items-center gap-2 pt-6">
                <Checkbox
                    id="menu-active"
                    checked={form.data.active}
                    onCheckedChange={(checked) =>
                        form.setData('active', checked === true)
                    }
                />
                <Label htmlFor="menu-active">Activo</Label>
            </div>
        </div>
    );
}
