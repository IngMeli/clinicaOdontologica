<?php

namespace App\Enums;

enum ToothSurface: string
{
    case Oclusal = 'oclusal';
    case Mesial = 'mesial';
    case Distal = 'distal';
    case Vestibular = 'vestibular';
    case Lingual = 'lingual';

    public function label(): string
    {
        return match ($this) {
            self::Oclusal => 'Oclusal',
            self::Mesial => 'Mesial',
            self::Distal => 'Distal',
            self::Vestibular => 'Vestibular',
            self::Lingual => 'Lingual / palatino',
        };
    }
}
