import { Head, Link } from '@inertiajs/react';
import { Eye, Plus, Search } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatAmount, formatDate } from '@/lib/format';
import { create, index, show } from '@/routes/treatment-plans';
import type { DoctorRef, Paginated, TreatmentPlan } from '@/types';

type Props = {
    plans: Paginated<TreatmentPlan>;
    doctors: DoctorRef[];
    filters: {
        search: string;
        status: string;
        doctor_id: number | null;
    };
    isDoctor: boolean;
    can: {
        create: boolean;
    };
};

const statusOptions = [
    { value: 'borrador', label: 'Borradores' },
    { value: 'aprobado', label: 'Aprobados' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'completado', label: 'Completados' },
    { value: 'cancelado', label: 'Cancelados' },
];

export default function TreatmentPlansIndex({
    plans,
    doctors,
    filters,
    isDoctor,
    can,
}: Props) {
    return (
        <>
            <Head title="Planes de tratamiento" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Planes de tratamiento"
                    title="Planes"
                    description="Propuestas de tratamiento, aprobación y avance por paciente."
                    actions={
                        can.create ? (
                            <Button asChild>
                                <Link href={create().url}>
                                    <Plus className="size-4" />
                                    Nuevo plan
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
                                placeholder="Código, paciente o notas"
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
                    <CardContent>
                        <DataTable
                            rows={plans.data}
                            getRowKey={(plan) => plan.id}
                            emptyMessage="No se encontraron planes con los filtros seleccionados."
                            columns={[
                                {
                                    key: 'plan',
                                    header: 'Plan',
                                    cell: (plan) => (
                                        <div>
                                            <Link
                                                href={show(plan.id).url}
                                                className="font-medium hover:underline"
                                            >
                                                {plan.code ??
                                                    `Plan #${plan.id}`}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                Creado el{' '}
                                                {formatDate(plan.created_at)}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'patient',
                                    header: 'Paciente',
                                    cell: (plan) => (
                                        <div>
                                            <Link
                                                href={`/pacientes/${plan.patient_id}`}
                                                className="hover:underline"
                                            >
                                                {plan.patient?.first_name ??
                                                    'Sin paciente'}{' '}
                                                {plan.patient?.last_name ?? ''}
                                            </Link>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {plan.patient?.code}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'doctor',
                                    header: 'Doctor',
                                    cell: (plan) =>
                                        plan.doctor?.user?.name ?? '—',
                                },
                                {
                                    key: 'items',
                                    header: 'Procedimientos',
                                    cell: (plan) => plan.items_count ?? 0,
                                },
                                {
                                    key: 'total',
                                    header: 'Total',
                                    cell: (plan) => (
                                        <span className="font-medium">
                                            {formatAmount(plan.total)}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (plan) => (
                                        <StatusBadge status={plan.status} />
                                    ),
                                },
                                {
                                    key: 'actions',
                                    header: '',
                                    headerClassName: 'text-right',
                                    className: 'text-right',
                                    cell: (plan) => (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <Link
                                                href={show(plan.id).url}
                                                aria-label="Ver plan"
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                        </Button>
                                    ),
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={plans.links}
                                    from={plans.from}
                                    to={plans.to}
                                    total={plans.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
