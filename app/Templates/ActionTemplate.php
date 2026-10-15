<?php

declare(strict_types=1);

namespace App\Templates;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * TEMPLATE CANÔNICO: Action de Negócio & Filtragem
 *
 * Padrão arquitetural agnóstico para regras de negócio isoladas no Starter Kit.
 *
 * Princípios do Pattern de Action:
 * - Single Responsibility: Uma classe focada em executar uma operação de negócio específica.
 * - Imutabilidade: Sempre declarada como `final readonly class`.
 * - Entrada flexível e tipada: Recebe `Collection<string, mixed>` oriunda do Form Request validado.
 * - Atomicidade & Integridade: Operações de escrita executadas dentro de `DB::transaction(...)`.
 * - Efeitos Colaterais: Disparo de Mails, Notificações ou Events após a persistência.
 * - Retorno tipado: Retorna a instância do Model criado/atualizado ou o Query Builder.
 *
 * Legenda de Substituição:
 * - [Entidade]: Nome do Model no singular (ex: Cliente, Produto, Pedido)
 * - $[entidade]: Variável da instância (ex: $cliente, $produto, $pedido)
 * - [Entidades]: Nome no plural (ex: Clientes, Produtos, Pedidos)
 */
final readonly class ActionTemplate
{
    /**
     * Injeta dependências ou serviços de infraestrutura se necessário.
     */
    public function __construct(
        // private readonly MeuServicoNotificacao $notificacaoService,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | PADRÃO 1: Action de Persistência / Escrita (ex: Salvar[Entidade]Action)
    |--------------------------------------------------------------------------
    */

    /**
     * Executa a regra de criação, persistência de dados e disparos de pós-processamento.
     *
     * @param  Collection<string, mixed>  $data
     */
    public function execute(Collection $data): Model
    {
        return DB::transaction(static function (): Model {
            // 1. Criação do registro principal da entidade (ZERO STRINGS MÁGICAS: use Enums tipados)
            // /** @var [Entidade] $[entidade] */
            // $[entidade] = [Entidade]::query()->create([
            //     'campo_1' => $data->get('campo_1'),
            //     'campo_2' => $data->get('campo_2'),
            //     'relacionamento_id' => $data->get('relacionamento_id'),
            //     'status' => Status[Entidade]::Pendente, // NUNCA usar 'pendente' ou strings soltas
            //     'perfil' => Perfil[Entidade]::Padrao,
            // ]);

            // 2. Sincronização ou vinculação de relacionamentos many-to-many (se houver)
            // /** @var array<int>|null $itensRelacionadosIds */
            // $itensRelacionadosIds = $data->get('itens_relacionados_ids');
            // if (! empty($itensRelacionadosIds)) {
            //     $[entidade]->itensRelacionados()->attach($itensRelacionadosIds);
            // }

            // 3. Disparo de e-mails, eventos de domínio ou notificações de negócio
            // Mail::to($[entidade]->email)->send(new NotificacaoMail($[entidade]));
            // Event::dispatch(new [Entidade]CriadoEvent($[entidade]));

            // return $[entidade];

            // Retorno genérico de exemplo
            return new class extends Model {};
        });
    }

    /*
    |--------------------------------------------------------------------------
    | PADRÃO 2: Action de Filtragem e Consulta (ex: Filtrar[Entidades]Action)
    |--------------------------------------------------------------------------
    */

    /**
     * Monta a query base aplicando os filtros secundários e termos de busca.
     *
     * @param  Collection<string, mixed>  $filtros
     * @return Builder<Model>
     */
    public function executeQuery(Collection $filtros): Builder
    {
        // $query = [Entidade]::query();

        // 1. Busca textual rápida (nome, e-mail, documento, código)
        // $query->when($filtros->get('termo'), static function (Builder $q, string $termo): void {
        //     $q->where(static function (Builder $sub) use ($termo): void {
        //         $sub->where('campo_1', 'like', "%{$termo}%")
        //             ->orWhere('campo_2', 'like', "%{$termo}%");
        //     });
        // });

        // 2. Filtros secundários em grid (chaves estrangeiras, categorias, departamentos)
        // $query->when($filtros->get('categoria_id'), static function (Builder $q, int|string $catId): void {
        //     $q->where('categoria_id', $catId);
        // });

        // 3. Ordenação dinâmica
        // $campoOrdem = (string) $filtros->get('ordem_campo', 'created_at');
        // $direcaoOrdem = (string) $filtros->get('ordem_direcao', 'desc');
        // $query->orderBy($campoOrdem, $direcaoOrdem);

        // return $query;

        /** @var Builder<Model> $dummyBuilder */
        $dummyBuilder = (new class extends Model {})->newQuery();

        return $dummyBuilder;
    }

    /**
     * Aplica o filtro de escopo da aba selecionada (todos, ativos, pendentes, inativos, etc.).
     *
     * @param  Builder<Model>  $query
     * @return Builder<Model>
     */
    public function aplicarFiltroAba(Builder $query, string $aba): Builder
    {
        return match ($aba) {
            // Status[Entidade]::Ativo->value => $query->where('status', Status[Entidade]::Ativo),
            // Status[Entidade]::Inativo->value => $query->where('status', Status[Entidade]::Inativo),
            // Status[Entidade]::Pendente->value => $query->where('status', Status[Entidade]::Pendente),
            default => $query,
        };
    }
}
