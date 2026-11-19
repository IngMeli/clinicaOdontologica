import { Link, useForm } from '@inertiajs/react';
import { AlertTriangle, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDateTimeLocal } from '@/lib/format';
import { index, store } from '@/routes/prescriptions';
import type {
    Consultation,
    DoctorRef,
    PatientRef,
    PrescriptionFormData,
    PrescriptionItemFormData,
} from '@/types';

type Props = {
    patients: PatientRef[];
    doctors: DoctorRef[];
    consultations: Consultation[];
    currentDoctorId: number | null;
    isDoctor: boolean;
    selectedPatientId?: number | null;
    selectedConsultationId?: number | null;
};

const emptyItem = (): PrescriptionItemFormData => ({
    medication: '',
    presentation: '',
    dose: '',
    frequency: '',
    duration: '',
    quantity: '1',
    instructions: '',
});

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

export function PrescriptionForm({
    patients,
    doctors,
    consultations,
    currentDoctorId,
    isDoctor,
    selectedPatientId,
    selectedConsultationId,
}: Props) {
    const form = useForm<PrescriptionFormData>({
        patient_id: String(selectedPatientId ?? ''),
        doctor_id: String(currentDoctorId ?? ''),
        consultation_id: String(selectedConsultationId ?? ''),
        issued_at: toDateTimeLocal(new Date().toISOString()),
        notes: '',
        items: [emptyItem()],
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

    const setItem = (
        index: number,
        field: keyof PrescriptionItemFormData,
        value: string,
    ) => {
        const items = form.data.items.map((item, itemIndex) =>
            itemIndex === index ? { ...item, [field]: value } : item,
        );

        form.setData('items', items);
    };

    const addItem = () => {
        form.setData('items', [...form.data.items, emptyItem()]);
    };

    const removeItem = (index: number) => {
        if (form.data.items.length === 1) {
            return;
        }

        form.setData(
            'items',
            form.data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
                            Registra o activa un doctor antes de emitir una
                            receta.
                        </p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Datos de la receta</CardTitle>
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

                    <div className="space-y-2">
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
                        <Label htmlFor="issued_at">Fecha de emisión *</Label>
                        <Input
                            id="issued_at"
                            type="datetime-local"
                            value={form.data.issued_at}
                            onChange={(event) =>
                                form.setData('issued_at', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.issued_at)}
                        />
                        <FieldError message={form.errors.issued_at} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Indicaciones generales</Label>
                        <textarea
                            id="notes"
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            rows={3}
                            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            aria-invalid={Boolean(form.errors.notes)}
                        />
                        <FieldError message={form.errors.notes} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle>Medicamentos</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addItem}
                        >
                            <Plus className="size-4" />
                            Agregar medicamento
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {form.data.items.map((item, index) => (
                        <div
                            key={index}
                            className="space-y-3 rounded-lg border p-3"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    Medicamento {index + 1}
                                </p>
                                {form.data.items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        aria-label="Quitar medicamento"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-1 xl:col-span-2">
                                    <Label htmlFor={`medication-${index}`}>
                                        Medicamento *
                                    </Label>
                                    <Input
                                        id={`medication-${index}`}
                                        value={item.medication}
                                        onChange={(event) =>
                                            setItem(
                                                index,
                                                'medication',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ej. Amoxicilina 500 mg"
                                        aria-invalid={Boolean(
                                            form.errors[
                                                `items.${index}.medication`
                                            ],
                                        )}
                                    />
                                    <FieldError
                                        message={
                                            form.errors[
                                                `items.${index}.medication`
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor={`presentation-${index}`}>
                                        Presentación
                                    </Label>
                                    <Input
                                        id={`presentation-${index}`}
                                        value={item.presentation}
                                        onChange={(event) =>
                                            setItem(
                                                index,
                                                'presentation',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Tabletas, jarabe..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor={`dose-${index}`}>
                                        Dosis
                                    </Label>
                                    <Input
                                        id={`dose-${index}`}
                                        value={item.dose}
                                        onChange={(event) =>
                                            setItem(
                                                index,
                                                'dose',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ej. 1 tableta"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor={`frequency-${index}`}>
                                        Frecuencia
                                    </Label>
                                    <Input
                                        id={`frequency-${index}`}
                                        value={item.frequency}
                                        onChange={(event) =>
                                            setItem(
                                                index,
                                                'frequency',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Cada 8 horas"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor={`duration-${index}`}>
                                        Duración
                                    </Label>
                                    <Input
                                        id={`duration-${index}`}
                                        value={item.duration}
                                        onChange={(event) =>
                                            setItem(
                                                index,
                                                'duration',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="7 días"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor={`quantity-${index}`}>
                                        Cantidad *
                                    </Label>
                                    <Input
                                        id={`quantity-${index}`}
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(event) =>
                                            setItem(
                                                index,
                                                'quantity',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            form.errors[
                                                `items.${index}.quantity`
                                            ],
                                        )}
                                    />
                                    <FieldError
                                        message={
                                            form.errors[
                                                `items.${index}.quantity`
                                            ]
                                        }
                                    />
                                </div>

                                <div className="space-y-1 xl:col-span-2">
                                    <Label htmlFor={`instructions-${index}`}>
                                        Instrucciones
                                    </Label>
                                    <Input
                                        id={`instructions-${index}`}
                                        value={item.instructions}
                                        onChange={(event) =>
                                            setItem(
                                                index,
                                                'instructions',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Indicaciones para el paciente"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <FieldError message={form.errors.items} />
                </CardContent>
            </Card>

            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href={index().url}>Cancelar</Link>
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
                    Emitir receta
                </Button>
            </div>
        </form>
    );
}
