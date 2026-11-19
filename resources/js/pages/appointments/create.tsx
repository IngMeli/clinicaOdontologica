import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/appointments';
import type { DoctorRef, PatientRef } from '@/types';
import { AppointmentForm } from './appointment-form';

type Props = {
    patients: PatientRef[];
    doctors: DoctorRef[];
    defaults: {
        patient_id: number | null;
        date: string;
    };
};

export default function CreateAppointment({
    patients,
    doctors,
    defaults,
}: Props) {
    return (
        <>
            <Head title="Nueva cita" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Agenda"
                    title="Nueva cita"
                    description="El sistema valida choques de horario y la disponibilidad configurada del doctor."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={index().url}>
                                <ArrowLeft className="size-4" />
                                Volver a la agenda
                            </Link>
                        </Button>
                    }
                />

                <AppointmentForm
                    patients={patients}
                    doctors={doctors}
                    defaults={defaults}
                />
            </div>
        </>
    );
}
