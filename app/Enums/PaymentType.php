<?php

namespace App\Enums;

enum PaymentType: string
{
    case Tratamiento = 'tratamiento';
    case Farmacia = 'farmacia';
    case Consulta = 'consulta';
    case Cuota = 'cuota';
    case Otro = 'otro';

    public function label(): string
    {
        return match ($this) {
            self::Tratamiento => 'Tratamiento',
            self::Farmacia => 'Farmacia',
            self::Consulta => 'Consulta',
            self::Cuota => 'Cuota',
            self::Otro => 'Otro',
        };
    }
}
