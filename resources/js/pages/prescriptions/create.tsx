import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/prescriptions';
import type { Consultation, DoctorRef, PatientRef } from '@/types';
import { PrescriptionForm } from './form';

type Props = {
    patients: PatientRef[];
    doctors: DoctorRef[];
    consultations: Consultation[];
    currentDoctorId: number | null;
    isDoctor: boolean;
    selectedPatientId: number | null;
    selectedConsultationId: number | null;
};

export default function CreatePrescription(props: Props) {
    return (
        <>
            <Head title="Nueva receta" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Recetas"
                    title="Nueva receta"
                    description="Registra los medicamentos indicados. El código se genera automáticamente."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={index().url}>
                                <ArrowLeft className="size-4" />
                                Volver al listado
                            </Link>
                        </Button>
                    }
                />

                <PrescriptionForm {...props} />
            </div>
        </>
    );
}
