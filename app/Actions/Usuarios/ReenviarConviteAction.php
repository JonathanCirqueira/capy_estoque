<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

final class ReenviarConviteAction
{
    public function execute(User $usuario): User
    {
        if ($usuario->status !== UserStatus::Pendente) {
            throw new InvalidArgumentException('Apenas usuários com status pendente podem receber reenvio de convite.');
        }

        return DB::transaction(function () use ($usuario): User {
            $usuario->update([
                'convite_token' => Str::random(64),
                'convite_expira_em' => now()->addDays(7),
            ]);

            return $usuario->fresh() ?? $usuario;
        });
    }
}
