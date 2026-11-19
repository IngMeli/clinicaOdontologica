import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatAmount } from '@/lib/format';
import type {
    PatientRef,
    PharmacySaleFormData,
    PharmacySaleItemFormData,
    Prescription,
    Product,
} from '@/types';

type Props = {
    patients: PatientRef[];
    prescriptions: Prescription[];
    products: Product[];
};

const emptyItem: PharmacySaleItemFormData = {
    product_id: '',
    quantity: '1',
    unit_price: '',
};

export default function PharmacySaleCreate({
    patients,
    prescriptions,
    products,
}: Props) {
    const form = useForm<PharmacySaleFormData>({
        patient_id: '',
        prescription_id: '',
        discount: '0',
        notes: '',
        items: [{ ...emptyItem }],
    });

    const subtotal = form.data.items.reduce(
        (total, item) =>
            total + Number(item.quantity || 0) * Number(item.unit_price || 0),
        0,
    );
    const discount = Math.min(Number(form.data.discount || 0), subtotal);
    const total = Math.max(subtotal - discount, 0);

    const updateItem = (
        index: number,
        key: keyof PharmacySaleItemFormData,
        value: string,
    ) => {
        form.setData(
            'items',
            form.data.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    const selectProduct = (index: number, productId: string) => {
        const product = products.find((item) => String(item.id) === productId);

        form.setData(
            'items',
            form.data.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          product_id: productId,
                          unit_price: product ? String(product.sale_price) : '',
                      }
                    : item,
            ),
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            items: data.items.filter((item) => item.product_id !== ''),
        }));
        form.post('/ventas-farmacia');
    };

    return (
        <>
            <Head title="Nueva venta de farmacia" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Farmacia"
                    title="Nueva venta"
                    description="La venta descuenta stock automáticamente y genera un pago cuando hay paciente."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/ventas-farmacia">
                                <ArrowLeft className="size-4" />
                                Volver
                            </Link>
                        </Button>
                    }
                />

                <form
                    onSubmit={submit}
                    className="grid gap-5 xl:grid-cols-[1fr_340px]"
                >
                    <div className="space-y-5">
                        <Card>
                            <CardHeader>
                                <CardTitle>Paciente y receta</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="patient_id">Paciente</Label>
                                    <EntitySelect
                                        id="patient_id"
                                        value={form.data.patient_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'patient_id',
                                                event.target.value,
                                            )
                                        }
                                        options={patients.map((patient) => ({
                                            value: patient.id,
                                            label: `${patient.code} · ${patient.first_name} ${patient.last_name}`,
                                        }))}
                                        placeholder="Consumidor final"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prescription_id">
                                        Receta
                                    </Label>
                                    <EntitySelect
                                        id="prescription_id"
                                        value={form.data.prescription_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'prescription_id',
                                                event.target.value,
                                            )
                                        }
                                        options={prescriptions.map(
                                            (prescription) => ({
                                                value: prescription.id,
                                                label: `${prescription.code ?? `Receta #${prescription.id}`} · ${prescription.patient?.first_name ?? ''} ${prescription.patient?.last_name ?? ''}`,
                                            }),
                                        )}
                                        placeholder="Sin receta"
                                    />
                                    {form.errors.prescription_id && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.prescription_id}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Productos</CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        form.setData('items', [
                                            ...form.data.items,
                                            { ...emptyItem },
                                        ])
                                    }
                                >
                                    <Plus className="size-4" />
                                    Agregar línea
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {form.data.items.map((item, index) => {
                                    const product = products.find(
                                        (candidate) =>
                                            String(candidate.id) ===
                                            item.product_id,
                                    );

                                    return (
                                        <div
                                            key={index}
                                            className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_90px_120px_auto]"
                                        >
                                            <div className="space-y-1">
                                                <Label>Producto</Label>
                                                <EntitySelect
                                                    value={item.product_id}
                                                    onChange={(event) =>
                                                        selectProduct(
                                                            index,
                                                            event.target.value,
                                                        )
                                                    }
                                                    options={products.map(
                                                        (candidate) => ({
                                                            value: candidate.id,
                                                            label: `${candidate.name} · ${candidate.sku}`,
                                                        }),
                                                    )}
                                                    placeholder="Selecciona producto"
                                                />
                                                {form.errors[
                                                    `items.${index}.product_id`
                                                ] && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            form.errors[
                                                                `items.${index}.product_id`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Cantidad</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(event) =>
                                                        updateItem(
                                                            index,
                                                            'quantity',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                {product && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Stock: {product.stock}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Precio</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={item.unit_price}
                                                    onChange={(event) =>
                                                        updateItem(
                                                            index,
                                                            'unit_price',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={
                                                        form.data.items
                                                            .length === 1
                                                    }
                                                    onClick={() =>
                                                        form.setData(
                                                            'items',
                                                            form.data.items.filter(
                                                                (
                                                                    _,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                    aria-label="Quitar producto"
                                                >
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {form.errors.items && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.items}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="discount">Descuento</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.data.discount}
                                    onChange={(event) =>
                                        form.setData(
                                            'discount',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.discount && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.discount}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <textarea
                                    id="notes"
                                    value={form.data.notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                            <div className="space-y-1 border-t pt-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span>{formatAmount(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Descuento
                                    </span>
                                    <span>-{formatAmount(discount)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                                    <span>Total</span>
                                    <span>{formatAmount(total)}</span>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                            >
                                {form.processing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                Registrar venta
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}
