<?php

namespace App\Enums;

enum TreatmentItemStatus: string
{
    case Pendiente = 'pendiente';
    case EnProgreso = 'en_progreso';
    case Completado = 'completado';
}
