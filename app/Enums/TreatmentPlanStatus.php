<?php

namespace App\Enums;

enum TreatmentPlanStatus: string
{
    case Borrador = 'borrador';
    case Aprobado = 'aprobado';
    case EnProgreso = 'en_progreso';
    case Completado = 'completado';
    case Cancelado = 'cancelado';

    public function label(): string
    {
        return match ($this) {
            self::Borrador => 'Borrador',
            self::Aprobado => 'Aprobado',
            self::EnProgreso => 'En progreso',
            self::Completado => 'Completado',
            self::Cancelado => 'Cancelado',
        };
    }
}
