import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pill, Printer, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatDateTime } from '@/lib/format';
import { index, print } from '@/routes/prescriptions';
import type { Prescription } from '@/types';

type Props = {
    prescription: Prescription;
};

export default function PrescriptionShow({ prescription }: Props) {
    const items = prescription.items ?? [];

    return (
        <>
            <Head title={prescription.code ?? 'Receta'} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow={prescription.code ?? 'Receta'}
                    title="Receta médica"
                    description={`Emitida el ${formatDateTime(prescription.issued_at)}`}
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <Link href={index().url}>
                                    <ArrowLeft className="size-4" />
                                    Volver
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link
                                    href={print(prescription.id).url}
                                    target="_blank"
                                >
                                    <Printer className="size-4" />
                                    Imprimir
                                </Link>
                            </Button>
                        </>
                    }
                />

                <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserRound className="size-4 text-primary" />
                                Datos del paciente
                            </CardTitle>
                            <CardDescription>
                                Identificación y profesional que prescribe.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Paciente
                                </p>
                                <Link
                                    href={`/pacientes/${prescription.patient_id}`}
                                    className="font-medium hover:underline"
                                >
                                    {prescription.patient?.first_name}{' '}
                                    {prescription.patient?.last_name}
                                </Link>
                                <p className="font-mono text-xs text-muted-foreground">
                                    {prescription.patient?.code}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Doctor
                                </p>
                                <p className="font-medium">
                                    {prescription.doctor?.user?.name ??
                                        'Sin doctor'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {prescription.doctor?.specialty?.name ??
                                        'Sin especialidad'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Consulta
                                </p>
                                {prescription.consultation_id ? (
                                    <Link
                                        href={`/consultas/${prescription.consultation_id}`}
                                        className="text-sm font-medium hover:underline"
                                    >
                                        {prescription.consultation?.code ??
                                            `Consulta #${prescription.consultation_id}`}
                                    </Link>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Sin consulta asociada
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    Fecha de emisión
                                </p>
                                <p className="text-sm font-medium">
                                    {formatDateTime(prescription.issued_at)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pill className="size-4 text-primary" />
                                Indicaciones generales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-line">
                                {prescription.notes ??
                                    'Sin indicaciones generales registradas.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Medicamentos</CardTitle>
                        <CardDescription>
                            {items.length} medicamento
                            {items.length === 1 ? '' : 's'} indicado
                            {items.length === 1 ? '' : 's'}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b text-left text-xs text-muted-foreground">
                                    <tr>
                                        <th className="py-2 pr-3 font-medium">
                                            Medicamento
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Presentación
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Dosis
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Frecuencia
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Duración
                                        </th>
                                        <th className="py-2 pr-3 font-medium">
                                            Cant.
                                        </th>
                                        <th className="py-2 pr-0 font-medium">
                                            Instrucciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="py-2 pr-3 font-medium">
                                                {item.medication}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {item.presentation ?? '—'}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {item.dose ?? '—'}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {item.frequency ?? '—'}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {item.duration ?? '—'}
                                            </td>
                                            <td className="py-2 pr-3">
                                                {item.quantity}
                                            </td>
                                            <td className="py-2 pr-0">
                                                {item.instructions ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
