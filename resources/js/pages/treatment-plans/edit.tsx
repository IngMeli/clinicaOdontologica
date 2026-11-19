import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/treatment-plans';
import type {
    Consultation,
    DoctorRef,
    PatientRef,
    TreatmentPlan,
} from '@/types';
import { TreatmentPlanForm } from './form';

type Props = {
    plan: TreatmentPlan;
    patients: PatientRef[];
    doctors: DoctorRef[];
    consultations: Consultation[];
    currentDoctorId: number | null;
    isDoctor: boolean;
};

export default function EditTreatmentPlan(props: Props) {
    return (
        <>
            <Head title={`Editar ${props.plan.code ?? 'plan'}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow={props.plan.code ?? 'Plan'}
                    title="Editar plan de tratamiento"
                    description="Solo los planes en borrador pueden modificarse."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={show(props.plan.id).url}>
                                <ArrowLeft className="size-4" />
                                Volver al plan
                            </Link>
                        </Button>
                    }
                />

                <TreatmentPlanForm {...props} />
            </div>
        </>
    );
}
