<?php

namespace App\Enums;

enum RoleName: string
{
    case Administrador = 'administrador';
    case Encargado = 'encargado';
    case Doctor = 'doctor';
    case Secretaria = 'secretaria';
    case Paciente = 'paciente';

    public function label(): string
    {
        return match ($this) {
            self::Administrador => 'Administrador del sistema',
            self::Encargado => 'Encargado',
            self::Doctor => 'Doctor',
            self::Secretaria => 'Secretaria',
            self::Paciente => 'Paciente',
        };
    }

    /**
     * @return array<int, self>
     */
    public static function businessRoles(): array
    {
        return [self::Encargado, self::Doctor, self::Secretaria, self::Paciente];
    }
}
