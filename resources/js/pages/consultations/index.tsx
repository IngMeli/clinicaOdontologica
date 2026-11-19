import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Eye, Pill, Search, Stethoscope } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/format';
import { index, show } from '@/routes/consultations';
import type { Consultation, DoctorRef, Paginated } from '@/types';

type Props = {
    consultations: Paginated<Consultation>;
    doctors: DoctorRef[];
    filters: {
        search: string;
        status: string;
        doctor_id: number | null;
        date_from: string;
        date_to: string;
    };
    isDoctor: boolean;
};

const statusOptions = [
    { value: 'abierta', label: 'Abiertas' },
    { value: 'cerrada', label: 'Cerradas' },
];

export default function ConsultationsIndex({
    consultations,
    doctors,
    filters,
    isDoctor,
}: Props) {
    return (
        <>
            <Head title="Consultas" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Historia clínica"
                    title="Consultas"
                    description="Diagnósticos, evolución y procedimientos asociados a cada atención."
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
                        <div className="min-w-52 flex-1 space-y-1">
                            <label
                                htmlFor="search"
                                className="text-xs text-muted-foreground"
                            >
                                Buscar
                            </label>
                            <Input
                                id="search"
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Código, paciente, motivo o diagnóstico"
                            />
                        </div>
                        {!isDoctor && (
                            <div className="w-56 space-y-1">
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
                        <div className="w-40 space-y-1">
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
                        <div className="w-40 space-y-1">
                            <label
                                htmlFor="date_from"
                                className="text-xs text-muted-foreground"
                            >
                                Desde
                            </label>
                            <Input
                                id="date_from"
                                type="date"
                                name="date_from"
                                defaultValue={filters.date_from}
                            />
                        </div>
                        <div className="w-40 space-y-1">
                            <label
                                htmlFor="date_to"
                                className="text-xs text-muted-foreground"
                            >
                                Hasta
                            </label>
                            <Input
                                id="date_to"
                                type="date"
                                name="date_to"
                                defaultValue={filters.date_to}
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent>
                        <DataTable
                            rows={consultations.data}
                            getRowKey={(consultation) => consultation.id}
                            emptyMessage="No se encontraron consultas con los filtros seleccionados."
                            columns={[
                                {
                                    key: 'consultation',
                                    header: 'Consulta',
                                    cell: (consultation) => (
                                        <div>
                                            <Link
                                                href={show(consultation.id).url}
                                                className="font-medium hover:underline"
                                            >
                                                {consultation.code ??
                                                    `Consulta #${consultation.id}`}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(
                                                    consultation.consulted_at,
                                                )}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'patient',
                                    header: 'Paciente',
                                    cell: (consultation) => (
                                        <div>
                                            <Link
                                                href={`/pacientes/${consultation.patient_id}`}
                                                className="hover:underline"
                                            >
                                                {consultation.patient
                                                    ?.first_name ??
                                                    'Sin paciente'}{' '}
                                                {consultation.patient
                                                    ?.last_name ?? ''}
                                            </Link>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {consultation.patient?.code}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'reason',
                                    header: 'Motivo',
                                    cell: (consultation) => (
                                        <p className="max-w-64 truncate">
                                            {consultation.reason}
                                        </p>
                                    ),
                                },
                                {
                                    key: 'doctor',
                                    header: 'Doctor',
                                    cell: (consultation) =>
                                        consultation.doctor?.user?.name ?? '—',
                                },
                                {
                                    key: 'related',
                                    header: 'Registros',
                                    cell: (consultation) => (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <ClipboardList className="size-3.5" />
                                                {consultation.treatment_plans_count ??
                                                    0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Pill className="size-3.5" />
                                                {consultation.prescriptions_count ??
                                                    0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Stethoscope className="size-3.5" />
                                                {consultation.odontogram_entries_count ??
                                                    0}
                                            </span>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (consultation) => (
                                        <StatusBadge
                                            status={consultation.status}
                                        />
                                    ),
                                },
                                {
                                    key: 'actions',
                                    header: '',
                                    headerClassName: 'text-right',
                                    className: 'text-right',
                                    cell: (consultation) => (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <Link
                                                href={show(consultation.id).url}
                                                aria-label="Ver consulta"
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                        </Button>
                                    ),
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={consultations.links}
                                    from={consultations.from}
                                    to={consultations.to}
                                    total={consultations.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
