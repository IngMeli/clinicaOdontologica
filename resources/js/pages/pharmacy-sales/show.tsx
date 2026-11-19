import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    Printer,
    ReceiptText,
    ShoppingBag,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAmount, formatDateTime } from '@/lib/format';
import type { PharmacySale } from '@/types';

type Props = {
    sale: PharmacySale;
    canCancel: boolean;
};

export default function PharmacySaleShow({ sale, canCancel }: Props) {
    return (
        <>
            <Head title={`Venta ${sale.sale_number}`} />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Farmacia"
                    title={sale.sale_number}
                    description={`${formatDateTime(sale.sold_at)} · ${sale.seller?.name ?? 'Usuario'}`}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/ventas-farmacia">
                                    <ArrowLeft className="size-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link
                                    href={`/ventas-farmacia/${sale.id}/imprimir`}
                                >
                                    <Printer className="size-4" />
                                    Imprimir
                                </Link>
                            </Button>
                            {canCancel && (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                '¿Anular esta venta? El stock será restituido.',
                                            )
                                        ) {
                                            router.patch(
                                                `/ventas-farmacia/${sale.id}/anular`,
                                            );
                                        }
                                    }}
                                >
                                    <Ban className="size-4" />
                                    Anular venta
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="size-4" />
                                    Productos
                                </CardTitle>
                                <StatusBadge status={sale.status} />
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="pb-2">Producto</th>
                                            <th className="pb-2">Lote</th>
                                            <th className="pb-2 text-right">
                                                Cantidad
                                            </th>
                                            <th className="pb-2 text-right">
                                                Precio
                                            </th>
                                            <th className="pb-2 text-right">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sale.items?.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-border/60"
                                            >
                                                <td className="py-2">
                                                    <p className="font-medium">
                                                        {item.product?.name ??
                                                            'Producto'}
                                                    </p>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        {item.product?.sku}
                                                    </p>
                                                </td>
                                                <td className="py-2 text-muted-foreground">
                                                    {item.batch?.lot_number ??
                                                        '—'}
                                                </td>
                                                <td className="py-2 text-right">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-2 text-right">
                                                    {formatAmount(
                                                        item.unit_price,
                                                    )}
                                                </td>
                                                <td className="py-2 text-right font-medium">
                                                    {formatAmount(
                                                        item.subtotal,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span>
                                            {formatAmount(sale.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Descuento
                                        </span>
                                        <span>
                                            -{formatAmount(sale.discount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 text-base font-semibold">
                                        <span>Total</span>
                                        <span>{formatAmount(sale.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {sale.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notas</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    {sale.notes}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <p className="font-medium">
                                    {sale.patient
                                        ? `${sale.patient.first_name} ${sale.patient.last_name}`
                                        : 'Consumidor final'}
                                </p>
                                {sale.patient && (
                                    <p className="text-muted-foreground">
                                        {sale.patient.code}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ReceiptText className="size-4" />
                                    Comprobantes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {sale.receipts?.length ? (
                                    sale.receipts.map((receipt) => (
                                        <div
                                            key={receipt.id}
                                            className="rounded border p-3"
                                        >
                                            <p className="font-mono text-xs">
                                                {receipt.number}
                                            </p>
                                            <p className="font-medium">
                                                {formatAmount(receipt.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(
                                                    receipt.issued_at,
                                                )}{' '}
                                                · {receipt.status}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">
                                        Sin comprobante emitido.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
