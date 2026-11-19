import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarClock,
    Loader2,
    Pencil,
    Plus,
    Save,
    Stethoscope,
    ToggleLeft,
    ToggleRight,
    Trash2,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    AdminDoctor,
    AdminSpecialty,
    DoctorSchedule,
    Option,
} from '@/types';

type Props = {
    specialties: AdminSpecialty[];
    doctors: AdminDoctor[];
    schedules: DoctorSchedule[];
    weekdays: Option[];
    canManage: boolean;
};

type SpecialtyFormData = {
    name: string;
    description: string;
    color: string;
};

type ScheduleFormData = {
    doctor_id: string;
    weekday: string;
    start_time: string;
    end_time: string;
    slot_minutes: string;
    room: string;
    active: boolean;
};

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

function toTimeInput(value: string): string {
    return value.slice(0, 5);
}

export default function AdminSpecialtiesIndex({
    specialties,
    doctors,
    schedules,
    weekdays,
    canManage,
}: Props) {
    return (
        <>
            <Head title="Especialidades y horarios" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Administración"
                    title="Especialidades y horarios"
                    description="Catálogo de especialidades, doctores y disponibilidad semanal."
                />

                {canManage && <CreateSpecialty />}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="size-4" />
                            Especialidades
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {specialties.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No hay especialidades registradas.
                            </p>
                        )}
                        {specialties.map((specialty) => (
                            <SpecialtyRow
                                key={specialty.id}
                                specialty={specialty}
                                canManage={canManage}
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Doctores</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-3">Doctor</th>
                                    <th className="py-2 pr-3">Especialidad</th>
                                    <th className="py-2 pr-3">Matrícula</th>
                                    <th className="py-2 pr-3">Estado</th>
                                    <th className="py-2 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map((doctor) => (
                                    <tr
                                        key={doctor.id}
                                        className="border-b border-border/60 last:border-0"
                                    >
                                        <td className="py-2 pr-3">
                                            {doctor.user?.name ??
                                                `Doctor #${doctor.id}`}
                                        </td>
                                        <td className="py-2 pr-3">
                                            {doctor.specialty?.name ?? '—'}
                                        </td>
                                        <td className="py-2 pr-3 font-mono text-xs">
                                            {doctor.license_number || '—'}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <StatusBadge
                                                status={
                                                    doctor.active
                                                        ? 'activo'
                                                        : 'inactivo'
                                                }
                                            />
                                        </td>
                                        <td className="py-2 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/usuarios/${doctor.user_id}/editar`}
                                                >
                                                    <Pencil className="size-4" />
                                                    Editar usuario
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {doctors.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-6 text-center text-muted-foreground"
                                        >
                                            No hay doctores registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {canManage && (
                    <CreateSchedule doctors={doctors} weekdays={weekdays} />
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarClock className="size-4" />
                            Horarios semanales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {schedules.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No hay horarios registrados.
                            </p>
                        )}
                        {schedules.map((schedule) => (
                            <ScheduleRow
                                key={schedule.id}
                                schedule={schedule}
                                doctors={doctors}
                                weekdays={weekdays}
                                canManage={canManage}
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function CreateSpecialty() {
    const form = useForm<SpecialtyFormData>({
        name: '',
        description: '',
        color: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/admin/especialidades', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Nueva especialidad
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={submit}
                    className="grid gap-3 md:grid-cols-[1fr_2fr_10rem_auto]"
                >
                    <div className="space-y-1">
                        <Label htmlFor="specialty-name">Nombre *</Label>
                        <Input
                            id="specialty-name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.name)}
                        />
                        <FieldError message={form.errors.name} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="specialty-description">
                            Descripción
                        </Label>
                        <Input
                            id="specialty-description"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                        />
                        <FieldError message={form.errors.description} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="specialty-color">Color</Label>
                        <Input
                            id="specialty-color"
                            value={form.data.color}
                            onChange={(event) =>
                                form.setData('color', event.target.value)
                            }
                            placeholder="#0ea5e9"
                        />
                        <FieldError message={form.errors.color} />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            Registrar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function SpecialtyRow({
    specialty,
    canManage,
}: {
    specialty: AdminSpecialty;
    canManage: boolean;
}) {
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <EditSpecialty
                specialty={specialty}
                onClose={() => setEditing(false)}
            />
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
            <div>
                <p className="flex items-center gap-2 font-medium">
                    <span
                        className="inline-block size-3 rounded-full"
                        style={{
                            backgroundColor: specialty.color ?? '#94a3b8',
                        }}
                    />
                    {specialty.name}
                </p>
                <p className="text-xs text-muted-foreground">
                    {specialty.description || 'Sin descripción'} ·{' '}
                    {specialty.doctors_count ?? 0} doctor(es)
                </p>
            </div>
            <div className="flex items-center gap-1">
                <StatusBadge
                    status={specialty.active ? 'activo' : 'inactivo'}
                />
                {canManage && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Editar especialidad"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={
                                specialty.active
                                    ? 'Desactivar especialidad'
                                    : 'Activar especialidad'
                            }
                            onClick={() =>
                                router.patch(
                                    `/admin/especialidades/${specialty.id}/estado`,
                                    { active: !specialty.active },
                                    { preserveScroll: true },
                                )
                            }
                        >
                            {specialty.active ? (
                                <ToggleRight className="size-4 text-emerald-600" />
                            ) : (
                                <ToggleLeft className="size-4 text-muted-foreground" />
                            )}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function EditSpecialty({
    specialty,
    onClose,
}: {
    specialty: AdminSpecialty;
    onClose: () => void;
}) {
    const form = useForm<SpecialtyFormData>({
        name: specialty.name,
        description: specialty.description ?? '',
        color: specialty.color ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/admin/especialidades/${specialty.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <form
            onSubmit={submit}
            className="grid gap-3 rounded-md border border-primary/30 p-3 md:grid-cols-[1fr_2fr_10rem_auto]"
        >
            <div className="space-y-1">
                <Label htmlFor={`specialty-name-${specialty.id}`}>
                    Nombre *
                </Label>
                <Input
                    id={`specialty-name-${specialty.id}`}
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.name)}
                />
                <FieldError message={form.errors.name} />
            </div>
            <div className="space-y-1">
                <Label htmlFor={`specialty-description-${specialty.id}`}>
                    Descripción
                </Label>
                <Input
                    id={`specialty-description-${specialty.id}`}
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor={`specialty-color-${specialty.id}`}>Color</Label>
                <Input
                    id={`specialty-color-${specialty.id}`}
                    value={form.data.color}
                    onChange={(event) =>
                        form.setData('color', event.target.value)
                    }
                />
            </div>
            <div className="flex items-end gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>
                    Guardar
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    );
}

function CreateSchedule({
    doctors,
    weekdays,
}: {
    doctors: AdminDoctor[];
    weekdays: Option[];
}) {
    const form = useForm<ScheduleFormData>({
        doctor_id: '',
        weekday: '1',
        start_time: '08:00',
        end_time: '12:00',
        slot_minutes: '30',
        room: '',
        active: true,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/admin/especialidades/horarios', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Nuevo horario
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <ScheduleFields
                        form={form}
                        doctors={doctors}
                        weekdays={weekdays}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            Registrar horario
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function ScheduleRow({
    schedule,
    doctors,
    weekdays,
    canManage,
}: {
    schedule: DoctorSchedule;
    doctors: AdminDoctor[];
    weekdays: Option[];
    canManage: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const weekday =
        weekdays.find((day) => Number(day.value) === schedule.weekday)?.label ??
        `Día ${schedule.weekday}`;

    if (editing) {
        return (
            <EditSchedule
                schedule={schedule}
                doctors={doctors}
                weekdays={weekdays}
                onClose={() => setEditing(false)}
            />
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
            <div>
                <p className="font-medium">
                    {schedule.doctor?.user?.name ?? 'Doctor'} · {weekday}
                </p>
                <p className="text-xs text-muted-foreground">
                    {toTimeInput(schedule.start_time)}–
                    {toTimeInput(schedule.end_time)} · {schedule.slot_minutes}{' '}
                    min
                    {schedule.room ? ` · ${schedule.room}` : ''}
                </p>
            </div>
            <div className="flex items-center gap-1">
                <StatusBadge status={schedule.active ? 'activo' : 'inactivo'} />
                {canManage && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Editar horario"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={
                                schedule.active
                                    ? 'Desactivar horario'
                                    : 'Activar horario'
                            }
                            onClick={() =>
                                router.patch(
                                    `/admin/especialidades/horarios/${schedule.id}/estado`,
                                    { active: !schedule.active },
                                    { preserveScroll: true },
                                )
                            }
                        >
                            {schedule.active ? (
                                <ToggleRight className="size-4 text-emerald-600" />
                            ) : (
                                <ToggleLeft className="size-4 text-muted-foreground" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Eliminar horario"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        '¿Eliminar este horario del doctor?',
                                    )
                                ) {
                                    router.delete(
                                        `/admin/especialidades/horarios/${schedule.id}`,
                                        { preserveScroll: true },
                                    );
                                }
                            }}
                        >
                            <Trash2 className="size-4 text-destructive" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function EditSchedule({
    schedule,
    doctors,
    weekdays,
    onClose,
}: {
    schedule: DoctorSchedule;
    doctors: AdminDoctor[];
    weekdays: Option[];
    onClose: () => void;
}) {
    const form = useForm<ScheduleFormData>({
        doctor_id: String(schedule.doctor_id),
        weekday: String(schedule.weekday),
        start_time: toTimeInput(schedule.start_time),
        end_time: toTimeInput(schedule.end_time),
        slot_minutes: String(schedule.slot_minutes),
        room: schedule.room ?? '',
        active: schedule.active,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/admin/especialidades/horarios/${schedule.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-md border border-primary/30 p-3"
        >
            <ScheduleFields form={form} doctors={doctors} weekdays={weekdays} />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={form.processing}>
                    Guardar
                </Button>
            </div>
        </form>
    );
}

function ScheduleFields({
    form,
    doctors,
    weekdays,
}: {
    form: ReturnType<typeof useForm<ScheduleFormData>>;
    doctors: AdminDoctor[];
    weekdays: Option[];
}) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1 md:col-span-2">
                <Label htmlFor="schedule-doctor">Doctor *</Label>
                <EntitySelect
                    id="schedule-doctor"
                    value={form.data.doctor_id}
                    onChange={(event) =>
                        form.setData('doctor_id', event.target.value)
                    }
                    options={doctors.map((doctor) => ({
                        value: doctor.id,
                        label: `${doctor.user?.name ?? `Doctor #${doctor.id}`} — ${
                            doctor.specialty?.name ?? 'Sin especialidad'
                        }`,
                    }))}
                    placeholder="Selecciona un doctor"
                />
                <FieldError message={form.errors.doctor_id} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="schedule-weekday">Día *</Label>
                <EntitySelect
                    id="schedule-weekday"
                    value={form.data.weekday}
                    onChange={(event) =>
                        form.setData('weekday', event.target.value)
                    }
                    options={weekdays}
                    placeholder="Selecciona un día"
                />
                <FieldError message={form.errors.weekday} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="schedule-start">Inicio *</Label>
                <Input
                    id="schedule-start"
                    type="time"
                    value={form.data.start_time}
                    onChange={(event) =>
                        form.setData('start_time', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.start_time)}
                />
                <FieldError message={form.errors.start_time} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="schedule-end">Fin *</Label>
                <Input
                    id="schedule-end"
                    type="time"
                    value={form.data.end_time}
                    onChange={(event) =>
                        form.setData('end_time', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.end_time)}
                />
                <FieldError message={form.errors.end_time} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="schedule-slot">Duración de turno (min) *</Label>
                <Input
                    id="schedule-slot"
                    type="number"
                    min={5}
                    max={240}
                    value={form.data.slot_minutes}
                    onChange={(event) =>
                        form.setData('slot_minutes', event.target.value)
                    }
                    aria-invalid={Boolean(form.errors.slot_minutes)}
                />
                <FieldError message={form.errors.slot_minutes} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="schedule-room">Consultorio</Label>
                <Input
                    id="schedule-room"
                    value={form.data.room}
                    onChange={(event) =>
                        form.setData('room', event.target.value)
                    }
                />
                <FieldError message={form.errors.room} />
            </div>

            <div className="flex items-center gap-2 pt-6">
                <Checkbox
                    id="schedule-active"
                    checked={form.data.active}
                    onCheckedChange={(checked) =>
                        form.setData('active', checked === true)
                    }
                />
                <Label htmlFor="schedule-active">Activo</Label>
            </div>
        </div>
    );
}
