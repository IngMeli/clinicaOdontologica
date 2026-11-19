import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CreditCard,
    Loader2,
    ReceiptText,
    Save,
    User,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatAmount, formatDateTime } from '@/lib/format';
import type { Option, Payment } from '@/types';

type Props = {
    payment: Payment;
    canManage: boolean;
    statuses: Option[];
};

export default function PaymentShow({ payment, canManage, statuses }: Props) {
    const form = useForm({ status: payment.status });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/pagos/${payment.id}/estado`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Pago ${payment.reference ?? payment.id}`} />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Finanzas"
                    title={payment.reference ?? `Pago #${payment.id}`}
                    description={formatDateTime(
                        payment.paid_at ?? payment.created_at,
                    )}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/pagos">
                                <ArrowLeft className="size-4" />
                                Volver
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Detalle del pago</CardTitle>
                                <StatusBadge status={payment.status} />
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <Detail
                                    label="Monto"
                                    value={formatAmount(payment.amount)}
                                />
                                <Detail
                                    label="Moneda"
                                    value={payment.currency}
                                />
                                <Detail label="Tipo" value={payment.type} />
                                <Detail
                                    label="Método"
                                    value={payment.method?.name ?? '—'}
                                />
                                <Detail
                                    label="Paciente"
                                    value={
                                        payment.patient
                                            ? `${payment.patient.first_name} ${payment.patient.last_name}`
                                            : '—'
                                    }
                                />
                                <Detail
                                    label="Registrado por"
                                    value={payment.creator?.name ?? '—'}
                                />
                                <Detail
                                    label="Pagado el"
                                    value={formatDateTime(payment.paid_at)}
                                />
                                <Detail
                                    label="Creado el"
                                    value={formatDateTime(payment.created_at)}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="size-4" />
                                    Transacciones de pasarela
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {payment.gateway_transactions?.length ? (
                                    payment.gateway_transactions.map(
                                        (transaction) => (
                                            <div
                                                key={transaction.id}
                                                className="flex flex-wrap items-center justify-between gap-2 rounded border p-3"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {transaction.gateway}
                                                    </p>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {
                                                            transaction.transaction_id
                                                        }
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p>
                                                        {formatAmount(
                                                            transaction.amount,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {transaction.status}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p className="text-muted-foreground">
                                        Sin transacciones de pasarela.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ReceiptText className="size-4" />
                                    Comprobante
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {payment.receipt ? (
                                    <>
                                        <p className="font-mono text-xs">
                                            {payment.receipt.number}
                                        </p>
                                        <p className="text-xl font-semibold">
                                            {formatAmount(
                                                payment.receipt.amount,
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(
                                                payment.receipt.issued_at,
                                            )}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Se emite al confirmar el pago.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {payment.patient && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="size-4" />
                                        Paciente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    <p className="font-medium">
                                        {payment.patient.first_name}{' '}
                                        {payment.patient.last_name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {payment.patient.code}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="mt-2"
                                    >
                                        <Link
                                            href={`/pacientes/${payment.patient.id}`}
                                        >
                                            Ver ficha
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {canManage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cambiar estado</CardTitle>
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

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground uppercase">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}
