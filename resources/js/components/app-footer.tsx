import { usePage } from '@inertiajs/react';
import { Eye, Globe2 } from 'lucide-react';

export function AppFooter() {
    const { visits } = usePage().props;

    return (
        <footer className="mt-auto flex flex-col gap-2 border-t border-sidebar-border/60 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-3.5" />
                    Visitas a esta página: <strong>{visits.current}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Globe2 className="size-3.5" />
                    Accesos totales: <strong>{visits.total}</strong>
                </span>
            </div>
            <span>Clínica Odontológica · INF513 · Proyecto 2</span>
        </footer>
    );
}
