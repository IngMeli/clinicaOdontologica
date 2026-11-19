import { Link, useForm } from '@inertiajs/react';
import {
    Loader2,
    Save,
    ShieldCheck,
    Stethoscope,
    UserRound,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    AdminUser,
    AdminUserFormData,
    Option,
    SpecialtyRef,
} from '@/types';

type Props = {
    user?: AdminUser;
    roles: Option[];
    specialties: SpecialtyRef[];
};

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

export function UserForm({ user, roles, specialties }: Props) {
    const form = useForm<AdminUserFormData>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        password: '',
        password_confirmation: '',
        roles: user?.roles.map((role) => role.name) ?? [],
        specialty_id: user?.doctor?.specialty?.id
            ? String(user.doctor.specialty.id)
            : '',
        license_number: user?.doctor?.license_number ?? '',
        active: user?.active ?? true,
    });

    const isDoctor = form.data.roles.includes('doctor');
    const isPatient = form.data.roles.includes('paciente');

    const toggleRole = (role: string, checked: boolean) => {
        form.setData(
            'roles',
            checked
                ? [...new Set([...form.data.roles, role])]
                : form.data.roles.filter((value) => value !== role),
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (user) {
            form.put(`/admin/usuarios/${user.id}`, { preserveScroll: true });
            return;
        }

        form.post('/admin/usuarios', { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserRound className="size-4" />
                        Datos de la cuenta
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.name)}
                            autoFocus
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.email)}
                        />
                        <FieldError message={form.errors.email} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            value={form.data.phone}
                            onChange={(event) =>
                                form.setData('phone', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.phone)}
                        />
                        <FieldError message={form.errors.phone} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {user ? 'Nueva contraseña' : 'Contraseña *'}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            placeholder={
                                user
                                    ? 'Dejar en blanco para mantener la actual'
                                    : 'Mínimo 8 caracteres'
                            }
                            aria-invalid={Boolean(form.errors.password)}
                        />
                        <FieldError message={form.errors.password} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Confirmar contraseña
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                        />
                    </div>

                    {user && (
                        <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox
                                id="active"
                                checked={form.data.active}
                                onCheckedChange={(checked) =>
                                    form.setData('active', checked === true)
                                }
                            />
                            <Label htmlFor="active">
                                Cuenta activa (puede iniciar sesión)
                            </Label>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        Roles del usuario
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                        {roles.map((role) => (
                            <label
                                key={role.value}
                                htmlFor={`role-${role.value}`}
                                className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors hover:bg-accent/50"
                            >
                                <Checkbox
                                    id={`role-${role.value}`}
                                    checked={form.data.roles.includes(
                                        String(role.value),
                                    )}
                                    onCheckedChange={(checked) =>
                                        toggleRole(
                                            String(role.value),
                                            checked === true,
                                        )
                                    }
                                />
                                {role.label}
                            </label>
                        ))}
                    </div>
                    <FieldError message={form.errors.roles} />
                    <FieldError
                        message={
                            form.errors['roles.0'] ?? form.errors['roles.1']
                        }
                    />
                    {isPatient && (
                        <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                            Al guardar con el rol Paciente se creará
                            automáticamente su ficha clínica si todavía no
                            existe.
                        </p>
                    )}
                </CardContent>
            </Card>

            {isDoctor && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="size-4" />
                            Datos profesionales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="specialty_id">Especialidad</Label>
                            <select
                                id="specialty_id"
                                value={form.data.specialty_id}
                                onChange={(event) =>
                                    form.setData(
                                        'specialty_id',
                                        event.target.value,
                                    )
                                }
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Sin especialidad</option>
                                {specialties.map((specialty) => (
                                    <option
                                        key={specialty.id}
                                        value={specialty.id}
                                    >
                                        {specialty.name}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={form.errors.specialty_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="license_number">
                                Matrícula profesional
                            </Label>
                            <Input
                                id="license_number"
                                value={form.data.license_number}
                                onChange={(event) =>
                                    form.setData(
                                        'license_number',
                                        event.target.value,
                                    )
                                }
                                aria-invalid={Boolean(
                                    form.errors.license_number,
                                )}
                            />
                            <FieldError message={form.errors.license_number} />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href="/admin/usuarios">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {user ? 'Guardar cambios' : 'Crear usuario'}
                </Button>
            </div>
        </form>
    );
}
