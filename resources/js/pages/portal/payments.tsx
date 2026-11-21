import { Head } from '@inertiajs/react';
import { CreditCard, QrCode, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
    PortalPatient,
    PortalPayment,
    PortalPaymentPlan,
} from '@/types/portal';

type Props = {
    patient: PortalPatient;
    paymentPlans: PortalPaymentPlan[];
    payments: PortalPayment[];
};

export default function PortalPayments({
    patient,
    paymentPlans,
    payments,
}: Props) {
    const pendingQrPayments = payments.filter(
        (payment) => payment.qr_payload && payment.status === 'pendiente',
    );

    return (
        <>
            <Head title="Mis pagos" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Mis pagos
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {patient.first_name} {patient.last_name} · Ficha{' '}
                        {patient.code}
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {paymentPlans.map((plan) => (
                        <Card key={plan.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle>{plan.concept}</CardTitle>
                                    <Badge variant="outline">
                                        {statusLabel(plan.status)}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    {plan.installments_count} cuotas ·{' '}
                                    {plan.frequency} · Total{' '}
                                    {formatAmount(plan.total)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="mb-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Pagado
                                        </span>
                                        <span className="font-medium">
                                            {formatAmount(plan.paid_amount)} /{' '}
                                            {formatAmount(plan.total)}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{
                                                width: `${Math.min((Number(plan.paid_amount) / Number(plan.total)) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {plan.installments.map((installment) => (
                                    <div
                                        key={installment.id}
                                        className="flex items-center justify-between gap-3 rounded-md border p-2.5 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                Cuota {installment.number}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Vence{' '}
                                                {formatDate(
                                                    installment.due_date,
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {formatAmount(
                                                    installment.amount,
                                                )}
                                            </p>
                                            <Badge
                                                variant={
                                                    installment.status ===
                                                    'pagado'
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                            >
                                                {statusLabel(
                                                    installment.status,
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {pendingQrPayments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="size-4" />
                                Pagos QR pendientes
                            </CardTitle>
                            <CardDescription>
                                Escanea el código para completar el pago.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {pendingQrPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="space-y-2 rounded-lg border p-3 text-center"
                                >
                                    <div className="flex justify-center rounded-md bg-white p-3">
                                        <QRCodeSVG
                                            value={payment.qr_payload ?? ''}
                                            size={144}
                                            level="M"
                                        />
                                    </div>
                                    <p className="font-mono text-xs">
                                        {payment.reference ?? `#${payment.id}`}
                                    </p>
                                    <p className="font-semibold">
                                        {formatAmount(payment.amount)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Pagos registrados</CardTitle>
                        <CardDescription>
                            Pagos únicos y cuotas conciliadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-3">Referencia</th>
                                    <th className="py-2 pr-3">Fecha</th>
                                    <th className="py-2 pr-3">Método</th>
                                    <th className="py-2 pr-3">Monto</th>
                                    <th className="py-2 pr-3">Estado</th>
                                    <th className="py-2">Recibo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="border-b border-border/60 last:border-0"
                                    >
                                        <td className="py-2 pr-3 font-mono text-xs">
                                            {payment.reference ??
                                                `#${payment.id}`}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {formatDate(payment.paid_at)}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {payment.method?.name ??
                                                'No especificado'}
                                        </td>
                                        <td className="py-2 pr-3 font-medium">
                                            {formatAmount(payment.amount)}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <Badge
                                                variant={
                                                    payment.status === 'pagado'
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                            >
                                                {statusLabel(payment.status)}
                                            </Badge>
                                        </td>
                                        <td className="py-2 font-mono text-xs">
                                            {payment.receipt?.number ?? '—'}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-6 text-center text-muted-foreground"
                                        >
                                            Sin pagos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pasarela de pago</CardTitle>
                        <CardDescription>
                            Los pagos electrónicos se procesan mediante la
                            pasarela simulada del proyecto.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <CreditCard className="size-5" />
                        <span>
                            Puedes pagar con tarjeta, transferencia o QR desde
                            el módulo de pagos del sistema.
                        </span>
                        <Wallet className="ml-auto size-5" />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PortalPayments.layout = {
    breadcrumbs: [
        {
            title: 'Mis pagos',
            href: '/portal/pagos',
        },
    ],
};
