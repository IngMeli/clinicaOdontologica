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
    case DienteErupcionado = 'diente_erupcionado';
    case CoronaProvisional = 'corona_provisional';
    case Bruxismo = 'bruxismo';
    case RestauracionProvisional = 'restauracion_provisional';
    case ProtesisFija = 'protesis_fija';
    case ProtesisRemovible = 'protesis_removible';
    case IncrustacionEstetica = 'incrustacion_estetica';
    case FracturaDental = 'fractura_dental';
    case MovilidadPatologica = 'movilidad_patologica';
    case PiezaMalPosicionada = 'pieza_mal_posicionada';
    case TratamientoConductos = 'tratamiento_conductos';
    case ManchaBlanca = 'mancha_blanca';
    case SurcoProfundo = 'surco_profundo';
    case Hipoplasia = 'hipoplasia';

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
            self::DienteErupcionado => 'Diente erupcionado',
            self::CoronaProvisional => 'Corona provisional',
            self::Bruxismo => 'Bruxismo',
            self::RestauracionProvisional => 'Restauración provisional',
            self::ProtesisFija => 'Prótesis fija',
            self::ProtesisRemovible => 'Prótesis removible',
            self::IncrustacionEstetica => 'Incrustación estética',
            self::FracturaDental => 'Fractura dental',
            self::MovilidadPatologica => 'Movilidad patológica',
            self::PiezaMalPosicionada => 'Pieza mal posicionada',
            self::TratamientoConductos => 'Tratamiento de conductos',
            self::ManchaBlanca => 'Mancha blanca',
            self::SurcoProfundo => 'Surco profundo',
            self::Hipoplasia => 'Hipoplasia',
        };
    }

    public function code(): string
    {
        return match ($this) {
            self::Sano => 'S',
            self::Caries => 'C',
            self::Obturado => '=',
            self::Corona => 'Cr',
            self::Extraido => 'X',
            self::Endodoncia => 'EP',
            self::Implante => 'Imp',
            self::Sellante => 'Se',
            self::Fractura => 'F',
            self::DienteErupcionado => 'De',
            self::CoronaProvisional => 'CP',
            self::Bruxismo => 'B',
            self::RestauracionProvisional => 'RP',
            self::ProtesisFija => 'PF',
            self::ProtesisRemovible => 'Pr',
            self::IncrustacionEstetica => 'Iec',
            self::FracturaDental => 'FD',
            self::MovilidadPatologica => 'MPD',
            self::PiezaMalPosicionada => 'PM',
            self::TratamientoConductos => 'TC',
            self::ManchaBlanca => 'MB',
            self::SurcoProfundo => 'SP',
            self::Hipoplasia => 'Hp',
        };
    }
}
