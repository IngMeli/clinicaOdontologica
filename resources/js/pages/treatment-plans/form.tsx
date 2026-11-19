import { Link, useForm } from '@inertiajs/react';
import { AlertTriangle, Loader2, Save } from 'lucide-react';
import { useMemo } from 'react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDateInput } from '@/lib/format';
import { index, show, store, update } from '@/routes/treatment-plans';
import type {
    Consultation,
    DoctorRef,
    PatientRef,
    TreatmentPlan,
    TreatmentPlanFormData,
} from '@/types';

type Props = {
    patients: PatientRef[];
    doctors: DoctorRef[];
    consultations: Consultation[];
    currentDoctorId: number | null;
    isDoctor: boolean;
    plan?: TreatmentPlan;
    selectedPatientId?: number | null;
    selectedConsultationId?: number | null;
};

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

export function TreatmentPlanForm({
    patients,
    doctors,
    consultations,
    currentDoctorId,
    isDoctor,
    plan,
    selectedPatientId,
    selectedConsultationId,
}: Props) {
    const form = useForm<TreatmentPlanFormData>({
        patient_id: String(plan?.patient_id ?? selectedPatientId ?? ''),
        doctor_id: String(plan?.doctor_id ?? currentDoctorId ?? ''),
        consultation_id: String(
            plan?.consultation_id ?? selectedConsultationId ?? '',
        ),
        start_date: toDateInput(plan?.start_date ?? null),
        end_date: toDateInput(plan?.end_date ?? null),
        notes: plan?.notes ?? '',
    });

    const patientOptions = patients.map((patient) => ({
        value: patient.id,
        label: `${patient.last_name}, ${patient.first_name} — ${patient.code}`,
    }));

    const doctorOptions = doctors.map((doctor) => ({
        value: doctor.id,
        label: `${doctor.user?.name ?? `Doctor #${doctor.id}`}${
            doctor.specialty?.name ? ` — ${doctor.specialty.name}` : ''
        }`,
    }));

    const consultationOptions = useMemo(
        () =>
            consultations
                .filter(
                    (consultation) =>
                        !form.data.patient_id ||
                        consultation.patient_id ===
                            Number(form.data.patient_id),
                )
                .map((consultation) => ({
                    value: consultation.id,
                    label: `${consultation.code ?? `Consulta #${consultation.id}`} — ${consultation.patient?.first_name ?? ''} ${consultation.patient?.last_name ?? ''}`,
                })),
        [consultations, form.data.patient_id],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (plan) {
            form.put(update(plan.id).url, { preserveScroll: true });
            return;
        }

        form.post(store().url, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            {doctors.length === 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1">
                        <p className="font-medium">No hay doctores activos.</p>
                        <p className="text-muted-foreground">
                            Registra o activa un doctor antes de crear un plan
                            de tratamiento.
                        </p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Datos del plan</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="patient_id">Paciente *</Label>
                        <EntitySelect
                            id="patient_id"
                            value={form.data.patient_id}
                            options={patientOptions}
                            onChange={(event) =>
                                form.setData({
                                    ...form.data,
                                    patient_id: event.target.value,
                                    consultation_id: '',
                                })
                            }
                            placeholder="Selecciona un paciente"
                            aria-invalid={Boolean(form.errors.patient_id)}
                        />
                        <FieldError message={form.errors.patient_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="doctor_id">Doctor *</Label>
                        <EntitySelect
                            id="doctor_id"
                            value={form.data.doctor_id}
                            options={doctorOptions}
                            onChange={(event) =>
                                form.setData('doctor_id', event.target.value)
                            }
                            placeholder="Selecciona un doctor"
                            disabled={isDoctor}
                            aria-invalid={Boolean(form.errors.doctor_id)}
                        />
                        <FieldError message={form.errors.doctor_id} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="consultation_id">
                            Consulta asociada
                        </Label>
                        <EntitySelect
                            id="consultation_id"
                            value={form.data.consultation_id}
                            options={consultationOptions}
                            onChange={(event) => {
                                const value = event.target.value;
                                const consultation = consultations.find(
                                    (item) => String(item.id) === value,
                                );

                                form.setData({
                                    ...form.data,
                                    consultation_id: value,
                                    doctor_id: consultation
                                        ? String(consultation.doctor_id)
                                        : form.data.doctor_id,
                                });
                            }}
                            placeholder="Sin consulta asociada"
                            aria-invalid={Boolean(form.errors.consultation_id)}
                        />
                        <FieldError message={form.errors.consultation_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="start_date">Fecha de inicio</Label>
                        <Input
                            id="start_date"
                            type="date"
                            value={form.data.start_date}
                            onChange={(event) =>
                                form.setData('start_date', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.start_date)}
                        />
                        <FieldError message={form.errors.start_date} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="end_date">Fecha estimada de fin</Label>
                        <Input
                            id="end_date"
                            type="date"
                            value={form.data.end_date}
                            onChange={(event) =>
                                form.setData('end_date', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.end_date)}
                        />
                        <FieldError message={form.errors.end_date} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Notas</Label>
                        <textarea
                            id="notes"
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            rows={4}
                            className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            aria-invalid={Boolean(form.errors.notes)}
                        />
                        <FieldError message={form.errors.notes} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href={plan ? show(plan.id).url : index().url}>
                        Cancelar
                    </Link>
                </Button>
                <Button
                    type="submit"
                    disabled={form.processing || doctors.length === 0}
                >
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {plan ? 'Guardar cambios' : 'Crear plan'}
                </Button>
            </div>
        </form>
    );
}
