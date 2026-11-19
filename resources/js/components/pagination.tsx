import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total: number;
    className?: string;
};

export function Pagination({ links, from, to, total, className }: Props) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex flex-wrap items-center justify-between gap-3',
                className,
            )}
        >
            <p className="text-xs text-muted-foreground">
                Mostrando {from ?? 0}–{to ?? 0} de {total} registros
            </p>
            <nav className="flex flex-wrap items-center gap-1">
                {links.map((link, index) => {
                    const isPrevious = index === 0;
                    const isNext = index === links.length - 1;
                    const label = link.label
                        .replace('&laquo;', '')
                        .replace('&raquo;', '')
                        .trim();

                    const content = isPrevious ? (
                        <ChevronLeft className="size-4" />
                    ) : isNext ? (
                        <ChevronRight className="size-4" />
                    ) : (
                        label
                    );

                    if (!link.url) {
                        return (
                            <span
                                key={`${link.label}-${index}`}
                                className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs text-muted-foreground opacity-50"
                            >
                                {content}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            className={cn(
                                'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs transition-colors hover:bg-accent',
                                link.active &&
                                    'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
                            )}
                        >
                            {content}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
