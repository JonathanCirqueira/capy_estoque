<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\AssinaturaStatus;
use App\Enums\UserStatus;
use App\Http\Requests\ListarUsuariosRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ExportarUsuariosController extends Controller
{
    public function __invoke(ListarUsuariosRequest $request): StreamedResponse
    {
        Gate::authorize('export', User::class);

        $filtros = $request->validated();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="usuarios_'.now()->format('Y-m-d_His').'.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($filtros): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            // UTF-8 BOM e instrução explícita sep=; para o Excel abrir separando em colunas A, B, C...
            fwrite($handle, "\xEF\xBB\xBF");
            fwrite($handle, "sep=;\r\n");

            fputcsv($handle, [
                'ID',
                'Nome',
                'E-mail',
                'Empresa',
                'Telefone',
                'CPF/CNPJ',
                'Perfil',
                'Status',
                'Plano',
                'Cadastrado em',
            ], ';');

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
                    'created_at',
                ]);

            if (! empty($filtros['busca']) && is_string($filtros['busca'])) {
                $termo = trim($filtros['busca']);
                $query->where(function (Builder $q) use ($termo): void {
                    $q->where('name', 'like', sprintf('%%%s%%', $termo))
                        ->orWhere('email', 'like', sprintf('%%%s%%', $termo))
                        ->orWhere('empresa', 'like', sprintf('%%%s%%', $termo));
                });
            }

            if (! empty($filtros['assinatura']) && is_string($filtros['assinatura'])) {
                match ($filtros['assinatura']) {
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

            $aba = isset($filtros['aba']) && is_string($filtros['aba']) ? $filtros['aba'] : 'todos';
            match ($aba) {
                'ativo', 'ativos' => $query->where('status', UserStatus::Ativo),
                'inativo', 'inativos' => $query->where('status', UserStatus::Inativo),
                'pendente', 'pendentes' => $query->where('status', UserStatus::Pendente),
                default => null,
            };

            foreach ($query->cursor() as $usuario) {
                /** @var User $usuario */
                fputcsv($handle, [
                    $usuario->id,
                    $usuario->name,
                    $usuario->email,
                    $usuario->empresa ?? '-',
                    $usuario->telefone ?? '-',
                    $usuario->cpf_cnpj ?? '-',
                    $usuario->role->label(),
                    $usuario->status->label(),
                    $usuario->plano !== null ? $usuario->plano->nome : 'Sem Plano',
                    $usuario->created_at?->format('d/m/Y H:i:s') ?? '-',
                ], ';');
            }

            fclose($handle);
        }, 200, $headers);
    }
}
