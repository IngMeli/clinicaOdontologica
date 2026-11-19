import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    Check,
    Clock3,
    Pencil,
    Play,
    Stethoscope,
    UserRound,
    UserX,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatDate, formatDateTime, formatTime } from '@/lib/format';
import {
    consultation as consultationRoute,
    edit,
    index,
    status as statusRoute,
} from '@/routes/appointments';
import type { ClinicAppointment } from '@/types';

type Props = {
    appointment: ClinicAppointment;
    can: {
        update: boolean;
        change_status: boolean;
        create_consultation: boolean;
    };
};

type StatusAction = {
    status: string;
    label: string;
    destructive?: boolean;
};

const transitions: Record<string, StatusAction[]> = {
    programada: [
        { status: 'confirmada', label: 'Confirmar cita' },
        { status: 'no_asistio', label: 'Marcar no asistió', destructive: true },
        { status: 'cancelada', label: 'Cancelar cita', destructive: true },
    ],
    confirmada: [
        { status: 'atendida', label: 'Marcar como atendida' },
        { status: 'no_asistio', label: 'Marcar no asistió', destructive: true },
        { status: 'cancelada', label: 'Cancelar cita', destructive: true },
    ],
};

export default function AppointmentShow({ appointment, can }: Props) {
    const [processing, setProcessing] = useState(false);
    const [confirmStatus, setConfirmStatus] = useState<StatusAction | null>(
        null,
    );

    const endDate = new Date(
        new Date(appointment.scheduled_at).getTime() +
            appointment.duration_minutes * 60_000,
    );

    const changeStatus = (action: StatusAction) => {
        setProcessing(true);
        router.patch(
            statusRoute(appointment.id).url,
            { status: action.status },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setConfirmStatus(null);
                },
            },
        );
    };

    const startConsultation = () => {
        setProcessing(true);
        router.post(
            consultationRoute(appointment.id).url,
            {},
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    const actions = transitions[appointment.status] ?? [];
    const canStartConsultation =
        appointment.status === 'atendida' &&
        !appointment.consultation &&
        can.create_consultation;

    return (
        <>
            <Head title={`Cita #${appointment.id}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Agenda"
                    title={`Cita #${appointment.id}`}
                    description={`${formatDateTime(appointment.scheduled_at)} · ${appointment.patient?.first_name ?? 'Paciente'} ${appointment.patient?.last_name ?? ''}`}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={index().url}>
                                    <ArrowLeft className="size-4" />
                                    Volver a la agenda
                                </Link>
                            </Button>
                            {can.update && (
                                <Button variant="outline" asChild>
                                    <Link href={edit(appointment.id).url}>
                                        <Pencil className="size-4" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                            {canStartConsultation && (
                                <Button
                                    onClick={startConsultation}
                                    disabled={processing}
                                >
                                    <Play className="size-4" />
                                    Iniciar consulta
                                </Button>
                            )}
                        </>
                    }
                />

                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarClock className="size-4 text-primary" />
                                        Detalle de la cita
                                    </CardTitle>
                                    <CardDescription>
                                        Programación y motivo registrado.
                                    </CardDescription>
                                </div>
                                <StatusBadge status={appointment.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Fecha
                                    </p>
                                    <p className="flex items-center gap-2 font-medium">
                                        <CalendarClock className="size-4 text-muted-foreground" />
                                        {formatDate(appointment.scheduled_at)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Horario
                                    </p>
                                    <p className="flex items-center gap-2 font-medium">
                                        <Clock3 className="size-4 text-muted-foreground" />
                                        {formatTime(appointment.scheduled_at)} –{' '}
                                        {formatTime(endDate.toISOString())}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Paciente
                                    </p>
                                    <Link
                                        href={`/pacientes/${appointment.patient_id}`}
                                        className="flex items-center gap-2 font-medium hover:underline"
                                    >
                                        <UserRound className="size-4 text-muted-foreground" />
                                        {appointment.patient?.first_name}{' '}
                                        {appointment.patient?.last_name}
                                    </Link>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {appointment.patient?.code}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Doctor
                                    </p>
                                    <p className="flex items-center gap-2 font-medium">
                                        <Stethoscope className="size-4 text-muted-foreground" />
                                        {appointment.doctor?.user?.name ??
                                            'Sin doctor'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {appointment.doctor?.specialty?.name ??
                                            'Sin especialidad'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1 border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Motivo
                                </p>
                                <p className="text-sm">
                                    {appointment.reason ??
                                        'Sin motivo registrado.'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Notas internas
                                </p>
                                <p className="text-sm whitespace-pre-line">
                                    {appointment.notes ?? 'Sin notas internas.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {can.change_status && actions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Acciones de estado</CardTitle>
                                    <CardDescription>
                                        Las transiciones quedan registradas en
                                        auditoría.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    {actions.map((action) => (
                                        <Button
                                            key={action.status}
                                            variant={
                                                action.destructive
                                                    ? 'outline'
                                                    : 'default'
                                            }
                                            disabled={processing}
                                            onClick={() => {
                                                if (action.destructive) {
                                                    setConfirmStatus(action);
                                                    return;
                                                }

                                                changeStatus(action);
                                            }}
                                        >
                                            {action.status === 'confirmada' && (
                                                <Check className="size-4" />
                                            )}
                                            {action.status === 'atendida' && (
                                                <Stethoscope className="size-4" />
                                            )}
                                            {action.status === 'cancelada' && (
                                                <X className="size-4" />
                                            )}
                                            {action.status === 'no_asistio' && (
                                                <UserX className="size-4" />
                                            )}
                                            {action.label}
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {appointment.status === 'atendida' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Consulta clínica</CardTitle>
                                    <CardDescription>
                                        {appointment.consultation
                                            ? 'Consulta asociada a esta cita.'
                                            : 'Aún no se inició una consulta desde esta cita.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {appointment.consultation ? (
                                        <Link
                                            href={`/consultas/${appointment.consultation.id}`}
                                            className="block rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                                        >
                                            <p className="font-medium">
                                                {appointment.consultation
                                                    .code ??
                                                    `Consulta #${appointment.consultation.id}`}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatDateTime(
                                                    appointment.consultation
                                                        .consulted_at,
                                                )}
                                            </p>
                                            <p className="mt-2 line-clamp-2">
                                                {
                                                    appointment.consultation
                                                        .reason
                                                }
                                            </p>
                                        </Link>
                                    ) : canStartConsultation ? (
                                        <Button
                                            onClick={startConsultation}
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            <Play className="size-4" />
                                            Iniciar consulta
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Sin consulta asociada.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmStatus !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmStatus(null);
                    }
                }}
                title={
                    confirmStatus?.status === 'cancelada'
                        ? 'Cancelar cita'
                        : 'Marcar inasistencia'
                }
                description={
                    confirmStatus?.status === 'cancelada'
                        ? 'La cita quedará cancelada y liberará el horario del doctor.'
                        : 'La cita quedará registrada como no asistida y liberará el horario del doctor.'
                }
                confirmLabel={
                    confirmStatus?.status === 'cancelada'
                        ? 'Cancelar cita'
                        : 'Confirmar inasistencia'
                }
                destructive
                processing={processing}
                onConfirm={() => {
                    if (confirmStatus) {
                        changeStatus(confirmStatus);
                    }
                }}
            />
        </>
    );
}
