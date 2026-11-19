import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { show } from '@/routes/appointments';
import type { ClinicAppointment, DoctorRef, PatientRef } from '@/types';
import { AppointmentForm } from './appointment-form';

type Props = {
    appointment: ClinicAppointment;
    patients: PatientRef[];
    doctors: DoctorRef[];
};

export default function EditAppointment({
    appointment,
    patients,
    doctors,
}: Props) {
    return (
        <>
            <Head title={`Editar cita #${appointment.id}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Agenda"
                    title="Editar cita"
                    description="Reprograma la cita o actualiza su motivo y notas internas."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={show(appointment.id).url}>
                                <ArrowLeft className="size-4" />
                                Volver al detalle
                            </Link>
                        </Button>
                    }
                />

                <AppointmentForm
                    patients={patients}
                    doctors={doctors}
                    appointment={appointment}
                />
            </div>
        </>
    );
}
