import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatAmount, formatDate } from '@/lib/format';
import type { BatchRef, Product, SupplierRef } from '@/types';

type Props = {
    product: Product;
    batches: BatchRef[];
    suppliers: SupplierRef[];
};

type FormData = {
    type: string;
    quantity: string;
    batch_id: string;
    supplier_id: string;
    lot_number: string;
    expiry_date: string;
    unit_cost: string;
    reason: string;
};

const typeOptions = [
    { value: 'compra', label: 'Entrada por compra' },
    { value: 'ajuste_positivo', label: 'Ajuste positivo' },
    { value: 'ajuste_negativo', label: 'Ajuste negativo' },
    { value: 'devolucion', label: 'Devolución' },
];

export default function InventoryAdjust({
    product,
    batches,
    suppliers,
}: Props) {
    const form = useForm<FormData>({
        type: 'compra',
        quantity: '1',
        batch_id: '',
        supplier_id: '',
        lot_number: '',
        expiry_date: '',
        unit_cost: '',
        reason: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/inventario/${product.id}/ajustar`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Ajustar stock · ${product.name}`} />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Inventario"
                    title="Movimiento de stock"
                    description={`${product.name} · ${product.sku} · Disponible: ${product.stock} ${product.unit}`}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/inventario">
                                <ArrowLeft className="size-4" />
                                Volver
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registrar movimiento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submit}
                                className="grid gap-4 md:grid-cols-2"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo *</Label>
                                    <EntitySelect
                                        id="type"
                                        value={form.data.type}
                                        onChange={(event) =>
                                            form.setData(
                                                'type',
                                                event.target.value,
                                            )
                                        }
                                        options={typeOptions}
                                    />
                                    {form.errors.type && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.type}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Cantidad *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min={1}
                                        value={form.data.quantity}
                                        onChange={(event) =>
                                            form.setData(
                                                'quantity',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {form.errors.quantity && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.quantity}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batch_id">
                                        Lote existente
                                    </Label>
                                    <EntitySelect
                                        id="batch_id"
                                        value={form.data.batch_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'batch_id',
                                                event.target.value,
                                            )
                                        }
                                        options={batches.map((batch) => ({
                                            value: batch.id,
                                            label: `${batch.lot_number} · ${batch.quantity} · ${formatDate(batch.expiry_date)}`,
                                        }))}
                                        placeholder="Sin lote específico"
                                    />
                                    {form.errors.batch_id && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.batch_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lot_number">
                                        Nuevo lote
                                    </Label>
                                    <Input
                                        id="lot_number"
                                        value={form.data.lot_number}
                                        onChange={(event) =>
                                            form.setData(
                                                'lot_number',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Se usa en entradas"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiry_date">
                                        Vencimiento
                                    </Label>
                                    <Input
                                        id="expiry_date"
                                        type="date"
                                        value={form.data.expiry_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'expiry_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_cost">
                                        Costo unitario
                                    </Label>
                                    <Input
                                        id="unit_cost"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={form.data.unit_cost}
                                        onChange={(event) =>
                                            form.setData(
                                                'unit_cost',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="supplier_id">
                                        Proveedor
                                    </Label>
                                    <EntitySelect
                                        id="supplier_id"
                                        value={form.data.supplier_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'supplier_id',
                                                event.target.value,
                                            )
                                        }
                                        options={suppliers.map((supplier) => ({
                                            value: supplier.id,
                                            label: supplier.name,
                                        }))}
                                        placeholder="Sin proveedor"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="reason">Motivo</Label>
                                    <Input
                                        id="reason"
                                        value={form.data.reason}
                                        onChange={(event) =>
                                            form.setData(
                                                'reason',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ej. reposición, merma, devolución"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 md:col-span-2">
                                    <Button variant="outline" asChild>
                                        <Link href="/inventario">Cancelar</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        {form.processing ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}
                                        Registrar movimiento
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lotes del producto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {batches.length === 0 && (
                                <p className="text-muted-foreground">
                                    Sin lotes registrados.
                                </p>
                            )}
                            {batches.map((batch) => (
                                <div
                                    key={batch.id}
                                    className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0"
                                >
                                    <div>
                                        <p className="font-mono text-xs">
                                            {batch.lot_number}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Vence{' '}
                                            {formatDate(batch.expiry_date)}
                                        </p>
                                    </div>
                                    <span className="font-medium">
                                        {batch.quantity}
                                    </span>
                                </div>
                            ))}
                            <p className="pt-2 text-xs text-muted-foreground">
                                Valor de venta:{' '}
                                {formatAmount(product.sale_price)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
