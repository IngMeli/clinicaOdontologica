import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDateInput } from '@/lib/format';
import type { PatientRef, PaymentPlanFormData, TreatmentPlan } from '@/types';

type Props = {
    patients: PatientRef[];
    treatmentPlans: TreatmentPlan[];
    selectedPatientId: number | null;
    selectedTreatmentPlanId: number | null;
};

const frequencyOptions = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'quincenal', label: 'Quincenal' },
    { value: 'semanal', label: 'Semanal' },
];

export default function PaymentPlanCreate({
    patients,
    treatmentPlans,
    selectedPatientId,
    selectedTreatmentPlanId,
}: Props) {
    const form = useForm<PaymentPlanFormData>({
        patient_id: selectedPatientId ? String(selectedPatientId) : '',
        treatment_plan_id: selectedTreatmentPlanId
            ? String(selectedTreatmentPlanId)
            : '',
        concept: '',
        total: '',
        installments_count: '1',
        frequency: 'mensual',
        start_date: toDateInput(new Date().toISOString()),
        notes: '',
    });

    const selectTreatmentPlan = (value: string) => {
        const plan = treatmentPlans.find((item) => String(item.id) === value);

        if (!plan) {
            form.setData('treatment_plan_id', value);
            return;
        }

        form.setData((data) => ({
            ...data,
            treatment_plan_id: value,
            patient_id: plan.patient_id
                ? String(plan.patient_id)
                : data.patient_id,
            concept: data.concept || `Tratamiento ${plan.code ?? ''}`.trim(),
            total: String(plan.total),
        }));
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/pagos/planes');
    };

    return (
        <>
            <Head title="Nuevo plan de pago" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Finanzas"
                    title="Nuevo plan de pago"
                    description="Divide el total en cuotas con vencimientos automáticos."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/pagos/planes">
                                <ArrowLeft className="size-4" />
                                Volver
                            </Link>
                        </Button>
                    }
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Datos del plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="patient_id">Paciente *</Label>
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
                                    placeholder="Selecciona paciente"
                                />
                                {form.errors.patient_id && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.patient_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="treatment_plan_id">
                                    Plan de tratamiento
                                </Label>
                                <EntitySelect
                                    id="treatment_plan_id"
                                    value={form.data.treatment_plan_id}
                                    onChange={(event) =>
                                        selectTreatmentPlan(event.target.value)
                                    }
                                    options={treatmentPlans.map((plan) => ({
                                        value: plan.id,
                                        label: `${plan.code ?? `#${plan.id}`} · ${plan.patient?.first_name ?? ''} ${plan.patient?.last_name ?? ''}`,
                                    }))}
                                    placeholder="Sin plan de tratamiento"
                                />
                                {form.errors.treatment_plan_id && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.treatment_plan_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="concept">Concepto *</Label>
                                <Input
                                    id="concept"
                                    value={form.data.concept}
                                    onChange={(event) =>
                                        form.setData(
                                            'concept',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.concept && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.concept}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total">Total *</Label>
                                <Input
                                    id="total"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.data.total}
                                    onChange={(event) =>
                                        form.setData(
                                            'total',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.total && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.total}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="installments_count">
                                    Número de cuotas *
                                </Label>
                                <Input
                                    id="installments_count"
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={form.data.installments_count}
                                    onChange={(event) =>
                                        form.setData(
                                            'installments_count',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.installments_count && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.installments_count}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frecuencia *</Label>
                                <EntitySelect
                                    id="frequency"
                                    value={form.data.frequency}
                                    onChange={(event) =>
                                        form.setData(
                                            'frequency',
                                            event.target.value,
                                        )
                                    }
                                    options={frequencyOptions}
                                />
                                {form.errors.frequency && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.frequency}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="start_date">
                                    Fecha de inicio *
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={form.data.start_date}
                                    onChange={(event) =>
                                        form.setData(
                                            'start_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.start_date && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.start_date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes">Notas</Label>
                                <textarea
                                    id="notes"
                                    value={form.data.notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>

                            <div className="flex justify-end gap-2 md:col-span-2">
                                <Button variant="outline" asChild>
                                    <Link href="/pagos/planes">Cancelar</Link>
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
                                    Crear plan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
