import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Pencil, Plus, Save, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { DataTable } from '@/components/data-table';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Paginated, SupplierRef } from '@/types';

type Props = {
    suppliers: Paginated<SupplierRef>;
    filters: { search: string };
    canManage: boolean;
};

type SupplierFormData = {
    name: string;
    tax_id: string;
    contact_name: string;
    phone: string;
    email: string;
    address: string;
};

const emptyForm: SupplierFormData = {
    name: '',
    tax_id: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
};

export default function InventorySuppliers({
    suppliers,
    filters,
    canManage,
}: Props) {
    return (
        <>
            <Head title="Proveedores" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Inventario"
                    title="Proveedores"
                    description="Contactos y compras asociadas a cada proveedor."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/inventario">
                                <ArrowLeft className="size-4" />
                                Volver al inventario
                            </Link>
                        </Button>
                    }
                />

                <form action="/inventario/proveedores" method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/inventario/proveedores">
                                        Limpiar
                                    </Link>
                                </Button>
                                <Button type="submit">
                                    <Search className="size-4" />
                                    Buscar
                                </Button>
                            </>
                        }
                    >
                        <div className="min-w-64 flex-1 space-y-1">
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
                                placeholder="Nombre, NIT o contacto"
                            />
                        </div>
                    </FilterBar>
                </form>

                {canManage && <CreateSupplier />}

                <Card>
                    <CardContent>
                        <DataTable
                            rows={suppliers.data}
                            getRowKey={(supplier) => supplier.id}
                            emptyMessage="No hay proveedores registrados."
                            columns={[
                                {
                                    key: 'name',
                                    header: 'Proveedor',
                                    cell: (supplier) => (
                                        <div>
                                            <p className="font-medium">
                                                {supplier.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {supplier.tax_id ?? 'Sin NIT'}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'contact',
                                    header: 'Contacto',
                                    cell: (supplier) => (
                                        <div>
                                            <p>
                                                {supplier.contact_name ?? '—'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {supplier.phone ??
                                                    supplier.email ??
                                                    ''}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'purchases',
                                    header: 'Compras',
                                    cell: (supplier) =>
                                        supplier.purchases_count ?? 0,
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (supplier) => (
                                        <StatusBadge
                                            status={
                                                supplier.active === false
                                                    ? 'inactivo'
                                                    : 'activo'
                                            }
                                        />
                                    ),
                                },
                                {
                                    key: 'actions',
                                    header: '',
                                    headerClassName: 'text-right',
                                    className: 'text-right',
                                    cell: (supplier) =>
                                        canManage ? (
                                            <SupplierActions
                                                supplier={supplier}
                                            />
                                        ) : null,
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={suppliers.links}
                                    from={suppliers.from}
                                    to={suppliers.to}
                                    total={suppliers.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function CreateSupplier() {
    const form = useForm<SupplierFormData>({ ...emptyForm });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/inventario/proveedores', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Nuevo proveedor
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
                    <SupplierFields form={form} />
                    <div className="flex items-end">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            Registrar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function SupplierActions({ supplier }: { supplier: SupplierRef }) {
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <EditSupplier
                supplier={supplier}
                onClose={() => setEditing(false)}
            />
        );
    }

    return (
        <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                Editar
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    router.patch(
                        `/inventario/proveedores/${supplier.id}/estado`,
                        { active: supplier.active === false },
                        { preserveScroll: true },
                    )
                }
            >
                {supplier.active === false ? 'Activar' : 'Desactivar'}
            </Button>
        </div>
    );
}

function EditSupplier({
    supplier,
    onClose,
}: {
    supplier: SupplierRef;
    onClose: () => void;
}) {
    const form = useForm<SupplierFormData>({
        name: supplier.name,
        tax_id: supplier.tax_id ?? '',
        contact_name: supplier.contact_name ?? '',
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        address: supplier.address ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/inventario/proveedores/${supplier.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
            <SupplierFields form={form} />
            <div className="flex items-end gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>
                    Guardar
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    );
}

function SupplierFields({
    form,
}: {
    form: ReturnType<typeof useForm<SupplierFormData>>;
}) {
    return (
        <>
            <div className="space-y-1">
                <Label htmlFor="supplier-name">Nombre *</Label>
                <Input
                    id="supplier-name"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                />
                {form.errors.name && (
                    <p className="text-xs text-destructive">
                        {form.errors.name}
                    </p>
                )}
            </div>
            <div className="space-y-1">
                <Label htmlFor="supplier-tax">NIT</Label>
                <Input
                    id="supplier-tax"
                    value={form.data.tax_id}
                    onChange={(event) =>
                        form.setData('tax_id', event.target.value)
                    }
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="supplier-contact">Contacto</Label>
                <Input
                    id="supplier-contact"
                    value={form.data.contact_name}
                    onChange={(event) =>
                        form.setData('contact_name', event.target.value)
                    }
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="supplier-phone">Teléfono</Label>
                <Input
                    id="supplier-phone"
                    value={form.data.phone}
                    onChange={(event) =>
                        form.setData('phone', event.target.value)
                    }
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="supplier-email">Correo</Label>
                <Input
                    id="supplier-email"
                    type="email"
                    value={form.data.email}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="supplier-address">Dirección</Label>
                <Input
                    id="supplier-address"
                    value={form.data.address}
                    onChange={(event) =>
                        form.setData('address', event.target.value)
                    }
                />
            </div>
        </>
    );
}
