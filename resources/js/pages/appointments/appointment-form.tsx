import { Link, useForm } from '@inertiajs/react';
import { CalendarClock, Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDateTimeLocal } from '@/lib/format';
import { index, store, update } from '@/routes/appointments';
import type {
    AppointmentFormData,
    ClinicAppointment,
    DoctorRef,
    PatientRef,
} from '@/types';

type Props = {
    patients: PatientRef[];
    doctors: DoctorRef[];
    appointment?: ClinicAppointment;
    defaults?: {
        patient_id: number | null;
        date: string;
    };
};

const durationOptions = [15, 30, 45, 60, 90, 120].map((minutes) => ({
    value: String(minutes),
    label: `${minutes} minutos`,
}));

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

function defaultScheduledAt(date?: string): string {
    const now = new Date();

    if (date) {
        const selected = new Date(`${date}T09:00:00`);

        if (!Number.isNaN(selected.getTime())) {
            if (
                selected >= now ||
                selected.toDateString() !== now.toDateString()
            ) {
                return toDateTimeLocal(selected.toISOString());
            }
        }
    }

    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setMinutes(Math.ceil((next.getMinutes() + 1) / 30) * 30);

    return toDateTimeLocal(next.toISOString());
}

export function AppointmentForm({
    patients,
    doctors,
    appointment,
    defaults,
}: Props) {
    const initialDateTime = appointment
        ? toDateTimeLocal(appointment.scheduled_at)
        : defaultScheduledAt(defaults?.date);

    const form = useForm<AppointmentFormData>({
        patient_id: String(
            appointment?.patient_id ?? defaults?.patient_id ?? '',
        ),
        doctor_id: String(appointment?.doctor_id ?? ''),
        scheduled_at: initialDateTime,
        duration_minutes: String(appointment?.duration_minutes ?? 30),
        reason: appointment?.reason ?? '',
        notes: appointment?.notes ?? '',
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

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (appointment) {
            form.put(update(appointment.id).url, { preserveScroll: true });
            return;
        }

        form.post(store().url, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarClock className="size-4 text-primary" />
                        Datos de la cita
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="patient_id">Paciente *</Label>
                        <EntitySelect
                            id="patient_id"
                            value={form.data.patient_id}
                            options={patientOptions}
                            onChange={(event) =>
                                form.setData('patient_id', event.target.value)
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
                            aria-invalid={Boolean(form.errors.doctor_id)}
                        />
                        <FieldError message={form.errors.doctor_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="scheduled_at">Fecha y hora *</Label>
                        <Input
                            id="scheduled_at"
                            type="datetime-local"
                            value={form.data.scheduled_at}
                            onChange={(event) =>
                                form.setData('scheduled_at', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.scheduled_at)}
                        />
                        <FieldError message={form.errors.scheduled_at} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration_minutes">Duración *</Label>
                        <EntitySelect
                            id="duration_minutes"
                            value={form.data.duration_minutes}
                            options={durationOptions}
                            onChange={(event) =>
                                form.setData(
                                    'duration_minutes',
                                    event.target.value,
                                )
                            }
                            placeholder="Selecciona duración"
                            aria-invalid={Boolean(form.errors.duration_minutes)}
                        />
                        <FieldError message={form.errors.duration_minutes} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="reason">Motivo de la cita</Label>
                        <Input
                            id="reason"
                            value={form.data.reason}
                            onChange={(event) =>
                                form.setData('reason', event.target.value)
                            }
                            placeholder="Ej. Control, limpieza, dolor dental"
                            aria-invalid={Boolean(form.errors.reason)}
                        />
                        <FieldError message={form.errors.reason} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Notas internas</Label>
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
                    <Link
                        href={
                            appointment
                                ? `/agenda/${appointment.id}`
                                : index().url
                        }
                    >
                        Cancelar
                    </Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {appointment ? 'Guardar cambios' : 'Programar cita'}
                </Button>
            </div>
        </form>
    );
}
