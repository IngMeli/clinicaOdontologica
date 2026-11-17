import { Head } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatDateTime, statusLabel } from '@/lib/format';
import type { PortalAppointment, PortalPatient } from '@/types/portal';

type Props = {
    patient: PortalPatient;
    appointments: PortalAppointment[];
};

export default function PortalAppointments({ patient, appointments }: Props) {
    const upcoming = appointments.filter(
        (appointment) =>
            new Date(appointment.scheduled_at) >= new Date() &&
            !['cancelada', 'no_asistio'].includes(appointment.status),
    );
    const past = appointments.filter(
        (appointment) =>
            new Date(appointment.scheduled_at) < new Date() ||
            ['cancelada', 'no_asistio'].includes(appointment.status),
    );

    return (
        <>
            <Head title="Mis citas" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Mis citas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {patient.first_name} {patient.last_name} · Ficha{' '}
                        {patient.code}
                    </p>
                </div>

                <Section title="Próximas citas" appointments={upcoming} />
                <Section title="Historial de citas" appointments={past} />
            </div>
        </>
    );
}

function Section({
    title,
    appointments,
}: {
    title: string;
    appointments: PortalAppointment[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {appointments.length} cita(s) registradas.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {appointments.map((appointment) => (
                    <div
                        key={appointment.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <CalendarDays className="size-5" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {formatDateTime(appointment.scheduled_at)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {appointment.doctor?.user?.name ??
                                        'Doctor por asignar'}
                                    {appointment.doctor?.specialty?.name
                                        ? ` · ${appointment.doctor.specialty.name}`
                                        : ''}
                                </p>
                                {appointment.reason && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {appointment.reason}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                {appointment.duration_minutes} min
                            </Badge>
                            <Badge variant="secondary">
                                {statusLabel(appointment.status)}
                            </Badge>
                        </div>
                    </div>
                ))}
                {appointments.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No hay citas en esta sección.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

PortalAppointments.layout = {
    breadcrumbs: [
        {
            title: 'Mis citas',
            href: '/portal/citas',
        },
    ],
};
