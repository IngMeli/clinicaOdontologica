import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import type { AdminUser, Option, SpecialtyRef } from '@/types';
import { UserForm } from './user-form';

type Props = {
    user: AdminUser;
    roles: Option[];
    specialties: SpecialtyRef[];
};

export default function AdminUsersEdit({ user, roles, specialties }: Props) {
    return (
        <>
            <Head title={`Editar ${user.name}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Administración"
                    title={user.name}
                    description={`${user.email} · Actualiza datos, roles y estado de la cuenta.`}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/admin/usuarios">
                                <ArrowLeft className="size-4" />
                                Volver a usuarios
                            </Link>
                        </Button>
                    }
                />

                <UserForm user={user} roles={roles} specialties={specialties} />
            </div>
        </>
    );
}
