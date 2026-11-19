import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CalendarClock,
    Loader2,
    Save,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatAmount, formatDate, formatDateTime } from '@/lib/format';
import type { Option, PaymentPlan } from '@/types';

type Props = {
    plan: PaymentPlan;
    canPay: boolean;
    canManageStatus: boolean;
    statuses: Option[];
};

export default function PaymentPlanShow({
    plan,
    canPay,
    canManageStatus,
    statuses,
}: Props) {
    const form = useForm({ status: plan.status });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/pagos/planes/${plan.id}/estado`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={plan.concept} />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Finanzas"
                    title={plan.concept}
                    description={`${plan.installments_count} cuota(s) · ${plan.frequency}`}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/pagos/planes">
                                <ArrowLeft className="size-4" />
                                Volver
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="size-4" />
                                    Cuotas
                                </CardTitle>
                                <StatusBadge status={plan.status} />
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="pb-2">#</th>
                                            <th className="pb-2">Vence</th>
                                            <th className="pb-2 text-right">
                                                Monto
                                            </th>
                                            <th className="pb-2 text-right">
                                                Pagado
                                            </th>
                                            <th className="pb-2">Estado</th>
                                            <th className="pb-2">
                                                Comprobante
                                            </th>
                                            <th className="pb-2 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {plan.installments?.map(
                                            (installment) => {
                                                const receipt =
                                                    installment.payments?.[0]
                                                        ?.receipt;

                                                return (
                                                    <tr
                                                        key={installment.id}
                                                        className="border-b border-border/60"
                                                    >
                                                        <td className="py-2">
                                                            {installment.number}
                                                        </td>
                                                        <td className="py-2">
                                                            {formatDate(
                                                                installment.due_date,
                                                            )}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {formatAmount(
                                                                installment.amount,
                                                            )}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {formatAmount(
                                                                installment.paid_amount,
                                                            )}
                                                        </td>
                                                        <td className="py-2">
                                                            <StatusBadge
                                                                status={
                                                                    installment.status
                                                                }
                                                            />
                                                        </td>
                                                        <td className="py-2 font-mono text-xs">
                                                            {receipt?.number ??
                                                                '—'}
                                                            {installment.paid_at && (
                                                                <p className="font-sans text-xs text-muted-foreground">
                                                                    {formatDateTime(
                                                                        installment.paid_at,
                                                                    )}
                                                                </p>
                                                            )}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            {canPay &&
                                                                installment.status !==
                                                                    'pagado' &&
                                                                installment.status !==
                                                                    'anulado' && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            if (
                                                                                window.confirm(
                                                                                    `¿Registrar pago de la cuota ${installment.number} por ${formatAmount(installment.amount)}?`,
                                                                                )
                                                                            ) {
                                                                                router.post(
                                                                                    `/pagos/planes/${plan.id}/cuotas/${installment.id}/pagar`,
                                                                                    {},
                                                                                    {
                                                                                        preserveScroll: true,
                                                                                    },
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Banknote className="size-4" />
                                                                        Cobrar
                                                                    </Button>
                                                                )}
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )}
                                    </tbody>
                                </table>

                                <div className="mt-4 flex justify-end">
                                    <div className="w-full max-w-xs space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Total
                                            </span>
                                            <span>
                                                {formatAmount(plan.total)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Pagado
                                            </span>
                                            <span>
                                                {formatAmount(plan.paid_amount)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 font-semibold">
                                            <span>Saldo</span>
                                            <span>
                                                {formatAmount(
                                                    Number(plan.total) -
                                                        Number(
                                                            plan.paid_amount,
                                                        ),
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {plan.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notas</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    {plan.notes}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <Row
                                    label="Paciente"
                                    value={
                                        plan.patient
                                            ? `${plan.patient.first_name} ${plan.patient.last_name}`
                                            : '—'
                                    }
                                />
                                <Row
                                    label="Plan de tratamiento"
                                    value={plan.treatment_plan?.code ?? '—'}
                                />
                                <Row
                                    label="Frecuencia"
                                    value={plan.frequency}
                                />
                                <Row
                                    label="Inicio"
                                    value={formatDate(plan.start_date)}
                                />
                                <Row
                                    label="Creado por"
                                    value={plan.creator?.name ?? '—'}
                                />
                                <Row
                                    label="Cuotas pendientes"
                                    value={String(
                                        plan.pending_installments_count ?? 0,
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {canManageStatus && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Estado del plan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={submit}
                                        className="space-y-3"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="status">
                                                Estado
                                            </Label>
                                            <EntitySelect
                                                id="status"
                                                value={form.data.status}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'status',
                                                        event.target.value,
                                                    )
                                                }
                                                options={statuses}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={form.processing}
                                        >
                                            {form.processing ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Save className="size-4" />
                                            )}
                                            Guardar estado
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}
