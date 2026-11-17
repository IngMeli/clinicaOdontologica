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
}
