import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/consultations';
import type { Consultation } from '@/types';
import { ConsultationForm } from './form';

type Props = {
    consultation: Consultation;
};

export default function EditConsultation({ consultation }: Props) {
    return (
        <>
            <Head
                title={`Editar ${consultation.code ?? `consulta #${consultation.id}`}`}
            />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow={consultation.code ?? 'Consulta'}
                    title="Editar consulta"
                    description="Actualiza el motivo, diagnóstico y observaciones. Las consultas cerradas no pueden editarse."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={show(consultation.id).url}>
                                <ArrowLeft className="size-4" />
                                Volver a la consulta
                            </Link>
                        </Button>
                    }
                />

                <ConsultationForm consultation={consultation} />
            </div>
        </>
    );
}
