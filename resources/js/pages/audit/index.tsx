import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Clock,
    Globe2,
    ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type UserRef = { name: string; email: string } | null;

type LoginAttempt = {
    id: number;
    email: string;
    ip_address: string | null;
    user_agent: string | null;
    successful: boolean;
    failure_reason: string | null;
    created_at: string;
    user: UserRef;
};

type AccessLog = {
    id: number;
    method: string;
    path: string;
    route_name: string | null;
    resource_type: string | null;
    status_code: number;
    ip_address: string | null;
    duration_ms: number;
    created_at: string;
    user: UserRef;
};

type CounterRow = {
    path?: string;
    route_name: string | null;
    count?: number;
    total?: number;
};

type Props = {
    loginAttempts: LoginAttempt[];
    recentAccess: AccessLog[];
    topResources: CounterRow[];
    topPages: CounterRow[];
};

const dateFormatter = new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
});

function formatDate(value: string): string {
    return dateFormatter.format(new Date(value));
}

export default function AuditIndex({
    loginAttempts,
    recentAccess,
    topResources,
    topPages,
}: Props) {
    const failed = loginAttempts.filter(
        (attempt) => !attempt.successful,
    ).length;
    const uniqueIps = new Set(
        loginAttempts.map((attempt) => attempt.ip_address).filter(Boolean),
    ).size;

    return (
        <>
            <Head title="Auditoría" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Auditoría y bitácora
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Inicios de sesión, accesos a recursos y contadores de
                        visitas persistentes.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={ShieldCheck}
                        label="Intentos registrados"
                        value={String(loginAttempts.length)}
                        hint="Últimos 30 movimientos"
                    />
                    <SummaryCard
                        icon={AlertTriangle}
                        label="Intentos fallidos"
                        value={String(failed)}
                        hint="Credenciales rechazadas"
                    />
                    <SummaryCard
                        icon={Globe2}
                        label="IPs distintas"
                        value={String(uniqueIps)}
                        hint="Origen de los intentos"
                    />
                    <SummaryCard
                        icon={Activity}
                        label="Accesos auditados"
                        value={String(recentAccess.length)}
                        hint="Solicitudes recientes"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Intentos de inicio de sesión</CardTitle>
                        <CardDescription>
                            Se registran éxitos, fallos, IP y agente de usuario.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-3">Fecha</th>
                                    <th className="py-2 pr-3">Correo</th>
                                    <th className="py-2 pr-3">Usuario</th>
                                    <th className="py-2 pr-3">IP</th>
                                    <th className="py-2 pr-3">Resultado</th>
                                    <th className="py-2">Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loginAttempts.map((attempt) => (
                                    <tr
                                        key={attempt.id}
                                        className="border-b border-border/60 last:border-0"
                                    >
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                            {formatDate(attempt.created_at)}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {attempt.email}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {attempt.user?.name ?? '—'}
                                        </td>
                                        <td className="py-2 pr-3 font-mono text-xs">
                                            {attempt.ip_address ?? '—'}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <Badge
                                                variant={
                                                    attempt.successful
                                                        ? 'secondary'
                                                        : 'destructive'
                                                }
                                            >
                                                {attempt.successful
                                                    ? 'Exitoso'
                                                    : 'Fallido'}
                                            </Badge>
                                        </td>
                                        <td className="py-2 text-xs text-muted-foreground">
                                            {attempt.failure_reason ?? '—'}
                                        </td>
                                    </tr>
                                ))}
                                {loginAttempts.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-6 text-center text-muted-foreground"
                                        >
                                            Sin intentos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recursos más accedidos</CardTitle>
                            <CardDescription>
                                Agrupado por nombre de ruta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topResources.map((row) => (
                                <div
                                    key={row.route_name}
                                    className="flex items-center justify-between gap-3 text-sm"
                                >
                                    <span className="truncate font-mono text-xs">
                                        {row.route_name}
                                    </span>
                                    <Badge variant="outline">
                                        {row.total} accesos
                                    </Badge>
                                </div>
                            ))}
                            {topResources.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Sin datos disponibles.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Páginas más visitadas</CardTitle>
                            <CardDescription>
                                Contador mantenido por trigger de PostgreSQL.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topPages.map((row) => (
                                <div
                                    key={row.path}
                                    className="flex items-center justify-between gap-3 text-sm"
                                >
                                    <span className="truncate font-mono text-xs">
                                        {row.path}
                                    </span>
                                    <Badge variant="outline">
                                        {row.count} visitas
                                    </Badge>
                                </div>
                            ))}
                            {topPages.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Sin visitas registradas.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Accesos recientes</CardTitle>
                        <CardDescription>
                            Bitácora de solicitudes autenticadas por ruta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-3">Fecha</th>
                                    <th className="py-2 pr-3">Usuario</th>
                                    <th className="py-2 pr-3">Método</th>
                                    <th className="py-2 pr-3">Ruta</th>
                                    <th className="py-2 pr-3">Estado</th>
                                    <th className="py-2">Duración</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAccess.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b border-border/60 last:border-0"
                                    >
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {log.user?.name ?? 'Invitado'}
                                        </td>
                                        <td className="py-2 pr-3 font-mono text-xs">
                                            {log.method}
                                        </td>
                                        <td className="py-2 pr-3 font-mono text-xs">
                                            {log.path}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <Badge
                                                variant={
                                                    log.status_code < 400
                                                        ? 'secondary'
                                                        : 'destructive'
                                                }
                                            >
                                                {log.status_code}
                                            </Badge>
                                        </td>
                                        <td className="py-2 text-xs text-muted-foreground">
                                            {log.duration_ms} ms
                                        </td>
                                    </tr>
                                ))}
                                {recentAccess.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-6 text-center text-muted-foreground"
                                        >
                                            Sin accesos auditados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: typeof Clock;
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
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

AuditIndex.layout = {
    breadcrumbs: [
        {
            title: 'Auditoría',
            href: '/auditoria',
        },
    ],
};
