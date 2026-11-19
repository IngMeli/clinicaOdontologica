import { Link, useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { EntitySelect } from '@/components/entity-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDateInput } from '@/lib/format';
import { index, store, update } from '@/routes/patients';
import type { Patient, PatientFormData } from '@/types';

type Props = {
    patient?: Patient;
};

const genderOptions = [
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Otro', label: 'Otro' },
];

const bloodTypeOptions = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(
    (value) => ({ value, label: value }),
);

const birthDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

export function PatientForm({ patient }: Props) {
    const form = useForm<PatientFormData>({
        first_name: patient?.first_name ?? '',
        last_name: patient?.last_name ?? '',
        ci: patient?.ci ?? '',
        birth_date: toDateInput(patient?.birth_date),
        gender: patient?.gender ?? '',
        phone: patient?.phone ?? '',
        email: patient?.email ?? '',
        address: patient?.address ?? '',
        blood_type: patient?.blood_type ?? '',
        allergies: patient?.allergies ?? '',
        medical_notes: patient?.medical_notes ?? '',
        emergency_contact_name: patient?.emergency_contact_name ?? '',
        emergency_contact_phone: patient?.emergency_contact_phone ?? '',
    });

    const today = toDateInput(new Date().toISOString());

    const updateBirthDate = (value: string) => {
        if (value === '' || birthDatePattern.test(value)) {
            form.setData('birth_date', value);
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (patient) {
            form.put(update(patient.id).url, { preserveScroll: true });
            return;
        }

        form.post(store().url, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Datos personales</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">Nombres *</Label>
                        <Input
                            id="first_name"
                            value={form.data.first_name}
                            onChange={(event) =>
                                form.setData('first_name', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.first_name)}
                            autoFocus
                        />
                        <FieldError message={form.errors.first_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last_name">Apellidos *</Label>
                        <Input
                            id="last_name"
                            value={form.data.last_name}
                            onChange={(event) =>
                                form.setData('last_name', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.last_name)}
                        />
                        <FieldError message={form.errors.last_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ci">Cédula de identidad</Label>
                        <Input
                            id="ci"
                            value={form.data.ci}
                            onChange={(event) =>
                                form.setData('ci', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.ci)}
                        />
                        <FieldError message={form.errors.ci} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                        <Input
                            id="birth_date"
                            type="date"
                            min="1900-01-01"
                            max={today}
                            value={form.data.birth_date}
                            onChange={(event) =>
                                updateBirthDate(event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.birth_date)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Año de 4 dígitos (AAAA-MM-DD).
                        </p>
                        <FieldError message={form.errors.birth_date} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                        <EntitySelect
                            id="gender"
                            value={form.data.gender}
                            options={genderOptions}
                            onChange={(event) =>
                                form.setData('gender', event.target.value)
                            }
                            placeholder="Sin especificar"
                        />
                        <FieldError message={form.errors.gender} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="blood_type">Grupo sanguíneo</Label>
                        <EntitySelect
                            id="blood_type"
                            value={form.data.blood_type}
                            options={bloodTypeOptions}
                            onChange={(event) =>
                                form.setData('blood_type', event.target.value)
                            }
                            placeholder="Sin especificar"
                        />
                        <FieldError message={form.errors.blood_type} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contacto</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
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
                        <Label htmlFor="email">Correo electrónico</Label>
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

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                            id="address"
                            value={form.data.address}
                            onChange={(event) =>
                                form.setData('address', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.address)}
                        />
                        <FieldError message={form.errors.address} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emergency_contact_name">
                            Contacto de emergencia
                        </Label>
                        <Input
                            id="emergency_contact_name"
                            value={form.data.emergency_contact_name}
                            onChange={(event) =>
                                form.setData(
                                    'emergency_contact_name',
                                    event.target.value,
                                )
                            }
                            aria-invalid={Boolean(
                                form.errors.emergency_contact_name,
                            )}
                        />
                        <FieldError
                            message={form.errors.emergency_contact_name}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emergency_contact_phone">
                            Teléfono de emergencia
                        </Label>
                        <Input
                            id="emergency_contact_phone"
                            value={form.data.emergency_contact_phone}
                            onChange={(event) =>
                                form.setData(
                                    'emergency_contact_phone',
                                    event.target.value,
                                )
                            }
                            aria-invalid={Boolean(
                                form.errors.emergency_contact_phone,
                            )}
                        />
                        <FieldError
                            message={form.errors.emergency_contact_phone}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Información clínica</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="allergies">Alergias</Label>
                        <textarea
                            id="allergies"
                            value={form.data.allergies}
                            onChange={(event) =>
                                form.setData('allergies', event.target.value)
                            }
                            rows={3}
                            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            aria-invalid={Boolean(form.errors.allergies)}
                        />
                        <FieldError message={form.errors.allergies} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="medical_notes">
                            Notas médicas relevantes
                        </Label>
                        <textarea
                            id="medical_notes"
                            value={form.data.medical_notes}
                            onChange={(event) =>
                                form.setData(
                                    'medical_notes',
                                    event.target.value,
                                )
                            }
                            rows={4}
                            className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            aria-invalid={Boolean(form.errors.medical_notes)}
                        />
                        <FieldError message={form.errors.medical_notes} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link
                        href={
                            patient ? `/pacientes/${patient.id}` : index().url
                        }
                    >
                        Cancelar
                    </Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {patient ? 'Guardar cambios' : 'Registrar paciente'}
                </Button>
            </div>
        </form>
    );
}
