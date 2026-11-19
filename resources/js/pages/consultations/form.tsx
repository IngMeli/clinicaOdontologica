import { Link, useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDateTimeLocal } from '@/lib/format';
import { show, update } from '@/routes/consultations';
import type { Consultation, ConsultationFormData } from '@/types';

type Props = {
    consultation: Consultation;
};

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

export function ConsultationForm({ consultation }: Props) {
    const form = useForm<ConsultationFormData>({
        consulted_at: toDateTimeLocal(consultation.consulted_at),
        reason: consultation.reason,
        diagnosis: consultation.diagnosis ?? '',
        observations: consultation.observations ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(update(consultation.id).url, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Registro clínico</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="consulted_at">Fecha y hora *</Label>
                        <Input
                            id="consulted_at"
                            type="datetime-local"
                            value={form.data.consulted_at}
                            onChange={(event) =>
                                form.setData('consulted_at', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.consulted_at)}
                        />
                        <FieldError message={form.errors.consulted_at} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo *</Label>
                        <textarea
                            id="reason"
                            value={form.data.reason}
                            onChange={(event) =>
                                form.setData('reason', event.target.value)
                            }
                            rows={3}
                            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            aria-invalid={Boolean(form.errors.reason)}
                        />
                        <FieldError message={form.errors.reason} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diagnosis">Diagnóstico</Label>
                        <textarea
                            id="diagnosis"
                            value={form.data.diagnosis}
                            onChange={(event) =>
                                form.setData('diagnosis', event.target.value)
                            }
                            rows={4}
                            className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            aria-invalid={Boolean(form.errors.diagnosis)}
                        />
                        <FieldError message={form.errors.diagnosis} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observations">Observaciones</Label>
                        <textarea
                            id="observations"
                            value={form.data.observations}
                            onChange={(event) =>
                                form.setData('observations', event.target.value)
                            }
                            rows={4}
                            className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            aria-invalid={Boolean(form.errors.observations)}
                        />
                        <FieldError message={form.errors.observations} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href={show(consultation.id).url}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    Guardar cambios
                </Button>
            </div>
        </form>
    );
}
