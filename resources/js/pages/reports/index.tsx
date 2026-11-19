import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    AlertTriangle,
    CalendarDays,
    ClipboardList,
    Download,
    Package,
    Printer,
    Stethoscope,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatAmount, formatDate } from '@/lib/format';

type Point = {
    label: string;
    value: number;
};

type Metrics = {
    income: number;
    paid_count: number;
    average_ticket: number;
    pharmacy_total: number;
    new_patients: number;
    appointments: number;
    consultations: number;
    pending_installments: number;
    low_stock: number;
};

type Charts = {
    income_by_day: Point[];
    income_by_type: Point[];
    payment_status: Point[];
    appointments_by_status: Point[];
    top_treatments: Point[];
    top_products: Point[];
};

type Props = {
    range: {
        from: string;
        to: string;
    };
    metrics: Metrics;
    charts: Charts;
};

const chartColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

export default function ReportsIndex({ range, metrics, charts }: Props) {
    const exportCsv = () => {
        const rows: Array<Array<string | number>> = [
            ['Reporte', `${range.from} a ${range.to}`],
            [],
            ['Métrica', 'Valor'],
            ['Ingresos cobrados', metrics.income],
            ['Pagos confirmados', metrics.paid_count],
            ['Ticket promedio', metrics.average_ticket],
            ['Ventas de farmacia', metrics.pharmacy_total],
            ['Pacientes nuevos', metrics.new_patients],
            ['Citas', metrics.appointments],
            ['Consultas', metrics.consultations],
            ['Cuotas pendientes', metrics.pending_installments],
            ['Productos con stock bajo', metrics.low_stock],
            [],
            ['Ingresos por día', 'Monto'],
            ...charts.income_by_day.map((point) => [point.label, point.value]),
            [],
            ['Ingresos por tipo', 'Monto'],
            ...charts.income_by_type.map((point) => [point.label, point.value]),
            [],
            ['Estado de pagos', 'Cantidad'],
            ...charts.payment_status.map((point) => [point.label, point.value]),
            [],
            ['Citas por estado', 'Cantidad'],
            ...charts.appointments_by_status.map((point) => [
                point.label,
                point.value,
            ]),
            [],
            ['Tratamientos más facturados', 'Monto'],
            ...charts.top_treatments.map((point) => [point.label, point.value]),
            [],
            ['Productos más vendidos', 'Monto'],
            ...charts.top_products.map((point) => [point.label, point.value]),
        ];

        const csv = rows
            .map((row) =>
                row
                    .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
                    .join(';'),
            )
            .join('\n');

        const blob = new Blob([`\uFEFF${csv}`], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-${range.from}-${range.to}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Head title="Reportes" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Análisis"
                    title="Reportes"
                    description={`Indicadores de ${formatDate(range.from)} al ${formatDate(range.to)}.`}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={exportCsv}>
                                <Download className="size-4" />
                                Exportar CSV
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                            >
                                <Printer className="size-4" />
                                Imprimir
                            </Button>
                        </div>
                    }
                />

                <form action="/reportes" method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" type="reset">
                                    Limpiar
                                </Button>
                                <Button type="submit">
                                    <TrendingUp className="size-4" />
                                    Actualizar
                                </Button>
                            </>
                        }
                    >
                        <div className="w-44 space-y-1">
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
                                defaultValue={range.from}
                            />
                        </div>
                        <div className="w-44 space-y-1">
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
                                defaultValue={range.to}
                            />
                        </div>
                    </FilterBar>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Ingresos cobrados"
                        value={formatAmount(metrics.income)}
                        hint={`${metrics.paid_count} pago(s) confirmados`}
                        icon={Wallet}
                    />
                    <MetricCard
                        label="Ticket promedio"
                        value={formatAmount(metrics.average_ticket)}
                        hint="Por pago confirmado"
                        icon={TrendingUp}
                    />
                    <MetricCard
                        label="Ventas de farmacia"
                        value={formatAmount(metrics.pharmacy_total)}
                        hint="Ventas completadas"
                        icon={Package}
                    />
                    <MetricCard
                        label="Cuotas pendientes"
                        value={formatAmount(metrics.pending_installments)}
                        hint="Saldo por cobrar"
                        icon={ClipboardList}
                    />
                    <MetricCard
                        label="Pacientes nuevos"
                        value={String(metrics.new_patients)}
                        hint="Registrados en el rango"
                        icon={Users}
                    />
                    <MetricCard
                        label="Citas"
                        value={String(metrics.appointments)}
                        hint="Agendadas en el rango"
                        icon={CalendarDays}
                    />
                    <MetricCard
                        label="Consultas"
                        value={String(metrics.consultations)}
                        hint="Atenciones registradas"
                        icon={Stethoscope}
                    />
                    <MetricCard
                        label="Stock bajo"
                        value={String(metrics.low_stock)}
                        hint="Productos en o bajo el mínimo"
                        icon={AlertTriangle}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <ChartCard
                        title="Ingresos por día"
                        description="Pagos confirmados agrupados por fecha."
                        className="lg:col-span-2"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.income_by_day}>
                                <defs>
                                    <linearGradient
                                        id="report-income"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--chart-1)"
                                            stopOpacity={0.7}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--chart-1)"
                                            stopOpacity={0.05}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11 }}
                                    stroke="var(--muted-foreground)"
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    stroke="var(--muted-foreground)"
                                />
                                <RechartsTooltip
                                    formatter={(value) =>
                                        formatAmount(Number(value))
                                    }
                                    contentStyle={{
                                        background: 'var(--popover)',
                                        borderColor: 'var(--border)',
                                        borderRadius: 8,
                                        fontSize: 12,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    name="Ingresos"
                                    stroke="var(--chart-1)"
                                    fill="url(#report-income)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Ingresos por tipo"
                        description="Distribución de los cobros del período."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.income_by_type}
                                    dataKey="value"
                                    nameKey="label"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={2}
                                >
                                    {charts.income_by_type.map(
                                        (point, index) => (
                                            <Cell
                                                key={point.label}
                                                fill={
                                                    chartColors[
                                                        index %
                                                            chartColors.length
                                                    ]
                                                }
                                            />
                                        ),
                                    )}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value) =>
                                        formatAmount(Number(value))
                                    }
                                    contentStyle={{
                                        background: 'var(--popover)',
                                        borderColor: 'var(--border)',
                                        borderRadius: 8,
                                        fontSize: 12,
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Estado de pagos"
                        description="Cantidad de pagos por estado en el período."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.payment_status}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11 }}
                                    stroke="var(--muted-foreground)"
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 11 }}
                                    stroke="var(--muted-foreground)"
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        background: 'var(--popover)',
                                        borderColor: 'var(--border)',
                                        borderRadius: 8,
                                        fontSize: 12,
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    name="Pagos"
                                    fill="var(--chart-2)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                        title="Citas por estado"
                        description="Agenda del período según su estado actual."
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.appointments_by_status}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11 }}
                                    stroke="var(--muted-foreground)"
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 11 }}
                                    stroke="var(--muted-foreground)"
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        background: 'var(--popover)',
                                        borderColor: 'var(--border)',
                                        borderRadius: 8,
                                        fontSize: 12,
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    name="Citas"
                                    fill="var(--chart-3)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <RankedTable
                        title="Tratamientos más facturados"
                        description="Procedimientos con mayor subtotal en el período."
                        points={charts.top_treatments}
                    />
                    <RankedTable
                        title="Productos más vendidos"
                        description="Productos con mayor venta en farmacia."
                        points={charts.top_products}
                    />
                </div>
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

function ChartCard({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="h-72">{children}</CardContent>
        </Card>
    );
}

function RankedTable({
    title,
    description,
    points,
}: {
    title: string;
    description: string;
    points: Point[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {points.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Sin datos para el período seleccionado.
                        </p>
                    )}
                    {points.map((point, index) => (
                        <div
                            key={`${point.label}-${index}`}
                            className="flex items-center justify-between gap-3 text-sm"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {index + 1}
                                </span>
                                <span className="truncate">{point.label}</span>
                            </div>
                            <span className="font-medium">
                                {formatAmount(point.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
