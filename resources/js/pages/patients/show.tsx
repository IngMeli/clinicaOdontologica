import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    CreditCard,
    HeartPulse,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Pill,
    Plus,
    Power,
    PowerOff,
    ScanLine,
    ShieldAlert,
    Stethoscope,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { OdontogramChart } from '@/components/odontogram-chart';
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
import {
    calculateAge,
    formatAmount,
    formatDate,
    formatDateTime,
    statusLabel,
} from '@/lib/format';
import { activate, deactivate, edit, index } from '@/routes/patients';
import type { OdontogramEntry, Patient } from '@/types';

type Props = {
    patient: Patient;
    initialTab: string;
    odontogram: OdontogramEntry[];
    odontogramHistory: OdontogramEntry[];
    stats: {
        paid_total: number;
        upcoming_appointments: number;
    };
    can: {
        update: boolean;
        deactivate: boolean;
        create_appointment: boolean;
        view_odontogram: boolean;
        create_treatment_plan: boolean;
        create_prescription: boolean;
        view_treatment_plans: boolean;
        view_prescriptions: boolean;
    };
};

const baseTabs = [
    { key: 'citas', label: 'Citas', icon: CalendarDays },
    { key: 'consultas', label: 'Consultas', icon: Stethoscope },
    { key: 'odontograma', label: 'Odontograma', icon: ScanLine },
    { key: 'planes', label: 'Planes', icon: ClipboardList },
    { key: 'recetas', label: 'Recetas', icon: Pill },
    { key: 'pagos', label: 'Pagos', icon: CreditCard },
];

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}

export default function PatientShow({
    patient,
    initialTab,
    odontogram,
    odontogramHistory,
    stats,
    can,
}: Props) {
    const [tab, setTab] = useState(initialTab);
    const [confirmAction, setConfirmAction] = useState<
        'activate' | 'deactivate' | null
    >(null);
    const [processing, setProcessing] = useState(false);

    const tabs = baseTabs.filter((item) => {
        if (item.key === 'odontograma') {
            return can.view_odontogram;
        }

        if (item.key === 'planes') {
            return can.view_treatment_plans;
        }

        if (item.key === 'recetas') {
            return can.view_prescriptions;
        }

        return true;
    });

    const age = calculateAge(patient.birth_date);

    const confirm = () => {
        setProcessing(true);

        const options = {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setConfirmAction(null);
            },
        };

        if (confirmAction === 'deactivate') {
            router.patch(deactivate(patient.id).url, {}, options);
        } else if (confirmAction === 'activate') {
            router.patch(activate(patient.id).url, {}, options);
        }
    };

    const dataRows = [
        { label: 'Código', value: patient.code },
        { label: 'CI', value: patient.ci ?? '—' },
        {
            label: 'Nacimiento',
            value: patient.birth_date ? formatDate(patient.birth_date) : '—',
        },
        { label: 'Edad', value: age === null ? '—' : `${age} años` },
        { label: 'Género', value: patient.gender ?? '—' },
        { label: 'Grupo sanguíneo', value: patient.blood_type ?? '—' },
        { label: 'Registro', value: formatDate(patient.created_at) },
    ];

    return (
        <>
            <Head title={`${patient.first_name} ${patient.last_name}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow={patient.code}
                    title={`${patient.first_name} ${patient.last_name}`}
                    description={`${age === null ? 'Edad no registrada' : `${age} años`} · ${patient.phone ?? 'Sin teléfono'} · ${patient.email ?? 'Sin correo'}`}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={index().url}>Volver</Link>
                            </Button>
                            {can.create_appointment && (
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/agenda/crear?patient_id=${patient.id}`}
                                    >
                                        <Plus className="size-4" />
                                        Nueva cita
                                    </Link>
                                </Button>
                            )}
                            {can.create_treatment_plan && (
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/planes-tratamiento/crear?patient_id=${patient.id}`}
                                    >
                                        <ClipboardList className="size-4" />
                                        Nuevo plan
                                    </Link>
                                </Button>
                            )}
                            {can.create_prescription && (
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/recetas/crear?patient_id=${patient.id}`}
                                    >
                                        <Pill className="size-4" />
                                        Nueva receta
                                    </Link>
                                </Button>
                            )}
                            {can.update && (
                                <Button variant="outline" asChild>
                                    <Link href={edit(patient.id).url}>
                                        <Pencil className="size-4" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                            {patient.active && can.deactivate && (
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        setConfirmAction('deactivate')
                                    }
                                >
                                    <PowerOff className="size-4" />
                                    Desactivar
                                </Button>
                            )}
                            {!patient.active && can.update && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setConfirmAction('activate')}
                                >
                                    <Power className="size-4" />
                                    Reactivar
                                </Button>
                            )}
                        </>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Summary
                        icon={UserRound}
                        label="Estado"
                        value={patient.active ? 'Activo' : 'Inactivo'}
                        hint={patient.code}
                    />
                    <Summary
                        icon={CalendarDays}
                        label="Próximas citas"
                        value={String(stats.upcoming_appointments)}
                        hint="Programadas o confirmadas"
                    />
                    <Summary
                        icon={CreditCard}
                        label="Total pagado"
                        value={formatAmount(stats.paid_total)}
                        hint="Pagos confirmados"
                    />
                    <Summary
                        icon={ShieldAlert}
                        label="Alergias"
                        value={patient.allergies ? 'Registradas' : 'Sin datos'}
                        hint={patient.allergies ?? 'Sin alergias conocidas'}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del paciente</CardTitle>
                            <CardDescription>
                                Identificación y datos demográficos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2">
                            {dataRows.map((row) => (
                                <div key={row.label} className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        {row.label}
                                    </p>
                                    <p className="text-sm font-medium">
                                        {row.value}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contacto y emergencia</CardTitle>
                            <CardDescription>
                                Canales de comunicación y respaldo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p className="flex items-center gap-2">
                                <Phone className="size-4 text-muted-foreground" />
                                {patient.phone ?? 'Sin teléfono'}
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="size-4 text-muted-foreground" />
                                {patient.email ?? 'Sin correo'}
                            </p>
                            <p className="flex items-start gap-2">
                                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                                {patient.address ?? 'Sin dirección'}
                            </p>
                            <div className="rounded-lg border bg-muted/30 p-3">
                                <p className="text-xs text-muted-foreground">
                                    Contacto de emergencia
                                </p>
                                <p className="font-medium">
                                    {patient.emergency_contact_name ??
                                        'No registrado'}
                                </p>
                                <p className="text-muted-foreground">
                                    {patient.emergency_contact_phone ?? '—'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeartPulse className="size-4 text-primary" />
                            Información clínica
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Alergias
                            </p>
                            <p className="text-sm whitespace-pre-line">
                                {patient.allergies ??
                                    'Sin alergias registradas.'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Notas médicas
                            </p>
                            <p className="text-sm whitespace-pre-line">
                                {patient.medical_notes ??
                                    'Sin notas médicas registradas.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Historial clínico</CardTitle>
                        <CardDescription>
                            Citas, consultas, planes, recetas y pagos del
                            paciente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((item) => {
                                const Icon = item.icon;
                                const count =
                                    item.key === 'citas'
                                        ? patient.appointments?.length
                                        : item.key === 'consultas'
                                          ? patient.consultations?.length
                                          : item.key === 'odontograma'
                                            ? odontogram.length
                                            : item.key === 'planes'
                                              ? patient.treatment_plans?.length
                                              : item.key === 'recetas'
                                                ? patient.prescriptions?.length
                                                : patient.payments?.length;

                                return (
                                    <Button
                                        key={item.key}
                                        type="button"
                                        variant={
                                            tab === item.key
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setTab(item.key)}
                                    >
                                        <Icon className="size-4" />
                                        {item.label}
                                        {count !== undefined && (
                                            <span className="rounded-full bg-background/20 px-1.5 text-xs">
                                                {count}
                                            </span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>

                        {tab === 'citas' && (
                            <div className="space-y-2">
                                {patient.appointments?.length ? (
                                    patient.appointments.map((appointment) => (
                                        <Link
                                            key={appointment.id}
                                            href={`/agenda/${appointment.id}`}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {formatDateTime(
                                                        appointment.scheduled_at,
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Dr(a).{' '}
                                                    {appointment.doctor?.user
                                                        ?.name ??
                                                        'Sin doctor'}{' '}
                                                    ·{' '}
                                                    {appointment.reason ??
                                                        'Sin motivo'}
                                                </p>
                                            </div>
                                            <StatusBadge
                                                status={appointment.status}
                                            />
                                        </Link>
                                    ))
                                ) : (
                                    <EmptyState message="Sin citas registradas." />
                                )}
                            </div>
                        )}

                        {tab === 'consultas' && (
                            <div className="space-y-2">
                                {patient.consultations?.length ? (
                                    patient.consultations.map(
                                        (consultation) => (
                                            <Link
                                                key={consultation.id}
                                                href={`/consultas/${consultation.id}`}
                                                className="block rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="font-medium">
                                                        {consultation.code ??
                                                            `Consulta #${consultation.id}`}
                                                    </p>
                                                    <StatusBadge
                                                        status={
                                                            consultation.status
                                                        }
                                                    />
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        consultation.consulted_at,
                                                    )}{' '}
                                                    · Dr(a).{' '}
                                                    {consultation.doctor?.user
                                                        ?.name ?? 'Sin doctor'}
                                                </p>
                                                <p className="mt-2">
                                                    {consultation.reason}
                                                </p>
                                                {consultation.diagnosis && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Diagnóstico:{' '}
                                                        {consultation.diagnosis}
                                                    </p>
                                                )}
                                            </Link>
                                        ),
                                    )
                                ) : (
                                    <EmptyState message="Sin consultas registradas." />
                                )}
                            </div>
                        )}

                        {tab === 'odontograma' && can.view_odontogram && (
                            <div className="space-y-4">
                                <OdontogramChart entries={odontogram} />

                                {odontogramHistory.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Historial de hallazgos
                                        </p>
                                        <div className="space-y-1">
                                            {odontogramHistory
                                                .slice(0, 12)
                                                .map((entry) => (
                                                    <div
                                                        key={entry.id}
                                                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                                                    >
                                                        <div>
                                                            <span className="font-medium">
                                                                Pieza{' '}
                                                                {entry.tooth}
                                                            </span>
                                                            {entry.surface && (
                                                                <span className="text-muted-foreground">
                                                                    {' '}
                                                                    ·{' '}
                                                                    {
                                                                        entry.surface
                                                                    }
                                                                </span>
                                                            )}
                                                            <span className="ml-2">
                                                                {entry.condition.replaceAll(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </span>
                                                            {entry.notes && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        entry.notes
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(
                                                                entry.recorded_at,
                                                            )}{' '}
                                                            ·{' '}
                                                            {entry.recorder
                                                                ?.name ??
                                                                'Sistema'}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'planes' && (
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-medium">
                                        Planes de tratamiento
                                    </p>
                                    {can.create_treatment_plan && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={`/planes-tratamiento/crear?patient_id=${patient.id}`}
                                            >
                                                <Plus className="size-4" />
                                                Nuevo plan
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                {patient.treatment_plans?.length ? (
                                    patient.treatment_plans.map((plan) => (
                                        <Link
                                            key={plan.id}
                                            href={`/planes-tratamiento/${plan.id}`}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {plan.code ??
                                                        `Plan #${plan.id}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Dr(a).{' '}
                                                    {plan.doctor?.user?.name ??
                                                        'Sin doctor'}{' '}
                                                    · {plan.items_count ?? 0}{' '}
                                                    procedimientos
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatAmount(plan.total)}
                                                </p>
                                                <StatusBadge
                                                    status={plan.status}
                                                />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <EmptyState message="Sin planes de tratamiento." />
                                )}
                            </div>
                        )}

                        {tab === 'recetas' && (
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-medium">
                                        Recetas
                                    </p>
                                    {can.create_prescription && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={`/recetas/crear?patient_id=${patient.id}`}
                                            >
                                                <Plus className="size-4" />
                                                Nueva receta
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                {patient.prescriptions?.length ? (
                                    patient.prescriptions.map(
                                        (prescription) => (
                                            <Link
                                                key={prescription.id}
                                                href={`/recetas/${prescription.id}`}
                                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {prescription.code ??
                                                            `Receta #${prescription.id}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(
                                                            prescription.issued_at,
                                                        )}{' '}
                                                        · Dr(a).{' '}
                                                        {prescription.doctor
                                                            ?.user?.name ??
                                                            'Sin doctor'}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {prescription.items_count ??
                                                        0}{' '}
                                                    medicamentos
                                                </p>
                                            </Link>
                                        ),
                                    )
                                ) : (
                                    <EmptyState message="Sin recetas emitidas." />
                                )}
                            </div>
                        )}

                        {tab === 'pagos' && (
                            <div className="space-y-3">
                                {patient.payments?.length ? (
                                    patient.payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {payment.reference ??
                                                        `Pago #${payment.id}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(
                                                        payment.paid_at,
                                                    )}{' '}
                                                    ·{' '}
                                                    {payment.method?.name ??
                                                        statusLabel(
                                                            payment.type,
                                                        )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatAmount(
                                                        payment.amount,
                                                    )}
                                                </p>
                                                <StatusBadge
                                                    status={payment.status}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="Sin pagos registrados." />
                                )}

                                {patient.payment_plans?.length ? (
                                    <div className="border-t pt-3">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                                            Planes de pago
                                        </p>
                                        {patient.payment_plans.map((plan) => (
                                            <div
                                                key={plan.id}
                                                className="flex flex-wrap items-center justify-between gap-2 py-1 text-sm"
                                            >
                                                <span>
                                                    Plan #{plan.id} ·{' '}
                                                    {plan.installments_count ??
                                                        0}{' '}
                                                    cuotas
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    {formatAmount(
                                                        plan.paid_amount,
                                                    )}{' '}
                                                    / {formatAmount(plan.total)}
                                                    <StatusBadge
                                                        status={plan.status}
                                                    />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={confirmAction !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmAction(null);
                    }
                }}
                title={
                    confirmAction === 'activate'
                        ? 'Reactivar paciente'
                        : 'Desactivar paciente'
                }
                description={
                    confirmAction === 'activate'
                        ? 'El paciente volverá a estar disponible para nuevas citas.'
                        : 'El paciente dejará de estar disponible para nuevas citas, pero su historial se conservará.'
                }
                confirmLabel={
                    confirmAction === 'activate' ? 'Reactivar' : 'Desactivar'
                }
                destructive={confirmAction !== 'activate'}
                processing={processing}
                onConfirm={confirm}
            />
        </>
    );
}

function Summary({
    icon: Icon,
    label,
    value,
    hint,
}: {
    icon: typeof UserRound;
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="truncate font-semibold">{value}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {hint}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
