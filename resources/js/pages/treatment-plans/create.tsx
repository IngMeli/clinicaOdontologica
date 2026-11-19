import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/treatment-plans';
import type { Consultation, DoctorRef, PatientRef } from '@/types';
import { TreatmentPlanForm } from './form';

type Props = {
    patients: PatientRef[];
    doctors: DoctorRef[];
    consultations: Consultation[];
    currentDoctorId: number | null;
    isDoctor: boolean;
    selectedPatientId: number | null;
    selectedConsultationId: number | null;
};

export default function CreateTreatmentPlan(props: Props) {
    return (
        <>
            <Head title="Nuevo plan de tratamiento" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Planes de tratamiento"
                    title="Nuevo plan"
                    description="Crea el plan y luego agrega los procedimientos desde el detalle."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={index().url}>
                                <ArrowLeft className="size-4" />
                                Volver al listado
                            </Link>
                        </Button>
                    }
                />

                <TreatmentPlanForm {...props} />
            </div>
        </>
    );
}
