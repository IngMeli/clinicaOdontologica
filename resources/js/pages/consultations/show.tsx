import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    Check,
    ClipboardList,
    Lock,
    Pencil,
    Pill,
    Plus,
    Save,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatAmount, formatDateTime } from '@/lib/format';
import { close, edit, index, show } from '@/routes/consultations';
import odontogramRoute from '@/routes/consultations/odontogram';
import type {
    Consultation,
    OdontogramConditionOption,
    OdontogramEntry,
    OdontogramFormData,
    Prescription,
    TreatmentPlan,
} from '@/types';

type Props = {
    consultation: Consultation;
    odontogram: OdontogramEntry[];
    odontogramHistory: OdontogramEntry[];
    treatmentPlans: TreatmentPlan[];
    prescriptions: Prescription[];
    conditions: OdontogramConditionOption[];
    can: {
        update: boolean;
        close: boolean;
        view_odontogram: boolean;
        manage_odontogram: boolean;
        create_treatment_plan: boolean;
        create_prescription: boolean;
    };
};

const surfaceOptions = [
    { value: 'oclusal', label: 'Oclusal' },
    { value: 'mesial', label: 'Mesial' },
    { value: 'distal', label: 'Distal' },
    { value: 'vestibular', label: 'Vestibular' },
    { value: 'lingual', label: 'Lingual / palatino' },
];

const conditionStyles: Record<string, string> = {
    sano: 'text-emerald-700',
    caries: 'text-red-700',
    obturado: 'text-sky-700',
    corona: 'text-amber-700',
    extraido: 'text-slate-500',
    endodoncia: 'text-violet-700',
    implante: 'text-teal-700',
    sellante: 'text-cyan-700',
    fractura: 'text-orange-700',
};

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}

export default function ConsultationShow({
    consultation,
    odontogram,
    odontogramHistory,
    treatmentPlans,
    prescriptions,
    conditions,
    can,
}: Props) {
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [confirmClose, setConfirmClose] = useState(false);
    const [processing, setProcessing] = useState(false);

    const form = useForm<OdontogramFormData>({
        tooth: '',
        surface: '',
        condition: 'caries',
        notes: '',
    });

    const conditionLabels = new Map(
        conditions.map((condition) => [condition.value, condition.label]),
    );

    const selectTooth = (tooth: number) => {
        setSelectedTooth(tooth);
        form.setData('tooth', String(tooth));
    };

    const submitOdontogram = () => {
        if (!form.data.tooth) {
            return;
        }

        form.post(odontogramRoute.store(consultation.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('notes');
                form.setData('condition', 'caries');
            },
        });
    };

    const closeConsultation = () => {
        setProcessing(true);
        router.patch(
            close(consultation.id).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setConfirmClose(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={consultation.code ?? 'Consulta'} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow={consultation.code ?? 'Consulta'}
                    title="Consulta clínica"
                    description={`${consultation.patient?.first_name ?? 'Paciente'} ${consultation.patient?.last_name ?? ''} · ${formatDateTime(consultation.consulted_at)}`}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={index().url}>
                                    <ArrowLeft className="size-4" />
                                    Volver
                                </Link>
                            </Button>
                            {can.update && (
                                <Button variant="outline" asChild>
                                    <Link href={edit(consultation.id).url}>
                                        <Pencil className="size-4" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                            {can.close && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setConfirmClose(true)}
                                    disabled={!consultation.diagnosis}
                                    title={
                                        consultation.diagnosis
                                            ? undefined
                                            : 'Registra un diagnóstico antes de cerrar.'
                                    }
                                >
                                    <Lock className="size-4" />
                                    Cerrar consulta
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
                                        <Stethoscope className="size-4 text-primary" />
                                        Datos de la consulta
                                    </CardTitle>
                                    <CardDescription>
                                        Motivo, diagnóstico y evolución de la
                                        atención.
                                    </CardDescription>
                                </div>
                                <StatusBadge status={consultation.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Paciente
                                    </p>
                                    <Link
                                        href={`/pacientes/${consultation.patient_id}`}
                                        className="flex items-center gap-2 font-medium hover:underline"
                                    >
                                        <UserRound className="size-4 text-muted-foreground" />
                                        {consultation.patient?.first_name}{' '}
                                        {consultation.patient?.last_name}
                                    </Link>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {consultation.patient?.code}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Doctor
                                    </p>
                                    <p className="font-medium">
                                        {consultation.doctor?.user?.name ??
                                            'Sin doctor'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {consultation.doctor?.specialty?.name ??
                                            'Sin especialidad'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Fecha
                                    </p>
                                    <p className="flex items-center gap-2 font-medium">
                                        <CalendarClock className="size-4 text-muted-foreground" />
                                        {formatDateTime(
                                            consultation.consulted_at,
                                        )}
                                    </p>
                                </div>
                                {consultation.appointment_id && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Cita de origen
                                        </p>
                                        <Link
                                            href={`/agenda/${consultation.appointment_id}`}
                                            className="font-medium hover:underline"
                                        >
                                            Ver cita #
                                            {consultation.appointment_id}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Motivo
                                </p>
                                <p className="text-sm whitespace-pre-line">
                                    {consultation.reason}
                                </p>
                            </div>

                            <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Diagnóstico
                                    </p>
                                    <p className="text-sm whitespace-pre-line">
                                        {consultation.diagnosis ??
                                            'Sin diagnóstico registrado.'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Observaciones
                                    </p>
                                    <p className="text-sm whitespace-pre-line">
                                        {consultation.observations ??
                                            'Sin observaciones.'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Acciones clínicas</CardTitle>
                            <CardDescription>
                                Crea planes o recetas vinculados a esta
                                consulta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {can.create_treatment_plan && (
                                <Button asChild>
                                    <Link
                                        href={`/planes-tratamiento/crear?patient_id=${consultation.patient_id}&consultation_id=${consultation.id}`}
                                    >
                                        <ClipboardList className="size-4" />
                                        Nuevo plan de tratamiento
                                    </Link>
                                </Button>
                            )}
                            {can.create_prescription && (
                                <Button variant="outline" asChild>
                                    <Link
                                        href={`/recetas/crear?patient_id=${consultation.patient_id}&consultation_id=${consultation.id}`}
                                    >
                                        <Pill className="size-4" />
                                        Emitir receta
                                    </Link>
                                </Button>
                            )}
                            {!can.create_treatment_plan &&
                                !can.create_prescription && (
                                    <p className="text-sm text-muted-foreground">
                                        No tienes permisos para crear registros
                                        clínicos.
                                    </p>
                                )}
                        </CardContent>
                    </Card>
                </div>

                {can.view_odontogram && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Odontograma</CardTitle>
                            <CardDescription>
                                Estado más reciente por pieza y superficie. Cada
                                cambio conserva su historial.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <OdontogramChart
                                entries={odontogram}
                                selectedTooth={selectedTooth}
                                onSelectTooth={
                                    can.manage_odontogram
                                        ? selectTooth
                                        : undefined
                                }
                            />

                            {can.manage_odontogram && (
                                <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-medium">
                                            Registrar hallazgo
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedTooth
                                                ? `Pieza ${selectedTooth} seleccionada`
                                                : 'Selecciona una pieza del odontograma'}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="tooth">
                                                Pieza *
                                            </Label>
                                            <Input
                                                id="tooth"
                                                type="number"
                                                min={11}
                                                max={85}
                                                value={form.data.tooth}
                                                onChange={(event) => {
                                                    form.setData(
                                                        'tooth',
                                                        event.target.value,
                                                    );
                                                    setSelectedTooth(
                                                        Number(
                                                            event.target.value,
                                                        ) || null,
                                                    );
                                                }}
                                                aria-invalid={Boolean(
                                                    form.errors.tooth,
                                                )}
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Permanente 11-48 · Temporal
                                                51-85
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="surface">
                                                Superficie
                                            </Label>
                                            <select
                                                id="surface"
                                                value={form.data.surface}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'surface',
                                                        event.target.value,
                                                    )
                                                }
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                <option value="">
                                                    Toda la pieza
                                                </option>
                                                {surfaceOptions.map(
                                                    (surface) => (
                                                        <option
                                                            key={surface.value}
                                                            value={
                                                                surface.value
                                                            }
                                                        >
                                                            {surface.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="condition">
                                                Condición *
                                            </Label>
                                            <select
                                                id="condition"
                                                value={form.data.condition}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'condition',
                                                        event.target.value,
                                                    )
                                                }
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                {conditions.map((condition) => (
                                                    <option
                                                        key={condition.value}
                                                        value={condition.value}
                                                    >
                                                        {condition.code} ·{' '}
                                                        {condition.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="notes">Notas</Label>
                                            <Input
                                                id="notes"
                                                value={form.data.notes}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Detalle opcional"
                                            />
                                        </div>
                                    </div>

                                    {(form.errors.tooth ||
                                        form.errors.condition ||
                                        form.errors.surface) && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.tooth ??
                                                form.errors.condition ??
                                                form.errors.surface}
                                        </p>
                                    )}

                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            onClick={submitOdontogram}
                                            disabled={
                                                form.processing ||
                                                !form.data.tooth
                                            }
                                        >
                                            <Save className="size-4" />
                                            Guardar hallazgo
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {odontogramHistory.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Historial reciente
                                    </p>
                                    <div className="space-y-1">
                                        {odontogramHistory
                                            .slice(0, 10)
                                            .map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                                                >
                                                    <div>
                                                        <span className="font-medium">
                                                            Pieza {entry.tooth}
                                                        </span>
                                                        {entry.surface && (
                                                            <span className="text-muted-foreground">
                                                                {' '}
                                                                ·{' '}
                                                                {entry.surface}
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`ml-2 ${conditionStyles[entry.condition] ?? ''}`}
                                                        >
                                                            {conditionLabels.get(
                                                                entry.condition,
                                                            ) ??
                                                                entry.condition}
                                                        </span>
                                                        {entry.notes && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {entry.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(
                                                            entry.recorded_at,
                                                        )}{' '}
                                                        ·{' '}
                                                        {entry.recorder?.name ??
                                                            'Sistema'}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <CardTitle>Planes de tratamiento</CardTitle>
                                    <CardDescription>
                                        Propuestas y avance clínico.
                                    </CardDescription>
                                </div>
                                {can.create_treatment_plan && (
                                    <Button size="sm" variant="outline" asChild>
                                        <Link
                                            href={`/planes-tratamiento/crear?patient_id=${consultation.patient_id}&consultation_id=${consultation.id}`}
                                        >
                                            <Plus className="size-4" />
                                            Nuevo
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {treatmentPlans.length ? (
                                treatmentPlans.map((plan) => (
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
                                            <StatusBadge status={plan.status} />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <EmptyState message="Sin planes asociados a esta consulta." />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <CardTitle>Recetas</CardTitle>
                                    <CardDescription>
                                        Prescripciones emitidas en esta
                                        atención.
                                    </CardDescription>
                                </div>
                                {can.create_prescription && (
                                    <Button size="sm" variant="outline" asChild>
                                        <Link
                                            href={`/recetas/crear?patient_id=${consultation.patient_id}&consultation_id=${consultation.id}`}
                                        >
                                            <Plus className="size-4" />
                                            Nueva
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {prescriptions.length ? (
                                prescriptions.map((prescription) => (
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
                                                {formatDateTime(
                                                    prescription.issued_at,
                                                )}{' '}
                                                ·{' '}
                                                {prescription.doctor?.user
                                                    ?.name ?? 'Sin doctor'}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {prescription.items_count ?? 0}{' '}
                                            medicamentos
                                        </p>
                                    </Link>
                                ))
                            ) : (
                                <EmptyState message="Sin recetas asociadas a esta consulta." />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-start">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={show(consultation.id).url}>
                            <Check className="size-4" />
                            Actualizar vista
                        </Link>
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={confirmClose}
                onOpenChange={setConfirmClose}
                title="Cerrar consulta"
                description="La consulta quedará cerrada y no podrá editarse ni modificarse su odontograma. El historial se conserva."
                confirmLabel="Cerrar consulta"
                processing={processing}
                onConfirm={closeConsultation}
            />
        </>
    );
}
