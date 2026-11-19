import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type DataTableColumn<T> = {
    key: string;
    header: ReactNode;
    cell: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
};

type Props<T> = {
    columns: DataTableColumn<T>[];
    rows: T[];
    getRowKey: (row: T) => string | number;
    emptyMessage?: string;
    footer?: ReactNode;
    className?: string;
};

export function DataTable<T>({
    columns,
    rows,
    getRowKey,
    emptyMessage = 'No hay registros para mostrar.',
    footer,
    className,
}: Props<T>) {
    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full text-sm">
                <thead className="border-b text-left text-xs text-muted-foreground">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    'py-2 pr-3 font-medium last:pr-0',
                                    column.headerClassName,
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={getRowKey(row)}
                            className="border-b border-border/60 last:border-0"
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={cn(
                                        'py-2 pr-3 align-middle last:pr-0',
                                        column.className,
                                    )}
                                >
                                    {column.cell(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="py-8 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
                {footer && (
                    <tfoot className="border-t">
                        <tr>
                            <td colSpan={columns.length} className="pt-3">
                                {footer}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}
