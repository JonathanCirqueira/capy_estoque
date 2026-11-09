<?php

declare(strict_types=1);

namespace App\Actions\Usuarios;

use App\Enums\AssinaturaStatus;
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
                'empresa',
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

        if (! in_array($ordemCampo, ['name', 'email', 'empresa', 'role', 'status', 'created_at'], true)) {
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
     * @return array{todos: int, ativo: int, inativo: int, pendente: int}
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
            'ativo' => (clone $baseQuery)->where('status', UserStatus::Ativo)->count(),
            'inativo' => (clone $baseQuery)->where('status', UserStatus::Inativo)->count(),
            'pendente' => (clone $baseQuery)->where('status', UserStatus::Pendente)->count(),
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
                    ->orWhere('email', 'like', sprintf('%%%s%%', $termo))
                    ->orWhere('empresa', 'like', sprintf('%%%s%%', $termo));
            });
        }

        if (! empty($filtros['assinatura']) && is_string($filtros['assinatura'])) {
            $this->aplicarFiltroAssinatura($query, $filtros['assinatura']);
        }

        $aba = isset($filtros['aba']) && is_string($filtros['aba']) ? $filtros['aba'] : 'todos';
        match ($aba) {
            'ativo', 'ativos' => $query->where('status', UserStatus::Ativo),
            'inativo', 'inativos' => $query->where('status', UserStatus::Inativo),
            'pendente', 'pendentes' => $query->where('status', UserStatus::Pendente),
            default => null,
        };
    }

    /**
     * @param  Builder<User>  $query
     */
    private function aplicarFiltroAssinatura(Builder $query, string $assinatura): void
    {
        match ($assinatura) {
            'ativa' => $query->where(function (Builder $q): void {
                $q->whereIn('assinatura_status', [
                    AssinaturaStatus::Active,
                    AssinaturaStatus::Trialing,
                ]);
            }),
            'pendente' => $query->where(function (Builder $q): void {
                $q->whereIn('assinatura_status', [
                    AssinaturaStatus::PastDue,
                    AssinaturaStatus::Incomplete,
                ]);
            }),
            'inativa' => $query->where(function (Builder $q): void {
                $q->where('assinatura_status', AssinaturaStatus::Canceled)
                    ->orWhereNull('assinatura_status');
            }),
            default => null,
        };
    }
}
