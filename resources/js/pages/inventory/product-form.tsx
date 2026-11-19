import { Link, useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product, ProductCategoryRef, SupplierRef } from '@/types';

type Props = {
    product?: Product;
    categories: ProductCategoryRef[];
    suppliers: SupplierRef[];
    units: string[];
};

type ProductFormData = {
    category_id: string;
    sku: string;
    name: string;
    description: string;
    unit: string;
    min_stock: string;
    sale_price: string;
    active: boolean;
    initial_stock: string;
    initial_lot: string;
    initial_expiry_date: string;
    initial_unit_cost: string;
    initial_supplier_id: string;
};

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

export function ProductForm({ product, categories, suppliers, units }: Props) {
    const form = useForm<ProductFormData>({
        category_id: product?.category_id ? String(product.category_id) : '',
        sku: product?.sku ?? '',
        name: product?.name ?? '',
        description: product?.description ?? '',
        unit: product?.unit ?? 'unidad',
        min_stock: String(product?.min_stock ?? 0),
        sale_price: product ? String(product.sale_price) : '',
        active: product?.active ?? true,
        initial_stock: '',
        initial_lot: '',
        initial_expiry_date: '',
        initial_unit_cost: '',
        initial_supplier_id: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (product) {
            form.put(`/inventario/${product.id}`, { preserveScroll: true });
            return;
        }

        form.post('/inventario', { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Datos del producto</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU *</Label>
                        <Input
                            id="sku"
                            value={form.data.sku}
                            onChange={(event) =>
                                form.setData('sku', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.sku)}
                        />
                        <FieldError message={form.errors.sku} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.name)}
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category_id">Categoría</Label>
                        <EntitySelect
                            id="category_id"
                            value={form.data.category_id}
                            onChange={(event) =>
                                form.setData('category_id', event.target.value)
                            }
                            options={categories.map((category) => ({
                                value: category.id,
                                label: category.name,
                            }))}
                            placeholder="Sin categoría"
                        />
                        <FieldError message={form.errors.category_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit">Unidad *</Label>
                        <EntitySelect
                            id="unit"
                            value={form.data.unit}
                            onChange={(event) =>
                                form.setData('unit', event.target.value)
                            }
                            options={units.map((unit) => ({
                                value: unit,
                                label: unit,
                            }))}
                            placeholder="Selecciona una unidad"
                        />
                        <FieldError message={form.errors.unit} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="min_stock">Stock mínimo *</Label>
                        <Input
                            id="min_stock"
                            type="number"
                            min={0}
                            value={form.data.min_stock}
                            onChange={(event) =>
                                form.setData('min_stock', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.min_stock)}
                        />
                        <FieldError message={form.errors.min_stock} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sale_price">Precio de venta *</Label>
                        <Input
                            id="sale_price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.data.sale_price}
                            onChange={(event) =>
                                form.setData('sale_price', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.sale_price)}
                        />
                        <FieldError message={form.errors.sale_price} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Descripción</Label>
                        <textarea
                            id="description"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            rows={3}
                            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                        <FieldError message={form.errors.description} />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.active}
                            onChange={(event) =>
                                form.setData('active', event.target.checked)
                            }
                        />
                        Producto activo
                    </label>
                </CardContent>
            </Card>

            {!product && (
                <Card>
                    <CardHeader>
                        <CardTitle>Carga inicial de stock</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="initial_stock">
                                Cantidad inicial
                            </Label>
                            <Input
                                id="initial_stock"
                                type="number"
                                min={0}
                                value={form.data.initial_stock}
                                onChange={(event) =>
                                    form.setData(
                                        'initial_stock',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial_lot">Lote</Label>
                            <Input
                                id="initial_lot"
                                value={form.data.initial_lot}
                                onChange={(event) =>
                                    form.setData(
                                        'initial_lot',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial_expiry_date">
                                Vencimiento
                            </Label>
                            <Input
                                id="initial_expiry_date"
                                type="date"
                                value={form.data.initial_expiry_date}
                                onChange={(event) =>
                                    form.setData(
                                        'initial_expiry_date',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial_unit_cost">
                                Costo unitario
                            </Label>
                            <Input
                                id="initial_unit_cost"
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.data.initial_unit_cost}
                                onChange={(event) =>
                                    form.setData(
                                        'initial_unit_cost',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initial_supplier_id">
                                Proveedor
                            </Label>
                            <EntitySelect
                                id="initial_supplier_id"
                                value={form.data.initial_supplier_id}
                                onChange={(event) =>
                                    form.setData(
                                        'initial_supplier_id',
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
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href="/inventario">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {product ? 'Guardar cambios' : 'Registrar producto'}
                </Button>
            </div>
        </form>
    );
}
