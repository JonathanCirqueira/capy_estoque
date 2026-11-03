<?php

declare(strict_types=1);

namespace App\Enums;

enum PlanoCiclo: string
{
    case Mensal = 'mensal';
    case Anual = 'anual';

    public function label(): string
    {
        return match ($this) {
            self::Mensal => 'Mensal',
            self::Anual => 'Anual',
        };
    }
}
