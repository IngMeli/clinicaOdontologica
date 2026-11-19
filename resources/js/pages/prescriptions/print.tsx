import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import type { Prescription } from '@/types';

type Props = {
    prescription: Prescription;
};

export default function PrintPrescription({ prescription }: Props) {
    useEffect(() => {
        const timer = window.setTimeout(() => window.print(), 300);

        return () => window.clearTimeout(timer);
    }, []);

    const items = prescription.items ?? [];

    return (
        <>
            <Head title={`Imprimir ${prescription.code ?? 'receta'}`} />
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .prescription-print,
                    .prescription-print * { visibility: visible; }
                    .prescription-print {
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

                <div className="prescription-print mx-auto w-full max-w-3xl space-y-6 border bg-white p-8 text-black">
                    <header className="flex items-start justify-between gap-6 border-b pb-4">
                        <div>
                            <p className="text-xl font-semibold">
                                Clínica Odontológica
                            </p>
                            <p className="text-sm text-gray-600">
                                Receta médica
                            </p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-medium">
                                {prescription.code ??
                                    `Receta #${prescription.id}`}
                            </p>
                            <p className="text-gray-600">
                                {formatDateTime(prescription.issued_at)}
                            </p>
                        </div>
                    </header>

                    <section className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">
                                Paciente
                            </p>
                            <p className="font-medium">
                                {prescription.patient?.first_name}{' '}
                                {prescription.patient?.last_name}
                            </p>
                            <p className="text-gray-600">
                                {prescription.patient?.code}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">
                                Profesional
                            </p>
                            <p className="font-medium">
                                {prescription.doctor?.user?.name ??
                                    'Sin doctor'}
                            </p>
                            <p className="text-gray-600">
                                {prescription.doctor?.specialty?.name ??
                                    'Odontología'}
                            </p>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase">
                            Medicamentos
                        </p>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-2">Medicamento</th>
                                    <th className="py-2 pr-2">Dosis</th>
                                    <th className="py-2 pr-2">Frecuencia</th>
                                    <th className="py-2 pr-2">Duración</th>
                                    <th className="py-2 pr-2">Cant.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-gray-200 align-top"
                                    >
                                        <td className="py-2 pr-2">
                                            <p className="font-medium">
                                                {item.medication}
                                            </p>
                                            {item.presentation && (
                                                <p className="text-xs text-gray-600">
                                                    {item.presentation}
                                                </p>
                                            )}
                                            {item.instructions && (
                                                <p className="text-xs text-gray-600">
                                                    {item.instructions}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-2 pr-2">
                                            {item.dose ?? '—'}
                                        </td>
                                        <td className="py-2 pr-2">
                                            {item.frequency ?? '—'}
                                        </td>
                                        <td className="py-2 pr-2">
                                            {item.duration ?? '—'}
                                        </td>
                                        <td className="py-2 pr-2">
                                            {item.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {prescription.notes && (
                        <section className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase">
                                Indicaciones generales
                            </p>
                            <p className="text-sm whitespace-pre-line">
                                {prescription.notes}
                            </p>
                        </section>
                    )}

                    <footer className="grid gap-10 pt-12 text-center text-sm sm:grid-cols-2">
                        <div>
                            <div className="mx-auto w-48 border-t border-gray-400 pt-2">
                                Firma del profesional
                            </div>
                        </div>
                        <div>
                            <div className="mx-auto w-48 border-t border-gray-400 pt-2">
                                Sello
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
