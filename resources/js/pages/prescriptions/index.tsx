import { Head, Link } from '@inertiajs/react';
import { Eye, Plus, Printer, Search } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/format';
import { create, index, print, show } from '@/routes/prescriptions';
import type { DoctorRef, Paginated, Prescription } from '@/types';

type Props = {
    prescriptions: Paginated<Prescription>;
    doctors: DoctorRef[];
    filters: {
        search: string;
        doctor_id: number | null;
        date_from: string;
        date_to: string;
    };
    isDoctor: boolean;
    can: {
        create: boolean;
    };
};

export default function PrescriptionsIndex({
    prescriptions,
    doctors,
    filters,
    isDoctor,
    can,
}: Props) {
    return (
        <>
            <Head title="Recetas" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Prescripciones"
                    title="Recetas"
                    description="Medicamentos indicados por paciente y consulta."
                    actions={
                        can.create ? (
                            <Button asChild>
                                <Link href={create().url}>
                                    <Plus className="size-4" />
                                    Nueva receta
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />

                {!can.create && (
                    <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        No tienes permiso para emitir recetas. Solo un doctor
                        puede hacerlo.
                    </div>
                )}

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
                                placeholder="Código, paciente o medicamento"
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
                            rows={prescriptions.data}
                            getRowKey={(prescription) => prescription.id}
                            emptyMessage="No se encontraron recetas con los filtros seleccionados."
                            columns={[
                                {
                                    key: 'prescription',
                                    header: 'Receta',
                                    cell: (prescription) => (
                                        <div>
                                            <Link
                                                href={show(prescription.id).url}
                                                className="font-medium hover:underline"
                                            >
                                                {prescription.code ??
                                                    `Receta #${prescription.id}`}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(
                                                    prescription.issued_at,
                                                )}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'patient',
                                    header: 'Paciente',
                                    cell: (prescription) => (
                                        <div>
                                            <Link
                                                href={`/pacientes/${prescription.patient_id}`}
                                                className="hover:underline"
                                            >
                                                {prescription.patient
                                                    ?.first_name ??
                                                    'Sin paciente'}{' '}
                                                {prescription.patient
                                                    ?.last_name ?? ''}
                                            </Link>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {prescription.patient?.code}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'doctor',
                                    header: 'Doctor',
                                    cell: (prescription) =>
                                        prescription.doctor?.user?.name ?? '—',
                                },
                                {
                                    key: 'items',
                                    header: 'Medicamentos',
                                    cell: (prescription) =>
                                        prescription.items_count ?? 0,
                                },
                                {
                                    key: 'actions',
                                    header: '',
                                    headerClassName: 'text-right',
                                    className: 'text-right',
                                    cell: (prescription) => (
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={
                                                        print(prescription.id)
                                                            .url
                                                    }
                                                    aria-label="Imprimir receta"
                                                >
                                                    <Printer className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={
                                                        show(prescription.id)
                                                            .url
                                                    }
                                                    aria-label="Ver receta"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ),
                                },
                            ]}
                            footer={
                                <Pagination
                                    links={prescriptions.links}
                                    from={prescriptions.from}
                                    to={prescriptions.to}
                                    total={prescriptions.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
