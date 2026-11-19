import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductCategoryRef } from '@/types';

type Props = {
    categories: ProductCategoryRef[];
    canManage: boolean;
};

type CategoryFormData = {
    name: string;
    description: string;
};

export default function InventoryCategories({ categories, canManage }: Props) {
    return (
        <>
            <Head title="Categorías de inventario" />
            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    eyebrow="Inventario"
                    title="Categorías"
                    description="Agrupa los productos para facilitar búsquedas y reportes."
                    actions={
                        <Button variant="outline" asChild>
                            <Link href="/inventario">
                                <ArrowLeft className="size-4" />
                                Volver al inventario
                            </Link>
                        </Button>
                    }
                />

                {canManage && <CreateCategory />}

                <Card>
                    <CardHeader>
                        <CardTitle>Categorías registradas</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/60">
                        {categories.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Aún no hay categorías registradas.
                            </p>
                        )}
                        {categories.map((category) => (
                            <CategoryRow
                                key={category.id}
                                category={category}
                                canManage={canManage}
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function CreateCategory() {
    const form = useForm<CategoryFormData>({ name: '', description: '' });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/inventario/categorias', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Nueva categoría
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={submit}
                    className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"
                >
                    <div className="space-y-1">
                        <Label htmlFor="new-category-name">Nombre *</Label>
                        <Input
                            id="new-category-name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="new-category-description">
                            Descripción
                        </Label>
                        <Input
                            id="new-category-description"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                        />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            Registrar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function CategoryRow({
    category,
    canManage,
}: {
    category: ProductCategoryRef;
    canManage: boolean;
}) {
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <EditCategory
                category={category}
                onClose={() => setEditing(false)}
            />
        );
    }

    return (
        <div className="flex items-center justify-between gap-3 py-3">
            <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                    {category.description || 'Sin descripción'} ·{' '}
                    {category.products_count ?? 0} producto(s)
                </p>
            </div>
            {canManage && (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil className="size-4" />
                        Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (
                                window.confirm(
                                    `¿Eliminar la categoría "${category.name}"?`,
                                )
                            ) {
                                router.delete(
                                    `/inventario/categorias/${category.id}`,
                                    { preserveScroll: true },
                                );
                            }
                        }}
                    >
                        <Trash2 className="size-4 text-destructive" />
                        Eliminar
                    </Button>
                </div>
            )}
        </div>
    );
}

function EditCategory({
    category,
    onClose,
}: {
    category: ProductCategoryRef;
    onClose: () => void;
}) {
    const form = useForm<CategoryFormData>({
        name: category.name,
        description: category.description ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/inventario/categorias/${category.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <form
            onSubmit={submit}
            className="grid gap-3 py-3 md:grid-cols-[1fr_2fr_auto]"
        >
            <div className="space-y-1">
                <Label htmlFor={`category-name-${category.id}`}>Nombre *</Label>
                <Input
                    id={`category-name-${category.id}`}
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                />
                {form.errors.name && (
                    <p className="text-xs text-destructive">
                        {form.errors.name}
                    </p>
                )}
            </div>
            <div className="space-y-1">
                <Label htmlFor={`category-description-${category.id}`}>
                    Descripción
                </Label>
                <Input
                    id={`category-description-${category.id}`}
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                />
            </div>
            <div className="flex items-end gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>
                    Guardar
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
