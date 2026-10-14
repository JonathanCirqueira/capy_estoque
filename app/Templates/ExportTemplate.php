<?php

declare(strict_types=1);

namespace App\Templates;

use DateTimeInterface;
use Illuminate\Support\LazyCollection;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * ==============================================================================
 * TEMPLATE CANÔNICO DE EXPORTAÇÃO EM LOTE VIA STREAMING (CSV / EXCEL)
 * ==============================================================================
 *
 * Este arquivo serve como blueprint canônico para exportação massiva de dados.
 *
 * Características principais:
 * 1. Consumo O(1) de memória RAM usando LazyCollection (`$query->cursor()`).
 * 2. UTF-8 Byte Order Mark (BOM: \xEF\xBB\xBF) garantindo compatibilidade com acentuação
 *    no Microsoft Excel em português (PT-BR).
 * 3. Delimitador ponto e vírgula (;) padrão do Excel brasileiro.
 * 4. Resposta transmitida via StreamedResponse diretamente para php://output.
 *
 * ------------------------------------------------------------------------------
 * INSTRUÇÕES DE USO:
 * ------------------------------------------------------------------------------
 * - O Serviço 'ExportacaoDados' pode ser colocado em `app/Services/ExportacaoDados.php`.
 * - O Controller pode ser implementado como Invokable Controller
 *   (`app/Http/Controllers/Exportar[Entidades]Controller.php`) ou como método `exportar()`
 *   no próprio `[Entidade]Controller`.
 * ==============================================================================
 */

/**
 * PARTE 1: SERVIÇO GENÉRICO DE EXPORTAÇÃO CSV VIA STREAMING
 *
 * Pode ser registrado como serviço singleton ou instanciado via DI no container.
 */
final class ExportacaoDadosService
{
    /**
     * Exporta um conjunto de dados para um arquivo CSV transmitido via streaming.
     *
     * @template TKey of int|string
     * @template TValue
     *
     * @param  LazyCollection<TKey, TValue>  $dados  Coleção Lazy (cursor do Eloquent)
     * @param  array<string, string>  $mapeamentoColunas  Mapeamento ['chave_atributo' => 'Título da Coluna']
     * @param  string  $nomeArquivo  Nome sugerido para o download do arquivo
     * @param  string  $delimitador  Separador de colunas (padrão ';' para Excel no Brasil)
     */
    public function exportarCsv(
        LazyCollection $dados,
        array $mapeamentoColunas,
        string $nomeArquivo = 'exportacao.csv',
        string $delimitador = ';'
    ): StreamedResponse {
        $cabecalhos = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $nomeArquivo),
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return new StreamedResponse(function () use ($dados, $mapeamentoColunas, $delimitador): void {
            $ponteiro = fopen('php://output', 'w');

            if ($ponteiro === false) {
                return;
            }

            // 1. Escreve a marca de ordem de byte (BOM) UTF-8 para o Excel reconhecer acentos em PT-BR
            fwrite($ponteiro, "\xEF\xBB\xBF");

            // 2. Escreve a linha de cabeçalho amigável
            fputcsv($ponteiro, array_values($mapeamentoColunas), $delimitador);

            // 3. Itera linha a linha consumindo O(1) de memória RAM
            foreach ($dados as $item) {
                $linha = [];
                $itemArray = (array) $item;

                foreach (array_keys($mapeamentoColunas) as $chave) {
                    $valor = $itemArray[$chave] ?? '';

                    // Formatação amigável de valores booleanos
                    if (is_bool($valor)) {
                        $valor = $valor ? 'Sim' : 'Não';
                    }

                    // Formatação de datas se for instância de DateTimeInterface
                    if ($valor instanceof DateTimeInterface) {
                        $valor = $valor->format('d/m/Y H:i');
                    }

                    $linha[] = (string) $valor;
                }

                fputcsv($ponteiro, $linha, $delimitador);
            }

            fclose($ponteiro);
        }, 200, $cabecalhos);
    }
}

/**
 * PARTE 2: EXEMPLO DE CONTROLLER INVOKABLE DE EXPORTAÇÃO
 *
 * Exemplo de como plugar a exportação com FormRequest, Action de Filtro,
 * Policy e cursor() de banco de dados.
 */
final class ExportarEntidadesControllerExemplo
{
    /**
     * Injeta a Action de filtragem e o serviço de exportação.
     */
    public function __construct(
        // private readonly Filtrar[Entidades]Action $filtrar[Entidades]Action,
        // private readonly ExportacaoDadosService $exportacaoDados,
    ) {}

    /**
     * Executa a exportação streaming baseada nos filtros da listagem.
     */
    public function __invoke(/* Listar[Entidades]Request $request */): StreamedResponse
    {
        // 1. Autorização via Policy
        // Gate::authorize('viewAny', [Entidade]::class);

        // 2. Coleta segura dos filtros enviados pela tela
        // /** @var \Illuminate\Support\Collection<string, mixed> $filtros */
        // $filtros = $request->safe()->collect();
        // $aba = (string) $filtros->get('aba', 'todos');

        // 3. Execução da query base de filtros reaproveitando a Action da listagem
        // $query = $this->filtrar[Entidades]Action->execute($filtros);
        // $query = $this->filtrar[Entidades]Action->aplicarFiltroAba($query, $aba)->latest();

        // 4. Cursor lazy para streaming eficiente (não carrega todos os registros de uma vez na RAM)
        // $dados = $query->cursor()->map(fn ([Entidade] $[entidade]): array => [
        //     'id' => $[entidade]->id,
        //     'campo_1' => $[entidade]->campo_1,
        //     'campo_2' => $[entidade]->campo_2,
        //     'relacionamento' => $[entidade]->relacionamento?->nome ?? 'N/A',
        //     'relacionamentos_multiplos' => $[entidade]->relacionamentos->pluck('nome')->implode(', '),
        //     'is_active' => $[entidade]->is_active,
        //     'created_at' => $[entidade]->created_at?->format('d/m/Y H:i'),
        // ]);

        // 5. Dicionário de cabeçalhos no CSV
        // $colunas = [
        //     'id' => 'ID',
        //     'campo_1' => 'Título do Campo 1',
        //     'campo_2' => 'Título do Campo 2',
        //     'relacionamento' => 'Categoria / Vínculo',
        //     'relacionamentos_multiplos' => 'Itens Vinculados',
        //     'is_active' => 'Status',
        //     'created_at' => 'Data de Criação',
        // ];

        // 6. Disparo do download streaming com timestamp no nome do arquivo
        // return $this->exportacaoDados->exportarCsv(
        //     $dados,
        //     $colunas,
        //     sprintf('[entidades]_%s.csv', now()->format('Y_m_d_His'))
        // );

        return response()->streamDownload(static function (): void {
            // Callback genérico
        }, 'export.csv');
    }
}
