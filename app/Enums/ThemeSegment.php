<?php

namespace App\Enums;

enum ThemeSegment: string
{
    case Ninos = 'ninos';
    case Jovenes = 'jovenes';
    case Adultos = 'adultos';

    public function label(): string
    {
        return match ($this) {
            self::Ninos => 'Niños',
            self::Jovenes => 'Jóvenes',
            self::Adultos => 'Adultos',
        };
    }
}
