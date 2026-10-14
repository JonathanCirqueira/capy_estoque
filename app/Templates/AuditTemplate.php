<?php

declare(strict_types=1);

namespace App\Templates;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

/**
 * ==============================================================================
 * TEMPLATE CANÔNICO DE AUDITORIA / HISTÓRICO POLIMÓRFICO
 * ==============================================================================
 *
 * Baseado no pacote 'owen-it/laravel-auditing'.
 *
 * Princípios de Design:
 * 1. Agregação Polimórfica: Coleta em uma única timeline as auditorias do modelo principal
 *    e de todos os seus modelos relacionados (filhos, transições, anexos, vínculos).
 * 2. Dados Crus para o Frontend: Utiliza o método nativo `$audit->getModified()` diretamente,
 *    evitando DTOs/Transformers intermediários artificiais no backend.
 * 3. Consultas Otimizadas: Utiliza eager loading (`with(['user', 'auditable'])`) e queries
 *    específicas por IDs relacionados para evitar N+1 queries.
 * 4. Resposta Leve em JSON: Ideal para consumo assíncrono via Drawer / Modal / Aba de Histórico
 *    no frontend (Inertia useHttp ou fetch).
 *
 * ------------------------------------------------------------------------------
 * INSTRUÇÕES DE USO:
 * ------------------------------------------------------------------------------
 * - O Serviço 'FormatadorAuditoriaService' pode ser colocado em `app/Services/FormatadorAuditoria.php`.
 * - O Controller pode ser registrado como Invokable Controller
 *   em `app/Http/Controllers/[Entidade]HistoricoController.php` com rota nomeada:
 *   `Route::get('/[entidades]/{[entidade]}/historico', [Entidade]HistoricoController::class)->name('[entidades].historico');`
 * ==============================================================================
 */

/**
 * PARTE 1: SERVIÇO DE AGREGAÇÃO E FORMATAÇÃO DE AUDITORIA POLIMÓRFICA
 */
final class FormatadorAuditoriaService
{
    /**
     * Retorna a timeline consolidada de auditoria do modelo principal e seus agregados.
     *
     * @param  object  $entidade  Instância do modelo principal (ex: [Entidade] $entidade)
     * @return array<int, array<string, mixed>>
     */
    public function obterHistorico(object $entidade): array
    {
        // 1. Coleta prévia de IDs de relacionamentos 1:N (se houver modelos filhos auditados)
        // $filhosIds = [EntidadeFilha]::where('[entidade]_id', $entidade->id)->pluck('id')->all();
        // $transicoesIds = [Transicao]::where('[entidade]_id', $entidade->id)->pluck('id')->all();

        // 2. Consulta polimórfica agregada na tabela de auditorias
        // Obs: Substitua \OwenIt\Auditing\Models\Audit pelo modelo do pacote instalado
        /** @var Builder $query */
        // $audits = \OwenIt\Auditing\Models\Audit::with(['user', 'auditable'])
        //     ->where(function (Builder $query) use ($entidade, $filhosIds, $transicoesIds): void {
        //         $this->aplicarFiltrosDeAuditoria($query, $entidade, $filhosIds, $transicoesIds);
        //     })
        //     ->orderByDesc('id')
        //     ->get();

        // 3. Mapeamento dos registros brutos mantendo 'getModified()' para o frontend
        // return $audits->map(static function ($audit): array {
        //     /** @var \OwenIt\Auditing\Models\Audit $audit */
        //     return [
        //         'id' => $audit->id,
        //         'autor' => $audit->user?->nome_completo ?? $audit->user?->name ?? 'Sistema',
        //         'data' => $audit->created_at?->toIso8601String() ?? (string) $audit->created_at,
        //         'evento' => (string) $audit->event,
        //         'auditable_type' => class_basename((string) $audit->auditable_type),
        //         'modified' => is_array($audit->getModified()) ? $audit->getModified() : [],
        //     ];
        // })->all();

        return [];
    }

    /**
     * Aplica os filtros de união polimórfica para consolidar o histórico completo.
     *
     * @param  Builder<never>  $query
     * @param  array<int, int|string>  $filhosIds
     * @param  array<int, int|string>  $transicoesIds
     */
    private function aplicarFiltrosDeAuditoria(
        Builder $query,
        object $entidade,
        array $filhosIds = [],
        array $transicoesIds = []
    ): void {
        // A. Auditoria direta do modelo principal
        // $query->where('auditable_type', [Entidade]::class)
        //     ->where('auditable_id', $[entidade]->id)
        //     ->where('event', '!=', 'deleted');

        // B. Auditoria de registros filhos vinculados (1:N)
        // if ($filhosIds !== []) {
        //     $query->orWhere(function (Builder $sub) use ($filhosIds): void {
        //         $sub->where('auditable_type', [EntidadeFilha]::class)
        //             ->whereIn('auditable_id', $filhosIds);
        //     });
        // }

        // C. Auditoria de modelo pai/associação direta (N:1)
        // if (! empty($[entidade]->[relacao_pai]_id)) {
        //     $query->orWhere(function (Builder $sub) use ($[entidade]): void {
        //         $sub->where('auditable_type', [ModeloPai]::class)
        //             ->where('auditable_id', $[entidade]->[relacao_pai]_id);
        //     });
        // }

        // D. Auditoria de vínculos onde a chave estrangeira foi gravada no payload JSON (new_values/old_values)
        // $query->orWhere(function (Builder $sub) use ($[entidade]): void {
        //     $sub->where('auditable_type', [FotoOuAnexo]::class)
        //         ->where(function (Builder $jsonQuery) use ($[entidade]): void {
        //             $jsonQuery->where('new_values->[entidade]_id', $[entidade]->id)
        //                 ->orWhere('old_values->[entidade]_id', $[entidade]->id);
        //         });
        // });

        // E. Auditoria de transições de status / responsabilidade / etapas
        // if ($transicoesIds !== []) {
        //     $query->orWhere(function (Builder $sub) use ($transicoesIds): void {
        //         $sub->where('auditable_type', [Transicao]::class)
        //             ->whereIn('auditable_id', $transicoesIds);
        //     });
        // }
    }
}

/**
 * PARTE 2: CONTROLLER INVOKABLE DE HISTÓRICO
 *
 * Exemplo de Controller invokable com injeção de dependência e autorização via Policy.
 */
final class ObterHistoricoEntidadeControllerExemplo
{
    public function __construct(
        private readonly FormatadorAuditoriaService $formatadorAuditoria,
    ) {}

    /**
     * Retorna a lista de auditorias em formato JSON.
     */
    public function __invoke(/* [Entidade] $[entidade] */): JsonResponse
    {
        // 1. Autorização de segurança via Policy
        // Gate::authorize('view', $[entidade]);

        // 2. Extração dos registros formatados via serviço
        // $historico = $this->formatadorAuditoria->obterHistorico($[entidade]);

        return response()->json([
            // 'dados' => $historico,
        ]);
    }
}
