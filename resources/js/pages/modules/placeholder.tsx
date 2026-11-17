import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { menuIcon } from '@/lib/menu-icons';
import { dashboard } from '@/routes';

type Props = {
    title: string;
    description: string;
    icon?: string | null;
};

const pendingFeatures = [
    'Validación en cliente y servidor con mensajes en español.',
    'Registro de auditoría y control de acceso por rol.',
    'Diseño accesible con los tres temas y alto contraste.',
];

export default function Placeholder({ title, description, icon }: Props) {
    const Icon = menuIcon(icon);

    return (
        <>
            <Head title={title} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Card className="overflow-hidden">
                    <CardHeader className="border-b bg-muted/40">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <Icon className="size-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-xl">
                                            {title}
                                        </CardTitle>
                                        <Badge variant="secondary">
                                            <Clock3 className="size-3" />
                                            En construcción
                                        </Badge>
                                    </div>
                                    <CardDescription className="max-w-2xl">
                                        {description}
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href={dashboard()}>
                                    <ArrowLeft className="size-4" />
                                    Volver al panel
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 py-6 md:grid-cols-[1.3fr_1fr]">
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold">
                                Este módulo forma parte del esquema completo del
                                sistema
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                La base de datos, los modelos, permisos y el
                                menú dinámico ya están preparados. Las pantallas
                                de alta, edición y listado se implementarán en
                                la siguiente iteración del proyecto, manteniendo
                                la arquitectura de tres capas y la API REST.
                            </p>
                            <ul className="space-y-2 text-sm">
                                {pendingFeatures.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2"
                                    >
                                        <CheckCircle2 className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
                            <Icon className="mx-auto size-10 text-muted-foreground" />
                            <p className="mt-3 text-sm font-medium">
                                Acceso habilitado por permisos
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Solo los roles autorizados ven este módulo en el
                                menú lateral.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
