<?php

namespace App\Enums;

enum PaymentType: string
{
    case Tratamiento = 'tratamiento';
    case Farmacia = 'farmacia';
    case Consulta = 'consulta';
    case Cuota = 'cuota';
    case Otro = 'otro';
}
