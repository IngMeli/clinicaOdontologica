import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/treatments';
import { TreatmentForm } from './form';

type Props = {
    categories: string[];
};

export default function CreateTreatment({ categories }: Props) {
    return (
        <>
            <Head title="Nuevo tratamiento" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catálogo"
                    title="Nuevo tratamiento"
                    description="El código del procedimiento se genera automáticamente."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={index().url}>
                                <ArrowLeft className="size-4" />
                                Volver al catálogo
                            </Link>
                        </Button>
                    }
                />

                <TreatmentForm categories={categories} />
            </div>
        </>
    );
}
