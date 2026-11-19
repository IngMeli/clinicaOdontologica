import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/patients';
import { PatientForm } from './patient-form';

export default function CreatePatient() {
    return (
        <>
            <Head title="Nuevo paciente" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Pacientes"
                    title="Nuevo paciente"
                    description="Registra la ficha base. El código de paciente se genera automáticamente."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={index().url}>
                                <ArrowLeft className="size-4" />
                                Volver al listado
                            </Link>
                        </Button>
                    }
                />

                <PatientForm />
            </div>
        </>
    );
}
