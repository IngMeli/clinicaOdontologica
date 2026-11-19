import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: string;
    actions?: ReactNode;
    eyebrow?: string;
};

export function PageHeader({ title, description, actions, eyebrow }: Props) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
                {eyebrow && (
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
