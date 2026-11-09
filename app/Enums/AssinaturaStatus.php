<?php

declare(strict_types=1);

namespace App\Enums;

enum AssinaturaStatus: string
{
    case Active = 'active';
    case PastDue = 'past_due';
    case Canceled = 'canceled';
    case Trialing = 'trialing';
    case Incomplete = 'incomplete';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Ativa',
            self::PastDue => 'Em Atraso',
            self::Canceled => 'Cancelada',
            self::Trialing => 'Período de Testes',
            self::Incomplete => 'Incompleta',
        };
    }
}
