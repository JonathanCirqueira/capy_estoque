<?php

declare(strict_types=1);

namespace App\Templates;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * TEMPLATE CANÔNICO: Policy de Autorização RBAC
 *
 * Padrão arquitetural agnóstico para regras de autorização no Starter Kit.
 *
 * Princípios e Boas Práticas:
 * - Strict types habilitado
 * - Classe final por padrão (final class)
 * - Interceptador global `before()` para bypass de Administrador/Superadmin
 * - Métodos canônicos alinhados aos Gates do Controller:
 *   viewAny, view, create, update, delete, exportar
 * - Suporte a verificações RBAC (perfis/roles) e Ownership (dono do registro)
 *
 * Legenda de Substituição:
 * - [Entidade]Policy: Nome da Policy (ex: ClientePolicy, ProdutoPolicy, PedidoPolicy)
 * - [Entidade]: Modelo que está sendo protegido (ex: Cliente, Produto, Pedido)
 * - $[entidade]: Instância do modelo recebida nos métodos
 * - [PerfilAcesso]: Enum de perfis do sistema (ex: PerfilAcesso::Administrador, PerfilAcesso::Gestor)
 */
final class PolicyTemplate
{
    /**
     * Intercepta todas as verificações de autorização antes de qualquer método.
     * Retornar `true` concede acesso irrestrito (bypass de Administrador/Super Admin).
     * Retornar `null` delega a decisão para o método específico da Policy.
     */
    public function before(User $user): ?bool
    {
        // 1. Bypass para administrador global ou flag de sistema
        // if ($user->is_admin || $user->possuiPerfil([PerfilAcesso]::Administrador)) {
        //     return true;
        // }

        return null;
    }

    /**
     * Determina se o usuário pode visualizar a listagem da entidade (index).
     */
    public function viewAny(User $user): bool
    {
        // Exemplo RBAC: Perfis autorizados a listar
        // return $user->possuiPerfil([PerfilAcesso]::Gestor) || $user->possuiPerfil([PerfilAcesso]::Operador);

        return true;
    }

    /**
     * Determina se o usuário pode visualizar os detalhes de um registro específico (show).
     */
    public function view(User $user, ?Model $model = null): bool
    {
        return true;
    }

    /**
     * Determina se o usuário pode cadastrar novos registros (store).
     */
    public function create(User $user): bool
    {
        // Exemplo RBAC: Apenas perfis com permissão de criação
        // return $user->possuiPerfil([PerfilAcesso]::Gestor);

        return true;
    }

    /**
     * Determina se o usuário pode atualizar o registro existente (update).
     */
    public function update(User $user, ?Model $model = null): bool
    {
        // Exemplo RBAC ou Verificação de Ownership (dono do registro)
        // return $user->possuiPerfil([PerfilAcesso]::Gestor) || $user->id === $model->user_id;

        return true;
    }

    /**
     * Determina se o usuário pode exportar relatórios/dados da entidade.
     */
    public function export(User $user): bool
    {
        return true;
    }

    /**
     * Determina se o usuário pode remover o registro (destroy).
     */
    public function delete(User $user, ?Model $model = null): bool
    {
        // Por padrão restrito apenas a perfis elevados (ou bloqueado para cair no before)
        return false;
    }
}
