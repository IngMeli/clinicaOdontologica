<?php

namespace App\Enums;

enum PaymentPlanStatus: string
{
    case Activo = 'activo';
    case Pagado = 'pagado';
    case Cancelado = 'cancelado';
}
