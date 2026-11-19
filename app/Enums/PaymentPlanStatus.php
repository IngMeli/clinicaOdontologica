<?php

namespace App\Enums;

enum PaymentPlanStatus: string
{
    case Activo = 'activo';
    case Pagado = 'pagado';
    case Cancelado = 'cancelado';

    public function label(): string
    {
        return match ($this) {
            self::Activo => 'Activo',
            self::Pagado => 'Pagado',
            self::Cancelado => 'Cancelado',
        };
    }
}
