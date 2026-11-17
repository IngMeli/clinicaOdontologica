import { Head } from '@inertiajs/react';
import { ClipboardList, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatAmount, formatDate, statusLabel } from '@/lib/format';
import type {
    PortalConsultation,
    PortalPatient,
    PortalTreatmentPlan,
} from '@/types/portal';

type Props = {
    patient: PortalPatient;
    consultations: PortalConsultation[];
    treatmentPlans: PortalTreatmentPlan[];
};

export default function PortalHistory({
    patient,
    consultations,
    treatmentPlans,
}: Props) {
    return (
        <>
            <Head title="Mi historial" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Historial clínico
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {patient.first_name} {patient.last_name} · Ficha{' '}
                        {patient.code}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Consultas y diagnósticos</CardTitle>
                        <CardDescription>
                            Registro cronológico de atenciones y hallazgos del
                            odontograma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {consultations.map((consultation) => (
                            <div
                                key={consultation.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Stethoscope className="size-4 text-primary" />
                                        {consultation.code ??
                                            `Consulta #${consultation.id}`}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {statusLabel(consultation.status)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(
                                                consultation.consulted_at,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm">
                                    <span className="text-muted-foreground">
                                        Motivo:{' '}
                                    </span>
                                    {consultation.reason}
                                </p>
                                <p className="text-sm">
                                    <span className="text-muted-foreground">
                                        Diagnóstico:{' '}
                                    </span>
                                    {consultation.diagnosis ?? 'Sin registrar'}
                                </p>
                                {consultation.observations && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {consultation.observations}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Atendido por{' '}
                                    {consultation.doctor?.user?.name ??
                                        'Doctor'}
                                </p>

                                {consultation.odontogram_entries.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {consultation.odontogram_entries.map(
                                            (entry) => (
                                                <Badge
                                                    key={entry.id}
                                                    variant="secondary"
                                                    title={entry.notes ?? ''}
                                                >
                                                    Pieza {entry.tooth}:{' '}
                                                    {entry.condition}
                                                    {entry.surface
                                                        ? ` (${entry.surface})`
                                                        : ''}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {consultations.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Aún no tienes consultas registradas.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Planes de tratamiento</CardTitle>
                        <CardDescription>
                            Procedimientos propuestos, aprobados y finalizados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {treatmentPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 font-medium">
                                        <ClipboardList className="size-4 text-primary" />
                                        {plan.code ?? `Plan #${plan.id}`}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {statusLabel(plan.status)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(plan.start_date)} —{' '}
                                            {formatDate(plan.end_date)}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {plan.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 text-sm"
                                        >
                                            <span>
                                                {item.treatment?.name ??
                                                    'Procedimiento'}
                                                {item.tooth
                                                    ? ` · pieza ${item.tooth}`
                                                    : ''}
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-2"
                                                >
                                                    {statusLabel(item.status)}
                                                </Badge>
                                            </span>
                                            <span className="font-medium">
                                                {formatAmount(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t pt-2 text-sm font-semibold">
                                    <span>Total</span>
                                    <span>{formatAmount(plan.total)}</span>
                                </div>
                            </div>
                        ))}
                        {treatmentPlans.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Aún no tienes planes de tratamiento.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PortalHistory.layout = {
    breadcrumbs: [
        {
            title: 'Mi historial',
            href: '/portal/historial',
        },
    ],
};
