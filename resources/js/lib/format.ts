export const currency = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

export function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return dateTimeFormatter.format(new Date(value));
}

export function formatAmount(value: string | number): string {
    return currency.format(Number(value));
}

export function statusLabel(status: string): string {
    const labels: Record<string, string> = {
        programada: 'Programada',
        confirmada: 'Confirmada',
        atendida: 'Atendida',
        completada: 'Completada',
        cancelada: 'Cancelada',
        no_asistio: 'No asistió',
        borrador: 'Borrador',
        propuesto: 'Propuesto',
        aprobado: 'Aprobado',
        en_progreso: 'En progreso',
        finalizado: 'Finalizado',
        pendiente: 'Pendiente',
        pagado: 'Pagado',
        vencido: 'Vencido',
        activo: 'Activo',
        abierta: 'Abierta',
        cerrada: 'Cerrada',
    };

    return labels[status] ?? status.replaceAll('_', ' ');
}
