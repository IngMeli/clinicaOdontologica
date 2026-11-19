import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Plus,
    Search,
} from 'lucide-react';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatTime, toDateInput } from '@/lib/format';
import { index } from '@/routes/appointments';
import type { ClinicAppointment, DoctorRef } from '@/types';

type Props = {
    appointments: ClinicAppointment[];
    doctors: DoctorRef[];
    week: {
        start: string;
        end: string;
    };
    filters: {
        week: string;
        doctor_id: number | null;
        status: string;
    };
    isDoctor: boolean;
    can: {
        create: boolean;
    };
};

const statusOptions = [
    { value: 'programada', label: 'Programadas' },
    { value: 'confirmada', label: 'Confirmadas' },
    { value: 'atendida', label: 'Atendidas' },
    { value: 'cancelada', label: 'Canceladas' },
    { value: 'no_asistio', label: 'No asistió' },
];

function localDateKey(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);

    return copy;
}

export default function AppointmentsIndex({
    appointments,
    doctors,
    week,
    filters,
    isDoctor,
    can,
}: Props) {
    const weekStart = new Date(`${week.start}T12:00:00`);
    const days = Array.from({ length: 7 }, (_, index) =>
        addDays(weekStart, index),
    );
    const todayKey = toDateInput(new Date().toISOString());

    const grouped = new Map<string, ClinicAppointment[]>();

    for (const appointment of appointments) {
        const key = localDateKey(new Date(appointment.scheduled_at));
        const current = grouped.get(key) ?? [];
        current.push(appointment);
        grouped.set(key, current);
    }

    const dateRangeLabel = new Intl.DateTimeFormat('es-BO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).formatRange(weekStart, addDays(weekStart, 6));

    const weekLink = (date: Date) =>
        index({
            query: {
                week: toDateInput(date.toISOString()),
                doctor_id: filters.doctor_id ?? undefined,
                status: filters.status || undefined,
            },
        }).url;

    return (
        <>
            <Head title="Agenda de citas" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Agenda"
                    title="Agenda de citas"
                    description="Vista semanal por doctor, con validación de choques y disponibilidad."
                    actions={
                        can.create ? (
                            <Button asChild>
                                <Link href={`${index().url}/crear`}>
                                    <Plus className="size-4" />
                                    Nueva cita
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />

                <form action={index().url} method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={index().url}>Limpiar</Link>
                                </Button>
                                <Button type="submit">
                                    <Search className="size-4" />
                                    Filtrar
                                </Button>
                            </>
                        }
                    >
                        <div className="w-44 space-y-1">
                            <label
                                htmlFor="week"
                                className="text-xs text-muted-foreground"
                            >
                                Semana
                            </label>
                            <Input
                                id="week"
                                type="date"
                                name="week"
                                defaultValue={filters.week}
                            />
                        </div>

                        {!isDoctor && (
                            <div className="w-64 space-y-1">
                                <label
                                    htmlFor="doctor_id"
                                    className="text-xs text-muted-foreground"
                                >
                                    Doctor
                                </label>
                                <EntitySelect
                                    id="doctor_id"
                                    name="doctor_id"
                                    defaultValue={filters.doctor_id ?? ''}
                                    options={doctors.map((doctor) => ({
                                        value: doctor.id,
                                        label:
                                            doctor.user?.name ??
                                            `Doctor #${doctor.id}`,
                                    }))}
                                    placeholder="Todos los doctores"
                                />
                            </div>
                        )}

                        <div className="w-44 space-y-1">
                            <label
                                htmlFor="status"
                                className="text-xs text-muted-foreground"
                            >
                                Estado
                            </label>
                            <EntitySelect
                                id="status"
                                name="status"
                                defaultValue={filters.status}
                                options={statusOptions}
                                placeholder="Todos los estados"
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="flex items-center gap-2 font-medium">
                                    <CalendarDays className="size-4 text-primary" />
                                    {dateRangeLabel}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {appointments.length} cita
                                    {appointments.length === 1 ? '' : 's'} en la
                                    semana
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" asChild>
                                    <Link
                                        href={weekLink(addDays(weekStart, -7))}
                                        aria-label="Semana anterior"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={weekLink(new Date())}>Hoy</Link>
                                </Button>
                                <Button variant="outline" size="icon" asChild>
                                    <Link
                                        href={weekLink(addDays(weekStart, 7))}
                                        aria-label="Semana siguiente"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-2">
                            <div className="grid min-w-[1120px] grid-cols-7 gap-2">
                                {days.map((day) => {
                                    const key = localDateKey(day);
                                    const dayAppointments =
                                        grouped.get(key) ?? [];
                                    const isToday = key === todayKey;

                                    return (
                                        <div
                                            key={key}
                                            className="flex min-h-[420px] flex-col rounded-lg border bg-muted/20"
                                        >
                                            <div
                                                className={`flex items-center justify-between border-b px-3 py-2 ${
                                                    isToday
                                                        ? 'bg-primary text-primary-foreground'
                                                        : ''
                                                }`}
                                            >
                                                <div>
                                                    <p className="text-xs uppercase opacity-80">
                                                        {new Intl.DateTimeFormat(
                                                            'es-BO',
                                                            {
                                                                weekday:
                                                                    'short',
                                                            },
                                                        ).format(day)}
                                                    </p>
                                                    <p className="font-semibold">
                                                        {day.getDate()}
                                                    </p>
                                                </div>
                                                <span className="text-xs opacity-80">
                                                    {dayAppointments.length}
                                                </span>
                                            </div>

                                            <div className="flex flex-1 flex-col gap-2 p-2">
                                                {dayAppointments.map(
                                                    (appointment) => (
                                                        <Link
                                                            key={appointment.id}
                                                            href={`/agenda/${appointment.id}`}
                                                            className="block rounded-md border border-l-4 bg-card p-2 text-xs shadow-xs transition-colors hover:bg-accent"
                                                            style={{
                                                                borderLeftColor:
                                                                    appointment
                                                                        .doctor
                                                                        ?.color ??
                                                                    '#0f766e',
                                                            }}
                                                        >
                                                            <p className="flex items-center gap-1 font-semibold">
                                                                <Clock3 className="size-3" />
                                                                {formatTime(
                                                                    appointment.scheduled_at,
                                                                )}
                                                            </p>
                                                            <p className="mt-1 truncate font-medium">
                                                                {
                                                                    appointment
                                                                        .patient
                                                                        ?.first_name
                                                                }{' '}
                                                                {
                                                                    appointment
                                                                        .patient
                                                                        ?.last_name
                                                                }
                                                            </p>
                                                            <p className="truncate text-muted-foreground">
                                                                {appointment
                                                                    .doctor
                                                                    ?.user
                                                                    ?.name ??
                                                                    'Sin doctor'}
                                                            </p>
                                                            <div className="mt-1">
                                                                <StatusBadge
                                                                    status={
                                                                        appointment.status
                                                                    }
                                                                />
                                                            </div>
                                                        </Link>
                                                    ),
                                                )}

                                                {dayAppointments.length ===
                                                    0 && (
                                                    <p className="py-8 text-center text-xs text-muted-foreground">
                                                        Sin citas
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
