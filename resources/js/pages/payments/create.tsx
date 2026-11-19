import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDateTimeLocal } from '@/lib/format';
import type { Option, PatientRef, PaymentFormData } from '@/types';

type Props = {
    patients: PatientRef[];
    types: Option[];
    statuses: Option[];
};

export default function PaymentCreate({ patients, types, statuses }: Props) {
    const form = useForm<PaymentFormData>({
        patient_id: '',
        type: 'tratamiento',
        amount: '',
        status: 'pagado',
        paid_at: toDateTimeLocal(new Date().toISOString()),
        reference: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/pagos');
    };

    return (
        <>
            <Head title="Registrar pago" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Finanzas"
                    title="Registrar pago"
                    description="Los pagos marcados como pagados generan comprobante automáticamente."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/pagos">
                                <ArrowLeft className="size-4" />
                                Volver
                            </Link>
                        </Button>
                    }
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Datos del pago</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="patient_id">Paciente</Label>
                                <EntitySelect
                                    id="patient_id"
                                    value={form.data.patient_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'patient_id',
                                            event.target.value,
                                        )
                                    }
                                    options={patients.map((patient) => ({
                                        value: patient.id,
                                        label: `${patient.code} · ${patient.first_name} ${patient.last_name}`,
                                    }))}
                                    placeholder="Pago sin paciente"
                                />
                                {form.errors.patient_id && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.patient_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo *</Label>
                                <EntitySelect
                                    id="type"
                                    value={form.data.type}
                                    onChange={(event) =>
                                        form.setData('type', event.target.value)
                                    }
                                    options={types}
                                />
                                {form.errors.type && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.type}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Monto *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.data.amount}
                                    onChange={(event) =>
                                        form.setData(
                                            'amount',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.amount && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.amount}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Estado *</Label>
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
                                {form.errors.status && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.status}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paid_at">Fecha de pago</Label>
                                <Input
                                    id="paid_at"
                                    type="datetime-local"
                                    value={form.data.paid_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'paid_at',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.paid_at && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.paid_at}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reference">Referencia</Label>
                                <Input
                                    id="reference"
                                    value={form.data.reference}
                                    onChange={(event) =>
                                        form.setData(
                                            'reference',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Se genera automáticamente"
                                />
                                {form.errors.reference && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.reference}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 md:col-span-2">
                                <Button variant="outline" asChild>
                                    <Link href="/pagos">Cancelar</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    {form.processing ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Save className="size-4" />
                                    )}
                                    Registrar pago
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
