import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { EntitySelect } from '@/components/entity-select';
import { FilterBar } from '@/components/filter-bar';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatAmount } from '@/lib/format';
import { create, edit, index, status } from '@/routes/treatments';
import type { Paginated, Treatment } from '@/types';

type Props = {
    treatments: Paginated<Treatment>;
    categories: string[];
    filters: {
        search: string;
        active: string;
        category: string;
    };
    can: {
        create: boolean;
        update: boolean;
    };
};

const activeOptions = [
    { value: '1', label: 'Solo activos' },
    { value: '0', label: 'Solo inactivos' },
];

export default function TreatmentsIndex({
    treatments,
    categories,
    filters,
    can,
}: Props) {
    return (
        <>
            <Head title="Catálogo de tratamientos" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catálogo"
                    title="Tratamientos"
                    description="Procedimientos, precios y duración estimada para los planes clínicos."
                    actions={
                        can.create ? (
                            <Button asChild>
                                <Link href={create().url}>
                                    <Plus className="size-4" />
                                    Nuevo tratamiento
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
                                placeholder="Código, nombre o categoría"
                            />
                        </div>
                        <div className="w-44 space-y-1">
                            <label
                                htmlFor="category"
                                className="text-xs text-muted-foreground"
                            >
                                Categoría
                            </label>
                            <EntitySelect
                                id="category"
                                name="category"
                                defaultValue={filters.category}
                                options={categories.map((category) => ({
                                    value: category,
                                    label: category,
                                }))}
                                placeholder="Todas las categorías"
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
                            rows={treatments.data}
                            getRowKey={(treatment) => treatment.id}
                            emptyMessage="No se encontraron tratamientos con los filtros seleccionados."
                            columns={[
                                {
                                    key: 'treatment',
                                    header: 'Tratamiento',
                                    cell: (treatment) => (
                                        <div>
                                            <p className="font-medium">
                                                {treatment.name}
                                            </p>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {treatment.code}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'category',
                                    header: 'Categoría',
                                    cell: (treatment) =>
                                        treatment.category ?? '—',
                                },
                                {
                                    key: 'duration',
                                    header: 'Duración',
                                    cell: (treatment) =>
                                        `${treatment.duration_minutes} min`,
                                },
                                {
                                    key: 'price',
                                    header: 'Precio',
                                    cell: (treatment) => (
                                        <span className="font-medium">
                                            {formatAmount(treatment.price)}
                                        </span>
                                    ),
                                },
                                {
                                    key: 'status',
                                    header: 'Estado',
                                    cell: (treatment) => (
                                        <StatusBadge
                                            status={
                                                treatment.active
                                                    ? 'activo'
                                                    : 'inactivo'
                                            }
                                        />
                                    ),
                                },
                                ...(can.update
                                    ? [
                                          {
                                              key: 'actions',
                                              header: '',
                                              headerClassName: 'text-right',
                                              className: 'text-right',
                                              cell: (treatment: Treatment) => (
                                                  <div className="flex justify-end gap-1">
                                                      <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          aria-label={
                                                              treatment.active
                                                                  ? 'Desactivar tratamiento'
                                                                  : 'Activar tratamiento'
                                                          }
                                                          onClick={() =>
                                                              router.patch(
                                                                  status(
                                                                      treatment.id,
                                                                  ).url,
                                                                  {
                                                                      active: !treatment.active,
                                                                  },
                                                                  {
                                                                      preserveScroll: true,
                                                                  },
                                                              )
                                                          }
                                                      >
                                                          {treatment.active ? (
                                                              <ToggleRight className="size-4 text-emerald-600" />
                                                          ) : (
                                                              <ToggleLeft className="size-4 text-muted-foreground" />
                                                          )}
                                                      </Button>
                                                      <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          asChild
                                                      >
                                                          <Link
                                                              href={
                                                                  edit(
                                                                      treatment.id,
                                                                  ).url
                                                              }
                                                              aria-label="Editar tratamiento"
                                                          >
                                                              <Pencil className="size-4" />
                                                          </Link>
                                                      </Button>
                                                  </div>
                                              ),
                                          },
                                      ]
                                    : []),
                            ]}
                            footer={
                                <Pagination
                                    links={treatments.links}
                                    from={treatments.from}
                                    to={treatments.to}
                                    total={treatments.total}
                                />
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
