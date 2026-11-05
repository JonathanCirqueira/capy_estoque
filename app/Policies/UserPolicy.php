<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

final class UserPolicy
{
    /**
     * Determina se o usuário autenticado pode listar os usuários.
     */
    public function viewAny(User $authUser): bool
    {
        return $authUser->role === UserRole::Admin;
    }

    /**
     * Determina se o usuário autenticado pode convidar novos usuários.
     */
    public function create(User $authUser): bool
    {
        return $authUser->role === UserRole::Admin;
    }

    /**
     * Determina se o usuário autenticado pode atualizar o usuário alvo.
     */
    public function update(User $authUser, User $targetUser): bool
    {
        return $authUser->role === UserRole::Admin && $targetUser->exists;
    }

    /**
     * Determina se o usuário autenticado pode inativar o usuário alvo.
     * Não permite que o usuário inative a si mesmo.
     */
    public function inativar(User $authUser, User $targetUser): bool
    {
        return $authUser->role === UserRole::Admin && $authUser->id !== $targetUser->id;
    }

    /**
     * Determina se o usuário autenticado pode ativar o usuário alvo.
     */
    public function ativar(User $authUser, User $targetUser): bool
    {
        return $authUser->role === UserRole::Admin && $authUser->id !== $targetUser->id;
    }

    /**
     * Determina se o usuário autenticado pode reenviar convite para o usuário alvo.
     */
    public function reenviarConvite(User $authUser, User $targetUser): bool
    {
        return $authUser->role === UserRole::Admin && $targetUser->exists;
    }

    /**
     * Determina se o usuário autenticado pode exportar a lista de usuários.
     */
    public function export(User $authUser): bool
    {
        return $authUser->role === UserRole::Admin;
    }
}
