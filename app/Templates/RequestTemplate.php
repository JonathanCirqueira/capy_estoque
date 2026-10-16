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
 * - Autorização no Controller via Gate::authorize() (sem necessidade de declarar authorize() retornando true)
 * - Sanitização e normalização exclusivamente no prepareForValidation() usando API fluente do Laravel ($this->string()) e Helpers Globais
 * - Regras organizadas em arrays com objetos Rule::*
 * - Zero getters customizados (Controller/Action consomem via collect($request->validated()))
 * - Nomenclatura estrita em português snake_case e foreign keys no padrão tabela_singular_id
 * - Atributos traduzidos amigáveis via attributes()
 */
final class RequestTemplate extends FormRequest
{
    /**
     * Obtém as regras de validação aplicáveis à requisição (compatível com Laravel Precognition).
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
        | Cenário 3: Form Request de Criação ou Edição Completa (Salvar[Entidade]Request)
        |--------------------------------------------------------------------------
        */
        // Identifica o ID do registro na rota (ou no payload) para ignorar na regra de unicidade durante a edição
        // /** @var [Entidade]|string|int|null $entidadeRoute */
        // $entidadeRoute = $this->route('[entidade]') ?? $this->route('id') ?? $this->input('id');
        // $entidadeId = $entidadeRoute instanceof [Entidade] ? $entidadeRoute->id : $entidadeRoute;
        // $isUpdate = $this->isMethod('put') || $this->isMethod('patch') || $entidadeId !== null;

        return [
            // Campo de texto obrigatório
            // 'nome' => [
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

            // Exemplo de campo condicional (obrigatório na criação, opcional na edição)
            // 'senha' => [
            //     $isUpdate ? 'nullable' : 'required',
            //     'string',
            //     'min:8',
            // ],

            // Chave estrangeira com validação de existência
            // 'departamento_id' => [
            //     'required',
            //     'integer',
            //     Rule::exists([EntidadeRelacionada]::class, 'id'),
            // ],

            // Lista / Array de IDs selecionados (ex: multi-select / checkboxes)
            // 'servico_ids' => [
            //     'nullable',
            //     'array',
            // ],
            // 'servico_ids.*' => [
            //     'integer',
            //     Rule::exists([ItemRelacionado]::class, 'id'),
            // ],

            // Campo de status ou perfil com valores controlados via Enum
            // 'nivel_acesso' => [
            //     'required',
            //     Rule::enum([MeuEnumStatus]::class),
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
            // 'nome' => 'nome completo',
            // 'email' => 'e-mail',
            // 'departamento_id' => 'departamento',
            // 'servico_ids' => 'serviços vinculados',
            // 'servico_ids.*' => 'serviço',
            // 'nivel_acesso' => 'nível de acesso',
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
            // 'email.unique' => 'Este e-mail já está cadastrado no sistema.',
            // 'codigo.unique' => 'Este código já está em uso por outro registro.',
        ];
    }

    /**
     * Prepara os dados antes da validação.
     * Centraliza a sanitização e normalização usando a API Fluente do Laravel ($this->string())
     * ou Helpers Globais (clean_digits, clean_moeda, clean_placa).
     */
    protected function prepareForValidation(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Exemplo de Sanitização com API Fluente do Laravel e Helpers:
        |--------------------------------------------------------------------------
        */
        // $this->merge([
        //     'nome' => $this->filled('nome')
        //         ? $this->string('nome')->trim()->toString()
        //         : $this->input('nome'),
        //
        //     'email' => $this->filled('email')
        //         ? $this->string('email')->trim()->lower()->toString()
        //         : $this->input('email'),
        //
        //     'documento' => $this->filled('documento')
        //         ? clean_digits((string) $this->input('documento'))
        //         : $this->input('documento'),
        //
        //     'valor' => $this->filled('valor')
        //         ? clean_moeda((string) $this->input('valor'))
        //         : $this->input('valor'),
        //
        //     'servico_ids' => is_array($this->input('servico_ids'))
        //         ? array_values(array_filter($this->input('servico_ids')))
        //         : $this->input('servico_ids'),
        //
        //     'aba' => $this->input('aba', 'todos'),
        // ]);
    }
}
