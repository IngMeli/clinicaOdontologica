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
        inactivo: 'Inactivo',
        abierta: 'Abierta',
        cerrada: 'Cerrada',
    };

    return labels[status] ?? status.replaceAll('_', ' ');
}

export function formatTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('es-BO', {
        timeStyle: 'short',
    }).format(new Date(value));
}

export function calculateAge(
    birthDate: string | null | undefined,
): number | null {
    if (!birthDate) {
        return null;
    }

    const birth = new Date(birthDate);

    if (Number.isNaN(birth.getTime())) {
        return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }

    return age;
}

export function toDateTimeLocal(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const pad = (part: number) => String(part).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toDateInput(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const pad = (part: number) => String(part).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
