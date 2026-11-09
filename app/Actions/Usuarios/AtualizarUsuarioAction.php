<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class AtualizarUsuarioAction
{
    /**
     * @param  array{name: string, email: string, role: string|UserRole, empresa?: string|null, telefone?: string|null, cpf_cnpj?: string|null}  $dados
     */
    public function execute(User $usuario, array $dados): User
    {
        return DB::transaction(function () use ($usuario, $dados): User {
            $role = $dados['role'] instanceof UserRole
                ? $dados['role']
                : UserRole::from((string) $dados['role']);

            $usuario->update([
                'name' => $dados['name'],
                'email' => $dados['email'],
                'role' => $role,
                'empresa' => $dados['empresa'] ?? null,
                'telefone' => $dados['telefone'] ?? null,
                'cpf_cnpj' => $dados['cpf_cnpj'] ?? null,
            ]);

            return $usuario->fresh() ?? $usuario;
        });
    }
}
