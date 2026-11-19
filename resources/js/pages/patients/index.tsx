import { Head, Link } from '@inertiajs/react';
import {
    CalendarPlus,
    Eye,
    Pencil,
    Plus,
    Search,
    UserRound,
} from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { calculateAge, formatDate } from '@/lib/format';
import { create, index } from '@/routes/patients';
import type { Paginated, Patient } from '@/types';

type Props = {
    patients: Paginated<Patient>;
    filters: {
        search: string;
        active: string;
    };
    can: {
        create: boolean;
    };
};

const activeOptions = [
    { value: '1', label: 'Solo activos' },
    { value: '0', label: 'Solo inactivos' },
];

export default function PatientsIndex({ patients, filters, can }: Props) {
    return (
        <>
            <Head title="Pacientes" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Fichas clínicas"
                    title="Pacientes"
                    description="Datos de contacto, antecedentes y acceso a la ficha clínica completa."
                    actions={
                        can.create ? (
                            <Button asChild>
                                <Link href={create().url}>
                                    <Plus className="size-4" />
                                    Nuevo paciente
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
                                    Buscar
                                </Button>
                            </>
                        }
                    >
                        <div className="min-w-56 flex-1 space-y-1">
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
                                placeholder="Nombre, código, CI, teléfono o correo"
                            />
                        </div>
                        <div className="w-44 space-y-1">
                            <label
                                htmlFor="active"
                                className="text-xs text-muted-foreground"
                            >
                                Estado
                            </label>
                            <EntitySelect
                                id="active"
                                name="active"
                                defaultValue={filters.active}
                                options={activeOptions}
                                placeholder="Todos los estados"
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent>
                        <DataTable
                            rows={patients.data}
                            getRowKey={(patient) => patient.id}
                            emptyMessage="No se encontraron pacientes con los filtros seleccionados."
                            columns={[
                                {
                                    key: 'patient',
                                    header: 'Paciente',
                                    cell: (patient) => (
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <UserRound className="size-4" />
                                            </div>
                                            <div>
                                                <Link
                                                    href={`/pacientes/${patient.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {patient.first_name}{' '}
                                                    {patient.last_name}
                                                </Link>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {patient.code}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'ci',
                                    header: 'CI',
                                    cell: (patient) => patient.ci ?? '—',
                                },
                                {
                                    key: 'age',
                                    header: 'Edad',
                                    cell: (patient) => {
                                        const age = calculateAge(
                                            patient.birth_date,
                                        );

                                        return age === null
                                            ? '—'
                                            : `${age} años`;
                                    },
                                },
                                {
                                    key: 'contact',
                                    header: 'Contacto',
                                    cell: (patient) => (
                                        <div className="text-sm">
                                            <p>{patient.phone ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {patient.email ?? 'Sin correo'}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'last_appointment',
                                    header: 'Última cita',
                                    cell: (patient) =>
                                        formatDate(patient.last_appointment_at),
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (patient) => (
                                        <StatusBadge
                                            status={
                                                patient.active
                                                    ? 'activo'
                                                    : 'inactivo'
                                            }
                                        />
                                    ),
                                },
                                {
                                    key: 'actions',
                                    header: '',
                                    headerClassName: 'text-right',
                                    className: 'text-right',
                                    cell: (patient) => (
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/agenda/crear?patient_id=${patient.id}`}
                                                    aria-label="Programar cita"
                                                >
                                                    <CalendarPlus className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/pacientes/${patient.id}`}
                                                    aria-label="Ver ficha"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/pacientes/${patient.id}/editar`}
                                                    aria-label="Editar paciente"
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ),
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={patients.links}
                                    from={patients.from}
                                    to={patients.to}
                                    total={patients.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
