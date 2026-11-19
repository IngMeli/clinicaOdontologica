<?php

namespace App\Enums;

enum StockMovementType: string
{
    case Compra = 'compra';
    case AjustePositivo = 'ajuste_positivo';
    case AjusteNegativo = 'ajuste_negativo';
    case Dispensacion = 'dispensacion';
    case Venta = 'venta';
    case Devolucion = 'devolucion';

    public function label(): string
    {
        return match ($this) {
            self::Compra => 'Compra',
            self::AjustePositivo => 'Ajuste positivo',
            self::AjusteNegativo => 'Ajuste negativo',
            self::Dispensacion => 'Dispensación',
            self::Venta => 'Venta',
            self::Devolucion => 'Devolución',
        };
    }

    public function isIncoming(): bool
    {
        return in_array($this, [self::Compra, self::AjustePositivo, self::Devolucion], true);
    }
}
