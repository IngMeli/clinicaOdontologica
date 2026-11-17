import { Head, Link } from '@inertiajs/react';
import {
    CalendarCheck,
    ClipboardList,
    CreditCard,
    Pill,
    Stethoscope,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    formatAmount,
    formatDate,
    formatDateTime,
    statusLabel,
} from '@/lib/format';
import type {
    PortalAppointment,
    PortalInstallment,
    PortalPatient,
    PortalPrescription,
    PortalTreatmentPlan,
} from '@/types/portal';

type Props = {
    patient: PortalPatient;
    nextAppointment: PortalAppointment | null;
    activePlan: PortalTreatmentPlan | null;
    pendingInstallments: PortalInstallment[];
    recentPrescriptions: PortalPrescription[];
};

export default function PortalDashboard({
    patient,
    nextAppointment,
    activePlan,
    pendingInstallments,
    recentPrescriptions,
}: Props) {
    const pendingTotal = pendingInstallments.reduce(
        (sum, installment) => sum + Number(installment.amount),
        0,
    );

    return (
        <>
            <Head title="Mi resumen" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Hola, {patient.first_name} {patient.last_name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ficha {patient.code} · CI{' '}
                            {patient.ci ?? 'sin registro'}
                        </p>
                    </div>
                    <Badge variant="outline">
                        Paciente {patient.active ? 'activo' : 'inactivo'}
                    </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Summary
                        icon={CalendarCheck}
                        label="Próxima cita"
                        value={
                            nextAppointment
                                ? formatDateTime(nextAppointment.scheduled_at)
                                : 'Sin programar'
                        }
                        hint={
                            nextAppointment?.doctor?.user?.name ??
                            'Agenda una cita con secretaría'
                        }
                    />
                    <Summary
                        icon={ClipboardList}
                        label="Tratamiento activo"
                        value={
                            activePlan
                                ? formatAmount(activePlan.total)
                                : 'Sin plan activo'
                        }
                        hint={
                            activePlan
                                ? `${activePlan.items.length} procedimiento(s)`
                                : 'Tu doctor registrará el plan'
                        }
                    />
                    <Summary
                        icon={CreditCard}
                        label="Saldo pendiente"
                        value={formatAmount(pendingTotal)}
                        hint={`${pendingInstallments.length} cuota(s) pendientes`}
                    />
                    <Summary
                        icon={Pill}
                        label="Recetas recientes"
                        value={String(recentPrescriptions.length)}
                        hint="Últimas prescripciones médicas"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Próxima cita</CardTitle>
                            <CardDescription>
                                Detalle de tu siguiente atención.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {nextAppointment ? (
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Fecha y hora
                                        </span>
                                        <span className="font-medium">
                                            {formatDateTime(
                                                nextAppointment.scheduled_at,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Doctor
                                        </span>
                                        <span className="font-medium">
                                            {nextAppointment.doctor?.user
                                                ?.name ?? 'Por asignar'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Especialidad
                                        </span>
                                        <span>
                                            {nextAppointment.doctor?.specialty
                                                ?.name ?? 'General'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Estado
                                        </span>
                                        <Badge variant="secondary">
                                            {statusLabel(
                                                nextAppointment.status,
                                            )}
                                        </Badge>
                                    </div>
                                    {nextAppointment.reason && (
                                        <p className="rounded-md bg-muted p-3 text-xs">
                                            {nextAppointment.reason}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm text-muted-foreground">
                                    <p>No tienes citas programadas.</p>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/portal/citas">
                                            Ver historial de citas
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Plan de tratamiento activo</CardTitle>
                            <CardDescription>
                                {activePlan
                                    ? `Código ${activePlan.code ?? activePlan.id} · ${statusLabel(activePlan.status)}`
                                    : 'Sin tratamiento en curso.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {activePlan ? (
                                <>
                                    {activePlan.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-sm last:border-0 last:pb-0"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Stethoscope className="size-4 text-muted-foreground" />
                                                {item.treatment?.name ??
                                                    'Procedimiento'}
                                                {item.tooth && (
                                                    <Badge variant="outline">
                                                        Pieza {item.tooth}
                                                    </Badge>
                                                )}
                                            </span>
                                            <span className="font-medium">
                                                {formatAmount(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-2 text-sm font-semibold">
                                        <span>Total del plan</span>
                                        <span>
                                            {formatAmount(activePlan.total)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Tu odontólogo registrará los tratamientos
                                    indicados después de la consulta.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cuotas pendientes</CardTitle>
                            <CardDescription>
                                Planes de pago y vencimientos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {pendingInstallments.map((installment) => (
                                <div
                                    key={installment.id}
                                    className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">
                                            Cuota {installment.number} ·{' '}
                                            {installment.plan?.concept ??
                                                'Plan de pago'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Vence{' '}
                                            {formatDate(installment.due_date)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {formatAmount(installment.amount)}
                                        </p>
                                        <Badge variant="outline">
                                            {statusLabel(installment.status)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {pendingInstallments.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No tienes cuotas pendientes.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recetas recientes</CardTitle>
                                <CardDescription>
                                    Indicaciones emitidas por tus doctores.
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/portal/recetas">Ver todas</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentPrescriptions.map((prescription) => (
                                <div
                                    key={prescription.id}
                                    className="rounded-md border p-3 text-sm"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">
                                            {prescription.code ??
                                                `Receta #${prescription.id}`}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(prescription.issued_at)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {prescription.doctor?.user?.name ??
                                            'Doctor'}
                                    </p>
                                    <p className="mt-2">
                                        {prescription.items
                                            .map((item) => item.medication)
                                            .join(', ')}
                                    </p>
                                </div>
                            ))}
                            {recentPrescriptions.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Aún no tienes recetas registradas.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Summary({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: typeof CalendarCheck;
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
                <p className="text-lg font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </CardContent>
        </Card>
    );
}

PortalDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Portal del paciente',
            href: '/portal',
        },
    ],
};
