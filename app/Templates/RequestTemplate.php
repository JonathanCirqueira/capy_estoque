<?php

declare(strict_types=1);

namespace App\Templates;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * TEMPLATE CANÔNICO: Form Request Genérico de Validação
 *
 * Padrão arquitetural agnóstico para validação no Starter Kit.
 * Serve como modelo para requests de:
 * 1. Listagem & Filtros (Listar[Entidades]Request)
 * 2. Cadastro / Criação (Criar[Entidade]Request / Salvar[Entidade]Request)
 * 3. Atualização / Edição (Atualizar[Entidade]Request)
 *
 * Convenções e Boas Práticas:
 * - Strict types habilitado
 * - Sanitização e valores padrão via prepareForValidation()
 * - Regras organizadas em arrays com objetos Rule::*
 * - Suporte a Route Model Binding com ignore() na edição
 * - Tratamento condicional para requisições de toggle de status
 * - Atributos traduzidos amigáveis via attributes()
 */
final class RequestTemplate extends FormRequest
{
    /**
     * Determina se o usuário tem autorização para fazer esta requisição.
     * Como a autorização é centralizada nas Policies via Gate::authorize() no Controller,
     * este método pode retornar true por padrão.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtém as regras de validação aplicáveis à requisição.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /*
        |--------------------------------------------------------------------------
        | Cenário 1: Form Request de Listagem e Filtros (Listar[Entidades]Request)
        |--------------------------------------------------------------------------
        */
        // return [
        //     'termo' => ['nullable', 'string', 'max:255'],
        //     'filtro_id' => ['nullable', 'integer'],
        //     'aba' => ['required', 'string', 'in:todos,status_a,status_b'],
        //     'ordem_campo' => ['nullable', 'string'],
        //     'ordem_direcao' => ['nullable', 'string', 'in:asc,desc'],
        // ];

        /*
        |--------------------------------------------------------------------------
        | Cenário 2: Form Request de Atualização com Toggle (Atualizar[Entidade]Request)
        |--------------------------------------------------------------------------
        | Se a requisição for apenas um toggle de status (sem campos de formulário),
        | não aplica as validações de dados cadastrais.
        */
        // if (! $this->has('[campo_identificador_formulario]')) {
        //     return [];
        // }

        /*
        |--------------------------------------------------------------------------
        | Cenário 3: Form Request de Criação ou Edição Completa
        |--------------------------------------------------------------------------
        */
        // Identifica o ID do registro na rota para ignorar na regra de unicidade durante a edição
        // /** @var [Entidade]|string|int|null $entidadeRoute */
        // $entidadeRoute = $this->route('[entidade]');
        // $entidadeId = $entidadeRoute instanceof [Entidade] ? $entidadeRoute->id : $entidadeRoute;

        return [
            // Campo de texto obrigatório
            // 'campo_texto' => [
            //     'required',
            //     'string',
            //     'max:255',
            // ],

            // E-mail com validação única (ignorando o próprio registro se for edição)
            // 'email' => [
            //     'required',
            //     'string',
            //     'email',
            //     'max:255',
            //     Rule::unique([Entidade]::class, 'email')->ignore($entidadeId),
            // ],

            // Chave estrangeira com validação de existência
            // 'relacionamento_id' => [
            //     'required',
            //     'integer',
            //     Rule::exists([EntidadeRelacionada]::class, 'id'),
            // ],

            // Lista / Array de IDs selecionados (ex: multi-select / checkboxes)
            // 'itens_relacionados' => [
            //     'nullable',
            //     'array',
            // ],
            // 'itens_relacionados.*' => [
            //     'integer',
            //     Rule::exists([ItemRelacionado]::class, 'id'),
            // ],

            // Campo de status com valores controlados
            // 'status' => [
            //     'required',
            //     Rule::enum([MeuEnumStatus]::class), // ou Rule::in(['ativo', 'inativo'])
            // ],
        ];
    }

    /**
     * Define nomes amigáveis em português para os atributos nos retornos de erro.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            // 'campo_texto' => 'nome do campo',
            // 'email' => 'e-mail',
            // 'relacionamento_id' => 'vínculo relacionado',
            // 'itens_relacionados' => 'itens selecionados',
            // 'itens_relacionados.*' => 'item',
            // 'status' => 'situação / status',
        ];
    }

    /**
     * Mensagens customizadas de validação (opcional).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // 'email.unique' => 'Este e-mail já está sendo utilizado por outro cadastro.',
        ];
    }

    /**
     * Prepara os dados antes da validação.
     * Útil para definir valores padrão (ex: aba ativa) ou sanitizar entradas.
     */
    protected function prepareForValidation(): void
    {
        // Exemplo: Garante aba padrão na listagem
        // $this->merge([
        //     'aba' => $this->input('aba', 'todos'),
        // ]);

        // Exemplo: Limpeza ou formatação de strings/documentos
        // if ($this->has('documento')) {
        //     $this->merge([
        //         'documento' => preg_replace('/\D/', '', (string) $this->input('documento')),
        //     ]);
        // }
    }
}
