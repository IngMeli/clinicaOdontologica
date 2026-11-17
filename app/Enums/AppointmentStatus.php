<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Programada = 'programada';
    case Confirmada = 'confirmada';
    case Atendida = 'atendida';
    case Cancelada = 'cancelada';
    case NoAsistio = 'no_asistio';

    public function label(): string
    {
        return match ($this) {
            self::Programada => 'Programada',
            self::Confirmada => 'Confirmada',
            self::Atendida => 'Atendida',
            self::Cancelada => 'Cancelada',
            self::NoAsistio => 'No asistió',
        };
    }
}
