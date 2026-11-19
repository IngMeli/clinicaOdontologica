import { Badge } from '@/components/ui/badge';
import { statusLabel } from '@/lib/format';

type Props = {
    status: string;
};

const destructive = new Set([
    'cancelada',
    'cancelado',
    'fallido',
    'vencido',
    'no_asistio',
]);
const secondary = new Set([
    'pagado',
    'completado',
    'completada',
    'atendida',
    'activo',
    'aprobado',
]);

export function StatusBadge({ status }: Props) {
    const variant = destructive.has(status)
        ? 'destructive'
        : secondary.has(status)
          ? 'secondary'
          : 'outline';

    return <Badge variant={variant}>{statusLabel(status)}</Badge>;
}
