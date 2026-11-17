<?php

namespace App\Enums;

enum InstallmentStatus: string
{
    case Pendiente = 'pendiente';
    case Pagado = 'pagado';
    case Vencido = 'vencido';
    case Anulado = 'anulado';
}
