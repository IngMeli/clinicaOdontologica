import { Link } from '@inertiajs/react';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { menuIcon } from '@/lib/menu-icons';

type SearchResult = {
    group: string;
    label: string;
    subtitle: string;
    url: string;
    icon: string;
};

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                setOpen(true);
            }
        };

        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (query.trim().length < 2) {
            setResults([]);
            setLoading(false);

            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoading(true);

            try {
                const response = await fetch(
                    `/api/v1/search?q=${encodeURIComponent(query.trim())}`,
                    {
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                        signal: controller.signal,
                    },
                );

                if (response.ok) {
                    const payload = await response.json();
                    setResults(payload.data ?? []);
                }
            } catch {
                // Ignora búsquedas canceladas o sin sesión.
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [query, open]);

    const grouped = useMemo(() => {
        return results.reduce<Record<string, SearchResult[]>>((acc, item) => {
            acc[item.group] = [...(acc[item.group] ?? []), item];

            return acc;
        }, {});
    }, [results]);

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="h-9 w-full justify-start gap-2 text-muted-foreground sm:w-64"
            >
                <Search className="size-4" />
                <span className="hidden sm:inline">
                    Buscar en el sistema...
                </span>
                <span className="sm:hidden">Buscar</span>
                <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
                    Ctrl K
                </kbd>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[70vh] gap-3 overflow-hidden sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Búsqueda global</DialogTitle>
                        <DialogDescription>
                            Pacientes, tratamientos, planes, inventario y pagos.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Escribe al menos 2 caracteres..."
                            className="pl-9"
                        />
                        {loading && (
                            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    <div className="max-h-[45vh] space-y-4 overflow-y-auto pr-1">
                        {query.trim().length < 2 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Usa Ctrl + K en cualquier pantalla para buscar
                                rápidamente.
                            </p>
                        )}

                        {query.trim().length >= 2 &&
                            !loading &&
                            results.length === 0 && (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No se encontraron resultados para “
                                    {query.trim()}”.
                                </p>
                            )}

                        {Object.entries(grouped).map(([group, items]) => (
                            <section key={group} className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{group}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {items.length} resultado(s)
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {items.map((item) => {
                                        const Icon = menuIcon(item.icon);

                                        return (
                                            <Link
                                                key={`${group}-${item.label}-${item.url}`}
                                                href={item.url}
                                                onClick={() => setOpen(false)}
                                                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
                                            >
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                                    <Icon className="size-4" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-medium">
                                                        {item.label}
                                                    </span>
                                                    <span className="block truncate text-xs text-muted-foreground">
                                                        {item.subtitle}
                                                    </span>
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
