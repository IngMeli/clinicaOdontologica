import type { InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    containerClassName?: string;
};

export function MoneyInput({ className, containerClassName, ...props }: Props) {
    return (
        <div className={cn('relative', containerClassName)}>
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                Bs.
            </span>
            <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className={cn('pl-9', className)}
                {...props}
            />
        </div>
    );
}
