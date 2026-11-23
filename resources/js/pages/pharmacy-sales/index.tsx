import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    Plus,
    Search,
    ShoppingCart,
    Wallet,
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
import { formatAmount, formatDateTime } from '@/lib/format';
import type { Paginated, PharmacySale } from '@/types';

type Props = {
    sales: Paginated<PharmacySale>;
    filters: { search: string; status: string };
    can: {
        create: boolean;
    };
    metrics: {
        today_count: number;
        today_total: number;
        month_total: number;
        low_stock: number;
    };
};

const statusOptions = [
    { value: 'completada', label: 'Completada' },
    { value: 'anulada', label: 'Anulada' },
];

export default function PharmacySalesIndex({
    sales,
    filters,
    can,
    metrics,
}: Props) {
    return (
        <>
            <Head title="Ventas de farmacia" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Farmacia"
                    title="Ventas de farmacia"
                    description="Dispensación de productos, cobros y comprobantes."
                    actions={
                        can.create ? (
                            <Button asChild>
                                <Link href="/ventas-farmacia/crear">
                                    <Plus className="size-4" />
                                    Nueva venta
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric
                        label="Ventas de hoy"
                        value={String(metrics.today_count)}
                        hint="Ventas completadas"
                        icon={ShoppingCart}
                    />
                    <Metric
                        label="Ingresos de hoy"
                        value={formatAmount(metrics.today_total)}
                        hint="Total cobrado"
                        icon={Wallet}
                    />
                    <Metric
                        label="Ingresos del mes"
                        value={formatAmount(metrics.month_total)}
                        hint="Mes en curso"
                        icon={CalendarDays}
                    />
                    <Metric
                        label="Stock bajo"
                        value={String(metrics.low_stock)}
                        hint="Productos por reponer"
                        icon={AlertTriangle}
                    />
                </div>

                <form action="/ventas-farmacia" method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/ventas-farmacia">Limpiar</Link>
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
                                placeholder="Número de venta o paciente"
                            />
                        </div>
                        <div className="w-48 space-y-1">
                            <label
                                htmlFor="status"
                                className="text-xs text-muted-foreground"
                            >
                                Estado
                            </label>
                            <EntitySelect
                                id="status"
                                name="status"
                                defaultValue={filters.status}
                                options={statusOptions}
                                placeholder="Todos"
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent>
                        <DataTable
                            rows={sales.data}
                            getRowKey={(sale) => sale.id}
                            emptyMessage="No hay ventas registradas."
                            columns={[
                                {
                                    key: 'number',
                                    header: 'Venta',
                                    cell: (sale) => (
                                        <div>
                                            <Link
                                                href={`/ventas-farmacia/${sale.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {sale.sale_number}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(sale.sold_at)}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'patient',
                                    header: 'Paciente',
                                    cell: (sale) =>
                                        sale.patient
                                            ? `${sale.patient.first_name} ${sale.patient.last_name}`
                                            : 'Consumidor final',
                                },
                                {
                                    key: 'items',
                                    header: 'Ítems',
                                    cell: (sale) =>
                                        sale.items_count ??
                                        sale.items?.length ??
                                        0,
                                },
                                {
                                    key: 'total',
                                    header: 'Total',
                                    cell: (sale) => (
                                        <span className="font-semibold">
                                            {formatAmount(sale.total)}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (sale) => (
                                        <StatusBadge status={sale.status} />
                                    ),
                                },
                                {
                                    key: 'actions',
                                    header: '',
                                    headerClassName: 'text-right',
                                    className: 'text-right',
                                    cell: (sale) => (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/ventas-farmacia/${sale.id}`}
                                            >
                                                Ver detalle
                                            </Link>
                                        </Button>
                                    ),
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={sales.links}
                                    from={sales.from}
                                    to={sales.to}
                                    total={sales.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Metric({
    label,
    value,
    hint,
    icon: Icon,
}: {
    label: string;
    value: string;
    hint: string;
    icon: typeof ShoppingCart;
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
