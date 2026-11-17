import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    Eye,
    LockKeyhole,
    Palette,
    Search,
    ShieldCheck,
    Stethoscope,
    Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';

const features = [
    {
        icon: ShieldCheck,
        title: 'Roles y permisos',
        description:
            'Administrador, encargado, doctor, secretaria y paciente con menú dinámico.',
    },
    {
        icon: CalendarDays,
        title: 'Gestión clínica',
        description:
            'Pacientes, agenda, consultas, odontograma, tratamientos y recetas.',
    },
    {
        icon: Wallet,
        title: 'Pagos electrónicos',
        description:
            'Pagos únicos y planes de cuotas con pasarela simulada y recibos.',
    },
    {
        icon: Activity,
        title: 'Auditoría',
        description:
            'Bitácora de accesos, inicios de sesión y contadores persistentes.',
    },
    {
        icon: Palette,
        title: 'Tres temas',
        description:
            'Niños, jóvenes y adultos, con modo claro/oscuro y alto contraste.',
    },
    {
        icon: Search,
        title: 'Búsqueda global',
        description:
            'Encuentra pacientes, tratamientos, inventario y pagos desde el encabezado.',
    },
];

export default function Welcome() {
    const { auth, visits } = usePage().props;

    return (
        <>
            <Head title="Clínica Odontológica" />
            <div className="flex min-h-screen flex-col bg-background">
                <header className="border-b border-border/70">
                    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                        <div className="flex items-center gap-2 font-semibold">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Stethoscope className="size-5" />
                            </span>
                            Clínica Odontológica
                        </div>
                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>Ir al panel</Link>
                                </Button>
                            ) : (
                                <Button asChild>
                                    <Link href={login()}>
                                        <LockKeyhole className="size-4" />
                                        Iniciar sesión
                                    </Link>
                                </Button>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-12">
                    <section className="grid items-center gap-10 lg:grid-cols-2">
                        <div className="space-y-5">
                            <Badge variant="secondary">
                                Proyecto 2 · INF513
                            </Badge>
                            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                                Sistema de gestión para clínica odontológica
                            </h1>
                            <p className="max-w-xl text-muted-foreground">
                                Arquitectura de tres capas, Laravel, Inertia y
                                React. Acceso por roles, auditoría persistente,
                                temas accesibles y una API REST para
                                integraciones.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button size="lg" asChild>
                                    <Link href={login()}>
                                        Acceder al sistema
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="#caracteristicas">
                                        Conocer características
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="rounded-2xl border bg-card p-6 shadow-sm">
                            <h2 className="text-sm font-semibold">
                                Cuentas de demostración
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Contraseña para todas: <code>password</code>
                            </p>
                            <ul className="mt-4 space-y-2 text-sm">
                                {[
                                    ['Administrador', 'admin@clinica.test'],
                                    ['Encargado', 'encargado@clinica.test'],
                                    ['Doctor', 'doctor@clinica.test'],
                                    ['Secretaria', 'secretaria@clinica.test'],
                                    ['Paciente', 'paciente@clinica.test'],
                                ].map(([role, email]) => (
                                    <li
                                        key={email}
                                        className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                                    >
                                        <span className="text-muted-foreground">
                                            {role}
                                        </span>
                                        <code className="text-xs">{email}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section
                        id="caracteristicas"
                        className="scroll-mt-24 space-y-6"
                    >
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Características principales
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Requisitos transversales implementados en esta
                                entrega base.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-xl border bg-card p-5"
                                >
                                    <feature.icon className="size-5 text-primary" />
                                    <h3 className="mt-3 font-medium">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border/70">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <span>Clínica Odontológica · INF513 · Proyecto 2</span>
                        <span className="inline-flex items-center gap-1.5">
                            <Eye className="size-3.5" />
                            Visitas a esta página:{' '}
                            <strong>{visits.current}</strong>
                            <span className="mx-1">·</span>
                            Accesos totales: <strong>{visits.total}</strong>
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
