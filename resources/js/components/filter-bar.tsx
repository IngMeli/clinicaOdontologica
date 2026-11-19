import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
};

export function FilterBar({ children, actions, className }: Props) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3',
                className,
            )}
        >
            <div className="flex flex-1 flex-wrap items-end gap-3">
                {children}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
