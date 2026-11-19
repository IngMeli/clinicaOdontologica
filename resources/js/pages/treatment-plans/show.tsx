import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Loader2,
    Pencil,
    Plus,
    Save,
    Trash2,
    UserRound,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EntitySelect } from '@/components/entity-select';
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
import { formatAmount, formatDate, formatDateTime } from '@/lib/format';
import { edit, index, status as planStatus } from '@/routes/treatment-plans';
import itemsRoute from '@/routes/treatment-plans/items';
import type {
    Treatment,
    TreatmentPlan,
    TreatmentPlanItem,
    TreatmentPlanItemFormData,
} from '@/types';

type Props = {
    plan: TreatmentPlan;
    treatments: Treatment[];
    transitions: Array<{ value: string; label: string }>;
    can: {
        update: boolean;
        manage_status: boolean;
        manage_items: boolean;
        record_progress: boolean;
    };
};

const itemStatusOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'completado', label: 'Completado' },
];

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

function PlanItemForm({
    planId,
    treatments,
    item,
    onDone,
    onCancel,
}: {
    planId: number;
    treatments: Treatment[];
    item?: TreatmentPlanItem;
    onDone?: () => void;
    onCancel?: () => void;
}) {
    const form = useForm<TreatmentPlanItemFormData>({
        treatment_id: String(item?.treatment_id ?? ''),
        tooth: item?.tooth ? String(item.tooth) : '',
        quantity: String(item?.quantity ?? 1),
        unit_price: item ? String(item.unit_price) : '',
        sessions_planned: String(item?.sessions_planned ?? 1),
        notes: item?.notes ?? '',
    });

    const treatmentOptions = treatments.map((treatment) => ({
        value: treatment.id,
        label: `${treatment.name} — ${formatAmount(treatment.price)}`,
    }));

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (item) {
                    onDone?.();
                } else {
                    form.reset();
                }
            },
        };

        if (item) {
            form.put(itemsRoute.update([planId, item.id]).url, options);
            return;
        }

        form.post(itemsRoute.store(planId).url, options);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-1">
                    <Label htmlFor={`treatment-${item?.id ?? 'new'}`}>
                        Procedimiento *
                    </Label>
                    <EntitySelect
                        id={`treatment-${item?.id ?? 'new'}`}
                        value={form.data.treatment_id}
                        options={treatmentOptions}
                        onChange={(event) => {
                            const value = event.target.value;
                            const treatment = treatments.find(
                                (candidate) => String(candidate.id) === value,
                            );

                            form.setData({
                                ...form.data,
                                treatment_id: value,
                                unit_price: treatment
                                    ? String(treatment.price)
                                    : form.data.unit_price,
                            });
                        }}
                        placeholder="Selecciona un procedimiento"
                        aria-invalid={Boolean(form.errors.treatment_id)}
                    />
                    <FieldError message={form.errors.treatment_id} />
                </div>

                <div className="space-y-1">
                    <Label htmlFor={`tooth-${item?.id ?? 'new'}`}>
                        Pieza dental
                    </Label>
                    <Input
                        id={`tooth-${item?.id ?? 'new'}`}
                        type="number"
                        min={11}
                        max={48}
                        value={form.data.tooth}
                        onChange={(event) =>
                            form.setData('tooth', event.target.value)
                        }
                        placeholder="Opcional"
                        aria-invalid={Boolean(form.errors.tooth)}
                    />
                    <FieldError message={form.errors.tooth} />
                </div>

                <div className="space-y-1">
                    <Label htmlFor={`quantity-${item?.id ?? 'new'}`}>
                        Cantidad *
                    </Label>
                    <Input
                        id={`quantity-${item?.id ?? 'new'}`}
                        type="number"
                        min={1}
                        value={form.data.quantity}
                        onChange={(event) =>
                            form.setData('quantity', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.quantity)}
                    />
                    <FieldError message={form.errors.quantity} />
                </div>

                <div className="space-y-1">
                    <Label htmlFor={`price-${item?.id ?? 'new'}`}>
                        Precio unitario (Bs.) *
                    </Label>
                    <Input
                        id={`price-${item?.id ?? 'new'}`}
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.data.unit_price}
                        onChange={(event) =>
                            form.setData('unit_price', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.unit_price)}
                    />
                    <FieldError message={form.errors.unit_price} />
                </div>

                <div className="space-y-1">
                    <Label htmlFor={`sessions-${item?.id ?? 'new'}`}>
                        Sesiones planificadas *
                    </Label>
                    <Input
                        id={`sessions-${item?.id ?? 'new'}`}
                        type="number"
                        min={1}
                        value={form.data.sessions_planned}
                        onChange={(event) =>
                            form.setData('sessions_planned', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.sessions_planned)}
                    />
                    <FieldError message={form.errors.sessions_planned} />
                </div>

                <div className="space-y-1">
                    <Label htmlFor={`notes-${item?.id ?? 'new'}`}>Notas</Label>
                    <Input
                        id={`notes-${item?.id ?? 'new'}`}
                        value={form.data.notes}
                        onChange={(event) =>
                            form.setData('notes', event.target.value)
                        }
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {item ? 'Guardar procedimiento' : 'Agregar procedimiento'}
                </Button>
            </div>
        </form>
    );
}

function ProgressControl({
    planId,
    item,
}: {
    planId: number;
    item: TreatmentPlanItem;
}) {
    const form = useForm({
        status: item.status,
        sessions_done: String(item.sessions_done),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(itemsRoute.progress([planId, item.id]).url, {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="flex min-w-48 items-center gap-1">
            <EntitySelect
                value={form.data.status}
                options={itemStatusOptions}
                onChange={(event) => form.setData('status', event.target.value)}
                containerClassName="min-w-32"
                aria-label="Estado del procedimiento"
            />
            <Input
                type="number"
                min={0}
                max={item.sessions_planned}
                value={form.data.sessions_done}
                onChange={(event) =>
                    form.setData('sessions_done', event.target.value)
                }
                className="w-16"
                aria-label="Sesiones realizadas"
            />
            <Button
                type="submit"
                size="icon"
                variant="outline"
                disabled={form.processing}
                aria-label="Guardar avance"
            >
                {form.processing ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <Save className="size-4" />
                )}
            </Button>
        </form>
    );
}

export default function TreatmentPlanShow({
    plan,
    treatments,
    transitions,
    can,
}: Props) {
    const [editingItem, setEditingItem] = useState<TreatmentPlanItem | null>(
        null,
    );
    const [deletingItem, setDeletingItem] = useState<TreatmentPlanItem | null>(
        null,
    );
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const items = plan.items ?? [];
    const completedItems = items.filter(
        (item) => item.status === 'completado',
    ).length;
    const progress = items.length
        ? Math.round((completedItems / items.length) * 100)
        : 0;

    const runStatusChange = (status: string) => {
        setProcessing(true);
        router.patch(
            planStatus(plan.id).url,
            { status },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setPendingStatus(null);
                },
            },
        );
    };

    const requestStatusChange = (status: string) => {
        if (status === 'cancelado') {
            setPendingStatus(status);
            return;
        }

        runStatusChange(status);
    };

    const deleteItem = () => {
        if (!deletingItem) {
            return;
        }

        setProcessing(true);
        router.delete(itemsRoute.destroy([plan.id, deletingItem.id]).url, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeletingItem(null);
            },
        });
    };

    return (
        <>
            <Head title={plan.code ?? 'Plan de tratamiento'} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow={plan.code ?? 'Plan de tratamiento'}
                    title="Plan de tratamiento"
                    description={`${plan.patient?.first_name ?? 'Paciente'} ${plan.patient?.last_name ?? ''} · ${formatAmount(plan.total)}`}
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
                                    <Link href={edit(plan.id).url}>
                                        <Pencil className="size-4" />
                                        Editar
                                    </Link>
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
                                        <ClipboardList className="size-4 text-primary" />
                                        Resumen del plan
                                    </CardTitle>
                                    <CardDescription>
                                        Datos generales y avance del
                                        tratamiento.
                                    </CardDescription>
                                </div>
                                <StatusBadge status={plan.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Paciente
                                    </p>
                                    <Link
                                        href={`/pacientes/${plan.patient_id}`}
                                        className="flex items-center gap-2 font-medium hover:underline"
                                    >
                                        <UserRound className="size-4 text-muted-foreground" />
                                        {plan.patient?.first_name}{' '}
                                        {plan.patient?.last_name}
                                    </Link>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {plan.patient?.code}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Doctor
                                    </p>
                                    <p className="font-medium">
                                        {plan.doctor?.user?.name ??
                                            'Sin doctor'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {plan.doctor?.specialty?.name ??
                                            'Sin especialidad'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Fechas
                                    </p>
                                    <p className="flex items-center gap-2 text-sm">
                                        <CalendarDays className="size-4 text-muted-foreground" />
                                        {formatDate(plan.start_date)} →{' '}
                                        {formatDate(plan.end_date)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Consulta de origen
                                    </p>
                                    {plan.consultation_id ? (
                                        <Link
                                            href={`/consultas/${plan.consultation_id}`}
                                            className="text-sm font-medium hover:underline"
                                        >
                                            {plan.consultation?.code ??
                                                `Consulta #${plan.consultation_id}`}
                                        </Link>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Sin consulta asociada
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Total
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {formatAmount(plan.total)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Registrado
                                    </p>
                                    <p className="text-sm">
                                        {formatDateTime(plan.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Avance
                                    </span>
                                    <span className="font-medium">
                                        {completedItems} de {items.length}{' '}
                                        procedimientos
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {plan.notes && (
                                <div className="space-y-1 border-t pt-4">
                                    <p className="text-xs text-muted-foreground">
                                        Notas
                                    </p>
                                    <p className="text-sm whitespace-pre-line">
                                        {plan.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {can.manage_status && transitions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado del plan</CardTitle>
                                <CardDescription>
                                    Los cambios quedan registrados en auditoría.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                {transitions.map((transition) => (
                                    <Button
                                        key={transition.value}
                                        variant={
                                            transition.value === 'cancelado'
                                                ? 'outline'
                                                : 'default'
                                        }
                                        disabled={processing}
                                        onClick={() =>
                                            requestStatusChange(
                                                transition.value,
                                            )
                                        }
                                    >
                                        {transition.value === 'completado' ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : transition.value === 'cancelado' ? (
                                            <XCircle className="size-4" />
                                        ) : null}
                                        {transition.label}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Procedimientos</CardTitle>
                        <CardDescription>
                            Detalle de tratamientos, sesiones y avance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b text-left text-xs text-muted-foreground">
                                    <tr>
                                        <th className="py-2 pr-3 font-medium">
                                            Procedimiento
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Pieza
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Cant.
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            P. unit.
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Subtotal
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Sesiones
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Avance
                                        </th>
                                        <th className="py-2 pr-3 text-right font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="py-2 pr-3">
                                                <p className="font-medium">
                                                    {item.treatment?.name ??
                                                        `Tratamiento #${item.treatment_id}`}
                                                </p>
                                                {item.notes && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {item.tooth ?? '—'}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {item.quantity}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {formatAmount(item.unit_price)}
                                            </td>
                                            <td className="py-2 pr-3 font-medium">
                                                {formatAmount(item.subtotal)}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {item.sessions_done} /{' '}
                                                {item.sessions_planned}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {can.record_progress ? (
                                                    <ProgressControl
                                                        planId={plan.id}
                                                        item={item}
                                                    />
                                                ) : (
                                                    <StatusBadge
                                                        status={item.status}
                                                    />
                                                )}
                                            </td>
                                            <td className="py-2 pr-0 text-right">
                                                {can.manage_items && (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingItem(
                                                                    item,
                                                                );
                                                            }}
                                                            aria-label="Editar procedimiento"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setDeletingItem(
                                                                    item,
                                                                )
                                                            }
                                                            aria-label="Eliminar procedimiento"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                Agrega el primer procedimiento
                                                al plan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {can.manage_items && editingItem && (
                            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                                <p className="text-sm font-medium">
                                    Editar procedimiento
                                </p>
                                <PlanItemForm
                                    planId={plan.id}
                                    treatments={treatments}
                                    item={editingItem}
                                    onDone={() => setEditingItem(null)}
                                    onCancel={() => setEditingItem(null)}
                                />
                            </div>
                        )}

                        {can.manage_items && !editingItem && (
                            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                                <p className="flex items-center gap-2 text-sm font-medium">
                                    <Plus className="size-4" />
                                    Agregar procedimiento
                                </p>
                                <PlanItemForm
                                    planId={plan.id}
                                    treatments={treatments}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deletingItem !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingItem(null);
                    }
                }}
                title="Eliminar procedimiento"
                description="El procedimiento se quitará del plan y el total se recalculará."
                confirmLabel="Eliminar"
                processing={processing}
                destructive
                onConfirm={deleteItem}
            />

            <ConfirmDialog
                open={pendingStatus === 'cancelado'}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingStatus(null);
                    }
                }}
                title="Cancelar plan"
                description="El plan quedará cancelado y no podrán registrarse más avances."
                confirmLabel="Cancelar plan"
                processing={processing}
                destructive
                onConfirm={() => {
                    if (pendingStatus) {
                        runStatusChange(pendingStatus);
                    }
                }}
            />
        </>
    );
}
