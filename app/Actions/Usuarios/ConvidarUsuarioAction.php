<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class ConvidarUsuarioAction
{
    /**
     * @param  array{name: string, email: string, role: string|UserRole, empresa?: string|null, telefone?: string|null, cpf_cnpj?: string|null}  $dados
     */
    public function execute(array $dados): User
    {
        return DB::transaction(function () use ($dados): User {
            $role = $dados['role'] instanceof UserRole
                ? $dados['role']
                : UserRole::from((string) $dados['role']);

            return User::create([
                'name' => $dados['name'],
                'email' => $dados['email'],
                'role' => $role,
                'status' => UserStatus::Pendente,
                'empresa' => $dados['empresa'] ?? null,
                'telefone' => $dados['telefone'] ?? null,
                'cpf_cnpj' => $dados['cpf_cnpj'] ?? null,
                'password' => Hash::make(Str::random(32)),
                'convite_token' => Str::random(64),
                'convite_expira_em' => now()->addDays(7),
            ]);
        });
    }
}
