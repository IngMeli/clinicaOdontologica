import { Link, useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, store, update } from '@/routes/treatments';
import type { Treatment, TreatmentFormData } from '@/types';

type Props = {
    treatment?: Treatment;
    categories: string[];
};

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="text-xs text-destructive">{message}</p>;
}

export function TreatmentForm({ treatment, categories }: Props) {
    const form = useForm<TreatmentFormData>({
        name: treatment?.name ?? '',
        category: treatment?.category ?? '',
        description: treatment?.description ?? '',
        price: treatment ? String(treatment.price) : '',
        duration_minutes: String(treatment?.duration_minutes ?? 30),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (treatment) {
            form.put(update(treatment.id).url, { preserveScroll: true });
            return;
        }

        form.post(store().url, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Datos del procedimiento</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            placeholder="Ej. Limpieza dental, endodoncia..."
                            aria-invalid={Boolean(form.errors.name)}
                            autoFocus
                        />
                        <FieldError message={form.errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Input
                            id="category"
                            list="treatment-categories"
                            value={form.data.category}
                            onChange={(event) =>
                                form.setData('category', event.target.value)
                            }
                            placeholder="Preventiva, restauradora..."
                            aria-invalid={Boolean(form.errors.category)}
                        />
                        <datalist id="treatment-categories">
                            {categories.map((category) => (
                                <option key={category} value={category} />
                            ))}
                        </datalist>
                        <FieldError message={form.errors.category} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration_minutes">
                            Duración (min) *
                        </Label>
                        <Input
                            id="duration_minutes"
                            type="number"
                            min={5}
                            max={480}
                            step={5}
                            value={form.data.duration_minutes}
                            onChange={(event) =>
                                form.setData(
                                    'duration_minutes',
                                    event.target.value,
                                )
                            }
                            aria-invalid={Boolean(form.errors.duration_minutes)}
                        />
                        <FieldError message={form.errors.duration_minutes} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Precio (Bs.) *</Label>
                        <Input
                            id="price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.data.price}
                            onChange={(event) =>
                                form.setData('price', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.price)}
                        />
                        <FieldError message={form.errors.price} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Descripción</Label>
                        <textarea
                            id="description"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            rows={4}
                            className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            aria-invalid={Boolean(form.errors.description)}
                        />
                        <FieldError message={form.errors.description} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href={index().url}>Cancelar</Link>
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {treatment ? 'Guardar cambios' : 'Registrar tratamiento'}
                </Button>
            </div>
        </form>
    );
}
