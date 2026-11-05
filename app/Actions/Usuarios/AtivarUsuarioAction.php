<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class AtivarUsuarioAction
{
    public function execute(User $usuario): User
    {
        return DB::transaction(function () use ($usuario): User {
            $usuario->update([
                'status' => UserStatus::Ativo,
            ]);

            return $usuario->fresh() ?? $usuario;
        });
    }
}
