<?php

namespace App\Enums;

enum PaymentMethodType: string
{
    case Qr = 'qr';
    case Tarjeta = 'tarjeta';
    case Transferencia = 'transferencia';
    case Efectivo = 'efectivo';

    public function label(): string
    {
        return match ($this) {
            self::Qr => 'Pago QR',
            self::Tarjeta => 'Tarjeta',
            self::Transferencia => 'Transferencia',
            self::Efectivo => 'Efectivo',
        };
    }
}
