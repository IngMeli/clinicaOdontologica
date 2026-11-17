<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pendiente = 'pendiente';
    case Pagado = 'pagado';
    case Fallido = 'fallido';
    case Anulado = 'anulado';
    case Reembolsado = 'reembolsado';

    public function label(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::Pagado => 'Pagado',
            self::Fallido => 'Fallido',
            self::Anulado => 'Anulado',
            self::Reembolsado => 'Reembolsado',
        };
    }
}
