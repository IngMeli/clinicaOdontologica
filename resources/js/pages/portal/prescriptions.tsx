import { Head } from '@inertiajs/react';
import { Pill } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import type { PortalPatient, PortalPrescription } from '@/types/portal';

type Props = {
    patient: PortalPatient;
    prescriptions: PortalPrescription[];
};

export default function PortalPrescriptions({ patient, prescriptions }: Props) {
    return (
        <>
            <Head title="Mis recetas" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Mis recetas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {patient.first_name} {patient.last_name} · Ficha{' '}
                        {patient.code}
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {prescriptions.map((prescription) => (
                        <Card key={prescription.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Pill className="size-4 text-primary" />
                                        <CardTitle>
                                            {prescription.code ??
                                                `Receta #${prescription.id}`}
                                        </CardTitle>
                                    </div>
                                    <Badge variant="outline">
                                        {formatDate(prescription.issued_at)}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    {prescription.doctor?.user?.name ??
                                        'Doctor'}
                                    {prescription.doctor?.specialty?.name
                                        ? ` · ${prescription.doctor.specialty.name}`
                                        : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {prescription.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-md border p-3 text-sm"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium">
                                                {item.medication}
                                            </span>
                                            <Badge variant="secondary">
                                                x{item.quantity}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {[
                                                item.presentation,
                                                item.dose,
                                                item.frequency,
                                                item.duration,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ') ||
                                                'Sin indicaciones'}
                                        </p>
                                        {item.instructions && (
                                            <p className="mt-1 text-xs">
                                                {item.instructions}
                                            </p>
                                        )}
                                    </div>
                                ))}
                                {prescription.notes && (
                                    <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                                        {prescription.notes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {prescriptions.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            Aún no tienes recetas registradas.
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

PortalPrescriptions.layout = {
    breadcrumbs: [
        {
            title: 'Mis recetas',
            href: '/portal/recetas',
        },
    ],
};
