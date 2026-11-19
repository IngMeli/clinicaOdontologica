import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/treatments';
import type { Treatment } from '@/types';
import { TreatmentForm } from './form';

type Props = {
    treatment: Treatment;
    categories: string[];
};

export default function EditTreatment({ treatment, categories }: Props) {
    return (
        <>
            <Head title={`Editar ${treatment.name}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow={treatment.code}
                    title="Editar tratamiento"
                    description="Actualiza precio, duración o categoría del procedimiento."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={index().url}>
                                <ArrowLeft className="size-4" />
                                Volver al catálogo
                            </Link>
                        </Button>
                    }
                />

                <TreatmentForm treatment={treatment} categories={categories} />
            </div>
        </>
    );
}
