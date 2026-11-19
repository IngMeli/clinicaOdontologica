<?php

namespace App\Enums;

enum TreatmentItemStatus: string
{
    case Pendiente = 'pendiente';
    case EnProgreso = 'en_progreso';
    case Completado = 'completado';

    public function label(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::EnProgreso => 'En progreso',
            self::Completado => 'Completado',
        };
    }
}
