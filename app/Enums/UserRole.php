<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case UsuarioPadrao = 'usuario_padrao';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::UsuarioPadrao => 'Usuário Padrão',
        };
    }
}
