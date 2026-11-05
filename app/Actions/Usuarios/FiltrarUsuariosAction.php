<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

final class FiltrarUsuariosAction
{
    /**
     * @param  array<string, mixed>  $filtros
     * @return LengthAwarePaginator<int, User>
     */
    public function execute(array $filtros): LengthAwarePaginator
    {
        $query = User::query()
            ->with('plano')
            ->select([
                'id',
                'name',
                'email',
                'telefone',
                'cpf_cnpj',
                'role',
                'status',
                'plano_id',
                'assinatura_status',
                'assinatura_origem',
                'data_inicio',
                'data_vencimento',
                'cancel_at_period_end',
                'ultimo_login_em',
                'created_at',
            ]);

        $this->aplicarFiltros($query, $filtros);

        $ordemCampo = isset($filtros['ordem_campo']) && is_string($filtros['ordem_campo'])
            ? $filtros['ordem_campo']
            : 'created_at';

        $ordemDirecao = isset($filtros['ordem_direcao']) && is_string($filtros['ordem_direcao'])
            ? $filtros['ordem_direcao']
            : 'desc';

        if (! in_array($ordemCampo, ['name', 'email', 'role', 'status', 'created_at'], true)) {
            $ordemCampo = 'created_at';
        }

        if (! in_array($ordemDirecao, ['asc', 'desc'], true)) {
            $ordemDirecao = 'desc';
        }

        $query->orderBy($ordemCampo, $ordemDirecao);

        $perPage = isset($filtros['per_page']) && is_numeric($filtros['per_page'])
            ? (int) $filtros['per_page']
            : 15;

        /** @var LengthAwarePaginator<int, User> $paginator */
        $paginator = $query->paginate($perPage)->withQueryString();

        return $paginator;
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array{todos: int, ativos: int, inativos: int, pendentes: int}
     */
    public function contadores(array $filtros): array
    {
        $baseQuery = User::query();

        // Aplicamos os filtros com exceção da aba para manter os totais contextuais coerentes
        $filtrosSemAba = $filtros;
        unset($filtrosSemAba['aba']);

        $this->aplicarFiltros($baseQuery, $filtrosSemAba);

        return [
            'todos' => (clone $baseQuery)->count(),
            'ativos' => (clone $baseQuery)->where('status', UserStatus::Ativo)->count(),
            'inativos' => (clone $baseQuery)->where('status', UserStatus::Inativo)->count(),
            'pendentes' => (clone $baseQuery)->where('status', UserStatus::Pendente)->count(),
        ];
    }

    /**
     * @param  Builder<User>  $query
     * @param  array<string, mixed>  $filtros
     */
    private function aplicarFiltros(Builder $query, array $filtros): void
    {
        if (! empty($filtros['busca']) && is_string($filtros['busca'])) {
            $termo = trim($filtros['busca']);
            $query->where(function (Builder $q) use ($termo): void {
                $q->where('name', 'like', sprintf('%%%s%%', $termo))
                    ->orWhere('email', 'like', sprintf('%%%s%%', $termo));
            });
        }

        if (! empty($filtros['role']) && is_string($filtros['role'])) {
            $roleEnum = UserRole::tryFrom($filtros['role']);
            if ($roleEnum !== null) {
                $query->where('role', $roleEnum);
            }
        }

        $aba = isset($filtros['aba']) && is_string($filtros['aba']) ? $filtros['aba'] : 'todos';
        match ($aba) {
            'ativos' => $query->where('status', UserStatus::Ativo),
            'inativos' => $query->where('status', UserStatus::Inativo),
            'pendentes' => $query->where('status', UserStatus::Pendente),
            default => null,
        };
    }
}
