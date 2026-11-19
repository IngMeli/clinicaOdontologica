import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type EntityOption = {
    value: string | number;
    label: string;
    disabled?: boolean;
};

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    options: EntityOption[];
    placeholder?: string;
    containerClassName?: string;
};

export function EntitySelect({
    options,
    placeholder = 'Selecciona una opción',
    className,
    containerClassName,
    ...props
}: Props) {
    return (
        <div className={cn('relative', containerClassName)}>
            <select
                className={cn(
                    'flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
                    className,
                )}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
    );
}
