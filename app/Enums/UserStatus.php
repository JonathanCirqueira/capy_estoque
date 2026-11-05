<?php

declare(strict_types=1);

namespace App\Enums;

enum UserStatus: string
{
    case Pendente = 'pendente';
    case Ativo = 'ativo';
    case Inativo = 'inativo';

    public function label(): string
    {
        return match ($this) {
            self::Pendente => 'Pendente',
            self::Ativo => 'Ativo',
            self::Inativo => 'Inativo',
        };
    }
}
