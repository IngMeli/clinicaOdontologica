import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    Clock,
    Plus,
    Search,
    TrendingUp,
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
import type { Option, Paginated, Payment } from '@/types';

type Props = {
    payments: Paginated<Payment>;
    filters: {
        search: string;
        status: string;
        type: string;
        from: string;
        to: string;
    };
    metrics: {
        income_month: number;
        paid_today: number;
        pending_amount: number;
        pending_count: number;
    };
    types: Option[];
    statuses: Option[];
};

export default function PaymentsIndex({
    payments,
    filters,
    metrics,
    types,
    statuses,
}: Props) {
    const typeLabel = (value: string) =>
        types.find((type) => type.value === value)?.label ?? value;

    return (
        <>
            <Head title="Pagos" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Finanzas"
                    title="Pagos"
                    description="Cobros, comprobantes y conciliación de movimientos."
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/pagos/planes">
                                    <CalendarDays className="size-4" />
                                    Planes de pago
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/pagos/crear">
                                    <Plus className="size-4" />
                                    Registrar pago
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric
                        label="Ingresos del mes"
                        value={formatAmount(metrics.income_month)}
                        hint="Pagos cobrados"
                        icon={TrendingUp}
                    />
                    <Metric
                        label="Cobrado hoy"
                        value={formatAmount(metrics.paid_today)}
                        hint="Jornada actual"
                        icon={Wallet}
                    />
                    <Metric
                        label="Por cobrar"
                        value={formatAmount(metrics.pending_amount)}
                        hint={`${metrics.pending_count} pago(s)`}
                        icon={Clock}
                    />
                    <Metric
                        label="Planes de pago"
                        value="Ver gestión"
                        hint="Cuotas programadas"
                        icon={CalendarDays}
                    />
                </div>

                <form action="/pagos" method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/pagos">Limpiar</Link>
                                </Button>
                                <Button type="submit">
                                    <Search className="size-4" />
                                    Buscar
                                </Button>
                            </>
                        }
                    >
                        <div className="min-w-52 flex-1 space-y-1">
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
                                placeholder="Referencia o paciente"
                            />
                        </div>
                        <div className="w-44 space-y-1">
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
                                options={statuses}
                                placeholder="Todos"
                            />
                        </div>
                        <div className="w-44 space-y-1">
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
                                placeholder="Todos"
                            />
                        </div>
                        <div className="w-40 space-y-1">
                            <label
                                htmlFor="from"
                                className="text-xs text-muted-foreground"
                            >
                                Desde
                            </label>
                            <Input
                                id="from"
                                name="from"
                                type="date"
                                defaultValue={filters.from}
                            />
                        </div>
                        <div className="w-40 space-y-1">
                            <label
                                htmlFor="to"
                                className="text-xs text-muted-foreground"
                            >
                                Hasta
                            </label>
                            <Input
                                id="to"
                                name="to"
                                type="date"
                                defaultValue={filters.to}
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent>
                        <DataTable
                            rows={payments.data}
                            getRowKey={(payment) => payment.id}
                            emptyMessage="No hay pagos registrados."
                            columns={[
                                {
                                    key: 'reference',
                                    header: 'Referencia',
                                    cell: (payment) => (
                                        <div>
                                            <Link
                                                href={`/pagos/${payment.id}`}
                                                className="font-mono text-xs font-medium hover:underline"
                                            >
                                                {payment.reference ??
                                                    `#${payment.id}`}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(
                                                    payment.paid_at ??
                                                        payment.created_at,
                                                )}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'patient',
                                    header: 'Paciente',
                                    cell: (payment) =>
                                        payment.patient
                                            ? `${payment.patient.first_name} ${payment.patient.last_name}`
                                            : '—',
                                },
                                {
                                    key: 'type',
                                    header: 'Tipo',
                                    cell: (payment) => typeLabel(payment.type),
                                },
                                {
                                    key: 'method',
                                    header: 'Método',
                                    cell: (payment) =>
                                        payment.method?.name ?? '—',
                                },
                                {
                                    key: 'amount',
                                    header: 'Monto',
                                    cell: (payment) => (
                                        <span className="font-semibold">
                                            {formatAmount(payment.amount)}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (payment) => (
                                        <StatusBadge status={payment.status} />
                                    ),
                                },
                                {
                                    key: 'receipt',
                                    header: 'Recibo',
                                    cell: (payment) =>
                                        payment.receipt?.number ?? '—',
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={payments.links}
                                    from={payments.from}
                                    to={payments.to}
                                    total={payments.total}
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
    icon: typeof Wallet;
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
