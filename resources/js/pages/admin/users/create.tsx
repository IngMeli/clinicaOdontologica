import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import type { Option, SpecialtyRef } from '@/types';
import { UserForm } from './user-form';

type Props = {
    roles: Option[];
    specialties: SpecialtyRef[];
};

export default function AdminUsersCreate({ roles, specialties }: Props) {
    return (
        <>
            <Head title="Nuevo usuario" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Administración"
                    title="Nuevo usuario"
                    description="Crea una cuenta y asigna sus roles de acceso."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/admin/usuarios">
                                <ArrowLeft className="size-4" />
                                Volver a usuarios
                            </Link>
                        </Button>
                    }
                />

                <UserForm roles={roles} specialties={specialties} />
            </div>
        </>
    );
}
