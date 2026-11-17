import { Head } from '@inertiajs/react';
import { Baby, Monitor, Moon, Sparkles, Sun, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { usePreferences } from '@/hooks/use-preferences';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import type { ThemeMode, ThemeSegment } from '@/types';

const segments: {
    value: ThemeSegment;
    label: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        value: 'ninos',
        label: 'Niños',
        description:
            'Colores alegres, alto contraste amable y tipografía clara.',
        icon: Baby,
    },
    {
        value: 'jovenes',
        label: 'Jóvenes',
        description: 'Tonos frescos, moderna y con acentos vibrantes.',
        icon: Sparkles,
    },
    {
        value: 'adultos',
        label: 'Adultos',
        description: 'Paleta neutra y sobria para el trabajo diario.',
        icon: UserRound,
    },
];

const modes: { value: ThemeMode; label: string; icon: LucideIcon }[] = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'auto', label: 'Automático', icon: Monitor },
];

export default function Appearance() {
    const {
        preferences,
        setSegment,
        setMode,
        setFontScale,
        toggleHighContrast,
    } = usePreferences();

    return (
        <>
            <Head title="Apariencia y accesibilidad" />

            <h1 className="sr-only">Apariencia y accesibilidad</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Apariencia y accesibilidad"
                    description="Personaliza el tema, el tamaño de letra y el contraste. Los cambios se guardan automáticamente."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Segmento visual</CardTitle>
                        <CardDescription>
                            Tres temas adaptados a distintos grupos de usuarios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        {segments.map((segment) => {
                            const active =
                                preferences.theme_segment === segment.value;

                            return (
                                <button
                                    key={segment.value}
                                    type="button"
                                    onClick={() => setSegment(segment.value)}
                                    className={cn(
                                        'rounded-xl border p-4 text-left transition-colors',
                                        active
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'hover:bg-accent',
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <segment.icon className="size-5" />
                                        {active && (
                                            <Badge variant="secondary">
                                                Activo
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-3 font-medium">
                                        {segment.label}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {segment.description}
                                    </p>
                                </button>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Modo de color</CardTitle>
                        <CardDescription>
                            El modo automático sigue la preferencia del sistema
                            operativo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {modes.map((mode) => {
                            const active =
                                preferences.theme_mode === mode.value;

                            return (
                                <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() => setMode(mode.value)}
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors',
                                        active
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'hover:bg-accent',
                                    )}
                                >
                                    <mode.icon className="size-4" />
                                    {mode.label}
                                </button>
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Escala tipográfica</CardTitle>
                            <CardDescription>
                                Ajusta el tamaño base de la letra para mejorar
                                la lectura.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <Label htmlFor="font-scale">Tamaño</Label>
                                <span className="font-medium">
                                    {preferences.font_scale}%
                                </span>
                            </div>
                            <Slider
                                id="font-scale"
                                min={80}
                                max={150}
                                step={5}
                                value={[preferences.font_scale]}
                                onValueChange={([value]) =>
                                    setFontScale(value ?? 100)
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Afecta a toda la interfaz, incluidos formularios
                                y tablas.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Alto contraste</CardTitle>
                            <CardDescription>
                                Refuerza bordes, textos y estados de foco para
                                personas con baja visión.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="high-contrast">
                                    Activar alto contraste
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Se combina con el tema seleccionado.
                                </p>
                            </div>
                            <Switch
                                id="high-contrast"
                                checked={preferences.high_contrast}
                                onCheckedChange={toggleHighContrast}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Vista previa</CardTitle>
                        <CardDescription>
                            Así se verán los componentes principales.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border bg-card p-4">
                            <p className="text-sm font-medium">
                                Clínica Odontológica Sonrisa Sana
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Panel de control, agenda, pacientes y pagos con
                                navegación dinámica según permisos.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>Primario</Badge>
                                <Badge variant="secondary">Secundario</Badge>
                                <Badge variant="outline">Outline</Badge>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Preferencias guardadas para tu cuenta y replicadas
                            en este dispositivo mediante almacenamiento local.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Apariencia',
            href: editAppearance(),
        },
    ],
};
