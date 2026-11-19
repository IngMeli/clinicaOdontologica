import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { formatAmount, formatDateTime } from '@/lib/format';
import type { PharmacySale } from '@/types';

type Props = {
    sale: PharmacySale;
};

export default function PharmacySalePrint({ sale }: Props) {
    useEffect(() => {
        const timer = window.setTimeout(() => window.print(), 300);

        return () => window.clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title={`Imprimir ${sale.sale_number}`} />
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .sale-print,
                    .sale-print * { visibility: visible; }
                    .sale-print {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        padding: 0;
                        background: white;
                        color: black;
                    }
                    .no-print { display: none !important; }
                    @page { size: A4; margin: 18mm; }
                }
            `}</style>

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="no-print flex justify-end">
                    <Button type="button" onClick={() => window.print()}>
                        <Printer className="size-4" />
                        Imprimir
                    </Button>
                </div>

                <div className="sale-print mx-auto w-full max-w-3xl space-y-6 border bg-white p-8 text-black">
                    <header className="flex items-start justify-between gap-6 border-b pb-4">
                        <div>
                            <p className="text-xl font-semibold">
                                Clínica Odontológica
                            </p>
                            <p className="text-sm text-gray-600">
                                Comprobante de venta de farmacia
                            </p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-medium">{sale.sale_number}</p>
                            <p className="text-gray-600">
                                {formatDateTime(sale.sold_at)}
                            </p>
                        </div>
                    </header>

                    <section className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">
                                Cliente
                            </p>
                            <p className="font-medium">
                                {sale.patient
                                    ? `${sale.patient.first_name} ${sale.patient.last_name}`
                                    : 'Consumidor final'}
                            </p>
                            <p className="text-gray-600">
                                {sale.patient?.code ?? '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">
                                Vendedor
                            </p>
                            <p className="font-medium">
                                {sale.seller?.name ?? '—'}
                            </p>
                        </div>
                    </section>

                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2 pr-2">Producto</th>
                                <th className="py-2 pr-2">Lote</th>
                                <th className="py-2 pr-2 text-right">Cant.</th>
                                <th className="py-2 pr-2 text-right">Precio</th>
                                <th className="py-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items?.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-gray-200"
                                >
                                    <td className="py-2 pr-2">
                                        {item.product?.name ?? 'Producto'}
                                    </td>
                                    <td className="py-2 pr-2">
                                        {item.batch?.lot_number ?? '—'}
                                    </td>
                                    <td className="py-2 pr-2 text-right">
                                        {item.quantity}
                                    </td>
                                    <td className="py-2 pr-2 text-right">
                                        {formatAmount(item.unit_price)}
                                    </td>
                                    <td className="py-2 text-right">
                                        {formatAmount(item.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatAmount(sale.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Descuento</span>
                            <span>-{formatAmount(sale.discount)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-base font-semibold">
                            <span>Total</span>
                            <span>{formatAmount(sale.total)}</span>
                        </div>
                    </div>

                    {sale.notes && (
                        <section className="space-y-1 border-t pt-4">
                            <p className="text-xs text-gray-500 uppercase">
                                Notas
                            </p>
                            <p className="text-sm whitespace-pre-line">
                                {sale.notes}
                            </p>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}
