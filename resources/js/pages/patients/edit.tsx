import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/patients';
import type { Patient } from '@/types';
import { PatientForm } from './patient-form';

type Props = {
    patient: Patient;
};

export default function EditPatient({ patient }: Props) {
    return (
        <>
            <Head title={`Editar ${patient.first_name} ${patient.last_name}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow={patient.code}
                    title="Editar paciente"
                    description="Actualiza los datos de contacto y la información clínica relevante."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={show(patient.id).url}>
                                <ArrowLeft className="size-4" />
                                Volver a la ficha
                            </Link>
                        </Button>
                    }
                />

                <PatientForm patient={patient} />
            </div>
        </>
    );
}
