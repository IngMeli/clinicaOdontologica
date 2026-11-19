<?php

namespace App\Enums;

enum OdontogramCondition: string
{
    case Sano = 'sano';
    case Caries = 'caries';
    case Obturado = 'obturado';
    case Corona = 'corona';
    case Extraido = 'extraido';
    case Endodoncia = 'endodoncia';
    case Implante = 'implante';
    case Sellante = 'sellante';
    case Fractura = 'fractura';

    public function label(): string
    {
        return match ($this) {
            self::Sano => 'Sano',
            self::Caries => 'Caries',
            self::Obturado => 'Obturado',
            self::Corona => 'Corona',
            self::Extraido => 'Extraído',
            self::Endodoncia => 'Endodoncia',
            self::Implante => 'Implante',
            self::Sellante => 'Sellante',
            self::Fractura => 'Fractura',
        };
    }
}
