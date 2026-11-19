<?php

namespace App\Enums;

enum InstallmentStatus: string
{
    case Pendiente = 'pendiente';
    case Pagado = 'pagado';
    case Vencido = 'vencido';
    case Anulado = 'anulado';

    public function label(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::Pagado => 'Pagado',
            self::Vencido => 'Vencido',
            self::Anulado => 'Anulado',
        };
    }
}
