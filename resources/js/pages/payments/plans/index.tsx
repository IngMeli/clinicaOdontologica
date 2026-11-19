import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, Plus, Search } from 'lucide-react';
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
import type { Option, Paginated, PaymentPlan } from '@/types';

type Props = {
    plans: Paginated<PaymentPlan>;
    filters: { search: string; status: string };
    statuses: Option[];
};

export default function PaymentPlansIndex({ plans, filters, statuses }: Props) {
    return (
        <>
            <Head title="Planes de pago" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Finanzas"
                    title="Planes de pago"
                    description="Cuotas programadas por tratamiento o concepto."
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/pagos">
                                    <ArrowLeft className="size-4" />
                                    Volver a pagos
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/pagos/planes/crear">
                                    <Plus className="size-4" />
                                    Nuevo plan
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <form action="/pagos/planes" method="get">
                    <FilterBar
                        actions={
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/pagos/planes">Limpiar</Link>
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
                                placeholder="Concepto o paciente"
                            />
                        </div>
                        <div className="w-48 space-y-1">
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
                                options={statuses}
                                placeholder="Todos"
                            />
                        </div>
                    </FilterBar>
                </form>

                <Card>
                    <CardContent>
                        <DataTable
                            rows={plans.data}
                            getRowKey={(plan) => plan.id}
                            emptyMessage="No hay planes de pago registrados."
                            columns={[
                                {
                                    key: 'concept',
                                    header: 'Plan',
                                    cell: (plan) => (
                                        <div>
                                            <Link
                                                href={`/pagos/planes/${plan.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {plan.concept}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {plan.treatment_plan?.code ??
                                                    'Sin plan de tratamiento'}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'patient',
                                    header: 'Paciente',
                                    cell: (plan) =>
                                        plan.patient
                                            ? `${plan.patient.first_name} ${plan.patient.last_name}`
                                            : '—',
                                },
                                {
                                    key: 'installments',
                                    header: 'Cuotas',
                                    cell: (plan) => (
                                        <div>
                                            <p className="font-medium">
                                                {plan.pending_installments_count ??
                                                    0}{' '}
                                                pendientes
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                de {plan.installments_count}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'paid',
                                    header: 'Pagado',
                                    cell: (plan) => (
                                        <div>
                                            <p className="font-medium">
                                                {formatAmount(plan.paid_amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                de {formatAmount(plan.total)}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'frequency',
                                    header: 'Frecuencia',
                                    cell: (plan) => plan.frequency,
                                },
                                {
                                    key: 'start',
                                    header: 'Inicio',
                                    cell: (plan) => formatDate(plan.start_date),
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
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/pagos/planes/${plan.id}`}
                                            >
                                                <CalendarClock className="size-4" />
                                                Cuotas
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
