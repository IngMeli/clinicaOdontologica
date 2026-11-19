import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    History,
    Package,
    Pencil,
    Plus,
    Search,
    Tags,
    Truck,
} from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatAmount } from '@/lib/format';
import type { Paginated, Product, ProductCategoryRef } from '@/types';

type Props = {
    products: Paginated<Product>;
    categories: ProductCategoryRef[];
    metrics: {
        products: number;
        low_stock: number;
        out_of_stock: number;
        stock_value: number;
        expiring_batches: number;
    };
    filters: {
        search: string;
        category_id: number | null;
        stock: string;
        active: string;
    };
    canManage: boolean;
};

const stockOptions = [
    { value: 'low', label: 'Stock bajo' },
    { value: 'out', label: 'Sin stock' },
];

export default function InventoryIndex({
    products,
    categories,
    metrics,
    filters,
    canManage,
}: Props) {
    return (
        <>
            <Head title="Inventario" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Operaciones"
                    title="Inventario"
                    description="Productos, lotes, stock mínimo y movimientos de almacén."
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/inventario/movimientos">
                                    <History className="size-4" />
                                    Movimientos
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/inventario/proveedores">
                                    <Truck className="size-4" />
                                    Proveedores
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/inventario/categorias">
                                    <Tags className="size-4" />
                                    Categorías
                                </Link>
                            </Button>
                            {canManage && (
                                <Button asChild>
                                    <Link href="/inventario/crear">
                                        <Plus className="size-4" />
                                        Nuevo producto
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Productos activos"
                        value={String(metrics.products)}
                        hint="Catálogo disponible"
                        icon={Boxes}
                    />
                    <MetricCard
                        label="Stock bajo"
                        value={String(metrics.low_stock)}
                        hint={`${metrics.out_of_stock} sin existencias`}
                        icon={AlertTriangle}
                    />
                    <MetricCard
                        label="Valor del stock"
                        value={formatAmount(metrics.stock_value)}
                        hint="Valorizado a precio de venta"
                        icon={Package}
                    />
                    <MetricCard
                        label="Lotes por vencer"
                        value={String(metrics.expiring_batches)}
                        hint="Próximos 90 días"
                        icon={History}
                    />
                </div>

                <form action="/inventario" method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/inventario">Limpiar</Link>
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
                                placeholder="SKU, nombre o unidad"
                            />
                        </div>
                        <div className="w-48 space-y-1">
                            <label
                                htmlFor="category_id"
                                className="text-xs text-muted-foreground"
                            >
                                Categoría
                            </label>
                            <EntitySelect
                                id="category_id"
                                name="category_id"
                                defaultValue={filters.category_id ?? ''}
                                options={categories.map((category) => ({
                                    value: category.id,
                                    label: category.name,
                                }))}
                                placeholder="Todas"
                            />
                        </div>
                        <div className="w-44 space-y-1">
                            <label
                                htmlFor="stock"
                                className="text-xs text-muted-foreground"
                            >
                                Existencias
                            </label>
                            <EntitySelect
                                id="stock"
                                name="stock"
                                defaultValue={filters.stock}
                                options={stockOptions}
                                placeholder="Todo el stock"
                            />
                        </div>
                        <div className="w-40 space-y-1">
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
                                options={[
                                    { value: '1', label: 'Solo activos' },
                                    { value: '0', label: 'Solo inactivos' },
                                ]}
                                placeholder="Todos"
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent>
                        <DataTable
                            rows={products.data}
                            getRowKey={(product) => product.id}
                            emptyMessage="No se encontraron productos con los filtros seleccionados."
                            columns={[
                                {
                                    key: 'product',
                                    header: 'Producto',
                                    cell: (product) => (
                                        <div>
                                            <p className="font-medium">
                                                {product.name}
                                            </p>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {product.sku} · {product.unit}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'category',
                                    header: 'Categoría',
                                    cell: (product) =>
                                        product.category?.name ?? '—',
                                },
                                {
                                    key: 'stock',
                                    header: 'Stock',
                                    cell: (product) => (
                                        <span
                                            className={
                                                product.stock <=
                                                product.min_stock
                                                    ? 'font-semibold text-destructive'
                                                    : 'font-medium'
                                            }
                                        >
                                            {product.stock}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'min_stock',
                                    header: 'Mínimo',
                                    cell: (product) => product.min_stock,
                                },
                                {
                                    key: 'price',
                                    header: 'Precio',
                                    cell: (product) =>
                                        formatAmount(product.sale_price),
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (product) => (
                                        <StatusBadge
                                            status={
                                                product.active
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
                                    cell: (product) =>
                                        canManage ? (
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/inventario/${product.id}/ajustar`}
                                                    >
                                                        Stock
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/inventario/${product.id}/editar`}
                                                        aria-label="Editar producto"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ) : null,
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={products.links}
                                    from={products.from}
                                    to={products.to}
                                    total={products.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function MetricCard({
    label,
    value,
    hint,
    icon: Icon,
}: {
    label: string;
    value: string;
    hint: string;
    icon: typeof Boxes;
}) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
                <CardDescription>{label}</CardDescription>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </CardContent>
        </Card>
    );
}
