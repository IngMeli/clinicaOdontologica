import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/format';
import type { Option, Paginated, StockMovement } from '@/types';

type Props = {
    movements: Paginated<StockMovement>;
    filters: { search: string; type: string };
    types: Option[];
};

export default function InventoryMovements({
    movements,
    filters,
    types,
}: Props) {
    return (
        <>
            <Head title="Movimientos de inventario" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Inventario"
                    title="Movimientos de almacén"
                    description="Entradas, salidas, ajustes y referencias de cada movimiento."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/inventario">
                                <ArrowLeft className="size-4" />
                                Volver al inventario
                            </Link>
                        </Button>
                    }
                />

                <form action="/inventario/movimientos" method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/inventario/movimientos">
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
                        <div className="min-w-56 flex-1 space-y-1">
                            <label
                                htmlFor="search"
                                className="text-xs text-muted-foreground"
                            >
                                Buscar producto
                            </label>
                            <Input
                                id="search"
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Nombre o SKU"
                            />
                        </div>
                        <div className="w-52 space-y-1">
                            <label
                                htmlFor="type"
                                className="text-xs text-muted-foreground"
                            >
                                Tipo
                            </label>
                            <EntitySelect
                                id="type"
                                name="type"
                                defaultValue={filters.type}
                                options={types}
                                placeholder="Todos los tipos"
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent>
                        <DataTable
                            rows={movements.data}
                            getRowKey={(movement) => movement.id}
                            emptyMessage="No hay movimientos registrados."
                            columns={[
                                {
                                    key: 'date',
                                    header: 'Fecha',
                                    cell: (movement) =>
                                        formatDateTime(movement.created_at),
                                },
                                {
                                    key: 'product',
                                    header: 'Producto',
                                    cell: (movement) => (
                                        <div>
                                            <p className="font-medium">
                                                {movement.product?.name ??
                                                    'Producto eliminado'}
                                            </p>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {movement.product?.sku}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'type',
                                    header: 'Tipo',
                                    cell: (movement) => (
                                        <Badge
                                            variant={
                                                movement.quantity < 0
                                                    ? 'destructive'
                                                    : 'secondary'
                                            }
                                        >
                                            {movement.type.replaceAll('_', ' ')}
                                        </Badge>
                                    ),
                                },
                                {
                                    key: 'quantity',
                                    header: 'Cantidad',
                                    cell: (movement) => (
                                        <span
                                            className={
                                                movement.quantity < 0
                                                    ? 'font-semibold text-destructive'
                                                    : 'font-semibold text-emerald-600'
                                            }
                                        >
                                            {movement.quantity > 0 ? '+' : ''}
                                            {movement.quantity}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'batch',
                                    header: 'Lote',
                                    cell: (movement) =>
                                        movement.batch?.lot_number ?? '—',
                                },
                                {
                                    key: 'reason',
                                    header: 'Motivo',
                                    cell: (movement) => movement.reason ?? '—',
                                },
                                {
                                    key: 'user',
                                    header: 'Usuario',
                                    cell: (movement) =>
                                        movement.creator?.name ?? '—',
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={movements.links}
                                    from={movements.from}
                                    to={movements.to}
                                    total={movements.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
