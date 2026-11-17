import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    CalendarDays,
    CreditCard,
    Eye,
    LogIn,
    Package,
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
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';

type Metric = {
    patients: number;
    appointments_today: number;
    pending_appointments: number;
    active_treatment_plans: number;
    income_month: number;
    pending_payments: number;
    low_stock: number;
    visits_today: number;
    visits_total: number;
    logins_success_today: number;
    logins_failed_today: number;
};

type Point = { label: string; value: number };

type Charts = {
    visits: Point[];
    income: Point[];
    appointments: Point[];
    login_activity: { label: string; success: number; failed: number }[];
    top_pages: Point[];
    top_resources: Point[];
};

type Props = {
    metrics: Metric;
    charts: Charts;
};

const currency = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
});

const numbers = new Intl.NumberFormat('es-BO');

export default function Dashboard({ metrics, charts }: Props) {
    const { auth } = usePage().props;
    const user = auth.user;
    const permissions = new Set(user.permissions ?? []);
    const isAdmin = user.roles?.includes('Administrador');

    const cards = [
        {
            label: 'Pacientes registrados',
            value: numbers.format(metrics.patients),
            icon: Users,
            hint: 'Fichas clínicas activas',
            href: '/pacientes',
            visible: isAdmin || permissions.has('patients.view'),
        },
        {
            label: 'Citas de hoy',
            value: numbers.format(metrics.appointments_today),
            icon: CalendarDays,
            hint: `${metrics.pending_appointments} pendientes en agenda`,
            href: '/agenda',
            visible: isAdmin || permissions.has('appointments.view'),
        },
        {
            label: 'Ingresos del mes',
            value: currency.format(metrics.income_month),
            icon: Wallet,
            hint: `${metrics.pending_payments} pagos pendientes`,
            href: '/pagos',
            visible: isAdmin || permissions.has('payments.view'),
        },
        {
            label: 'Visitas de hoy',
            value: numbers.format(metrics.visits_today),
            icon: Eye,
            hint: `${numbers.format(metrics.visits_total)} accesos acumulados`,
            href:
                isAdmin || permissions.has('audit.view')
                    ? '/auditoria'
                    : undefined,
            visible: true,
        },
        {
            label: 'Tratamientos activos',
            value: numbers.format(metrics.active_treatment_plans),
            icon: Stethoscope,
            hint: 'Planes aprobados o en progreso',
            href: '/planes-tratamiento',
            visible: isAdmin || permissions.has('treatment_plans.view'),
        },
        {
            label: 'Stock bajo',
            value: numbers.format(metrics.low_stock),
            icon: Package,
            hint: 'Productos en o bajo el mínimo',
            href: '/inventario',
            visible: isAdmin || permissions.has('inventory.view'),
        },
        {
            label: 'Ingresos exitosos hoy',
            value: numbers.format(metrics.logins_success_today),
            icon: LogIn,
            hint: `${metrics.logins_failed_today} intentos fallidos`,
            href: '/auditoria',
            visible: isAdmin || permissions.has('audit.view'),
        },
        {
            label: 'Planes de pago',
            value: numbers.format(metrics.pending_payments),
            icon: CreditCard,
            hint: 'Pagos pendientes de conciliación',
            href: '/pagos',
            visible: isAdmin || permissions.has('payments.view'),
        },
    ].filter((card) => card.visible);

    const today = new Intl.DateTimeFormat('es-BO', {
        dateStyle: 'full',
    }).format(new Date());

    return (
        <>
            <Head title="Panel de control" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Hola, {user.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {today} ·{' '}
                            {user.roles?.join(', ') ?? 'Sin rol asignado'}
                        </p>
                    </div>
                    <Badge variant="outline" className="h-8 gap-1.5">
                        <TrendingUp className="size-3.5" />
                        Panel del negocio
                    </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => {
                        const content = (
                            <Card className="h-full transition-colors hover:border-primary/40">
                                <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
                                    <CardDescription>
                                        {card.label}
                                    </CardDescription>
                                    <card.icon className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-semibold">
                                        {card.value}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {card.hint}
                                    </p>
                                </CardContent>
                            </Card>
                        );

                        return card.href ? (
                            <Link key={card.label} href={card.href}>
                                {content}
                            </Link>
                        ) : (
                            <div key={card.label}>{content}</div>
                        );
                    })}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                Visitas de los últimos 14 días
                            </CardTitle>
                            <CardDescription>
                                Accesos registrados por el middleware de
                                auditoría y el contador de páginas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts.visits}>
                                    <defs>
                                        <linearGradient
                                            id="visits"
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
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        name="Visitas"
                                        stroke="var(--chart-1)"
                                        fill="url(#visits)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ingresos por mes</CardTitle>
                            <CardDescription>
                                Pagos confirmados en los últimos 6 meses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.income}>
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
                                            currency.format(Number(value))
                                        }
                                        contentStyle={{
                                            background: 'var(--popover)',
                                            borderColor: 'var(--border)',
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        name="Ingresos"
                                        fill="var(--chart-2)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Citas por estado</CardTitle>
                            <CardDescription>
                                Distribución de la agenda odontológica.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.appointments}
                                        dataKey="value"
                                        nameKey="label"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={2}
                                    >
                                        {charts.appointments.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={entry.label}
                                                    fill={`var(--chart-${(index % 5) + 1})`}
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Legend
                                        wrapperStyle={{ fontSize: 12 }}
                                        formatter={(value) => value}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            background: 'var(--popover)',
                                            borderColor: 'var(--border)',
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Intentos de inicio de sesión</CardTitle>
                            <CardDescription>
                                Éxitos y fallos de los últimos 7 días.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.login_activity}>
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
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar
                                        dataKey="success"
                                        name="Exitosos"
                                        stackId="login"
                                        fill="var(--chart-4)"
                                    />
                                    <Bar
                                        dataKey="failed"
                                        name="Fallidos"
                                        stackId="login"
                                        fill="var(--destructive)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Páginas más visitadas</CardTitle>
                            <CardDescription>
                                Contador persistente por ruta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {charts.top_pages.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Aún no hay visitas registradas.
                                </p>
                            )}
                            {charts.top_pages.map((page) => (
                                <ProgressRow key={page.label} item={page} />
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recursos más accedidos</CardTitle>
                            <CardDescription>
                                Rutas con mayor cantidad de solicitudes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {charts.top_resources.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Sin accesos registrados todavía.
                                </p>
                            )}
                            {charts.top_resources.map((resource) => (
                                <ProgressRow
                                    key={resource.label}
                                    item={{
                                        label: resource.label,
                                        value: resource.value,
                                    }}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {metrics.low_stock > 0 && (
                    <Card className="border-amber-500/40 bg-amber-500/5">
                        <CardContent className="flex items-center gap-3 py-4">
                            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm">
                                Hay{' '}
                                <strong>{metrics.low_stock} producto(s)</strong>{' '}
                                con stock bajo. Revisa el inventario para evitar
                                faltantes en tratamientos.
                            </p>
                            <Link
                                href="/inventario"
                                className="ml-auto text-sm font-medium underline underline-offset-4"
                            >
                                Ver inventario
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {metrics.pending_appointments > 0 && (
                    <Card>
                        <CardContent className="flex flex-wrap items-center gap-3 py-4">
                            <CalendarClock className="size-5 text-primary" />
                            <p className="text-sm">
                                Tienes{' '}
                                <strong>
                                    {metrics.pending_appointments} cita(s)
                                </strong>{' '}
                                programadas o confirmadas pendientes de
                                atención.
                            </p>
                            <Link
                                href="/agenda"
                                className="ml-auto text-sm font-medium underline underline-offset-4"
                            >
                                Abrir agenda
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function ProgressRow({ item }: { item: Point }) {
    const max = Math.max(item.value, 1);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary"
                    style={{
                        width: `${Math.max((item.value / max) * 100, 4)}%`,
                    }}
                />
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Panel',
            href: dashboard(),
        },
    ],
};
