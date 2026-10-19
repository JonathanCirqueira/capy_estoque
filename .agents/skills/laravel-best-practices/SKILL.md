---
name: laravel-best-practices
description: "Apply this skill whenever writing, reviewing, or refactoring Laravel PHP code. This includes creating or modifying controllers, models, migrations, form requests, policies, jobs, scheduled commands, service classes, and Eloquent queries. Triggers for N+1 and query performance issues, caching strategies, authorization and security patterns, validation, error handling, queue and job configuration, route definitions, and architectural decisions. Also use for Laravel code reviews and refactoring existing Laravel code to follow best practices. Covers any task involving Laravel backend PHP code patterns."
license: MIT
metadata:
  author: laravel
---

# Laravel Best Practices

Boas práticas essenciais para o backend Laravel do projeto, priorizadas por impacto e consistência com o Starter Kit. Cada regra ensina o que fazer e o motivo. Para sintaxe exata da API, consulte com `search-docs`.

## Consistency First

Antes de aplicar qualquer regra, verifique o padrão já existente no projeto (`app/backend-rules.md`). O Laravel oferece múltiplas abordagens válidas — a melhor escolha é sempre a que o projeto já utiliza de forma consistente. Inconsistência é pior do que um padrão alternativo.

Verifique arquivos irmãos, controllers, models e actions relacionados. Se um padrão já estiver estabelecido, siga-o rigorosamente.

---

## Quick Reference (Regras Ativas do Projeto)

### 1. Advanced Query Patterns → `.agents/rules/php/advanced-queries.md`

- Subqueries com `addSelect()` para valores únicos em relações has-many (evita carregar coleções completas)
- Relações dinâmicas via FK virtual calculada por subquery + `belongsTo`
- Agregados condicionais em uma única consulta (`CASE WHEN` dentro de `selectRaw`) em vez de múltiplos `count()`
- Uso de `setRelation()` para evitar queries N+1 circulares ao carregar pai e filhos
- Preferência por `whereIn` + subquery indexada sobre `whereHas` para ganho de performance
- Duas consultas simples e indexadas são melhores que uma consulta complexa e pesada

### 2. Validation & Forms → `.agents/rules/php/validation.md`

- Classes dedicadas de `FormRequest`, eliminando validações inline em controllers
- Notação em array `['required', 'email']` para regras de validação novas
- Acesso estrito via `$request->validated()` — proibido `$request->all()` para inserções e atualizações
- Validação condicional declarativa e fluente com `Rule::when()`
- Lógica de validação customizada e complexa no método nativo `after()` do FormRequest

### 3. Routing & Controllers → `.agents/rules/php/routing.md`

- Injeção automática e resolução de models via *Implicit Route Model Binding*
- Proteção e escopo pai-filho automático com `->scopeBindings()` para recursos aninhados
- Padronização RESTful utilizando `Route::resource()` e `Route::apiResource()`
- *Thin Controllers*: métodos com menos de 10 linhas, delegando lógica de negócio para Action Classes
- Injeção tipada de Form Requests nos métodos do controller para autorização e validação automáticas

### 4. Mail & Notifications → `.agents/rules/php/mail.md`

- Implementação obrigatória da interface `ShouldQueue` nas classes Mailable
- Uso de `$this->afterCommit()` no construtor de Mailables disparadas dentro de transações de banco (`DB::transaction`)
- Asserções corretas em testes: `Mail::assertQueued()` para mailables com fila (nunca `assertSent()`)
- Mailables em Markdown para e-mails transacionais (gera HTML e texto puro responsivos)
- Separação estrita entre testes de conteúdo de e-mail e testes de disparo

### 5. Architecture Best Practices → `.agents/rules/php/architecture.md`

- Classes Action de responsabilidade única (`Single-Purpose Action Classes`), tipadas e transacionais
- Injeção de dependência via construtor com *Constructor Property Promotion* do PHP 8.3 (proibido `app()` ou `resolve()`)
- Programação orientada a contratos/interfaces nas fronteiras do sistema (gateways de pagamento, canais externos)
- Ordenação padrão decrescente explícita (`latest()` ou `orderByDesc()`) para evitar inconsistências entre bancos
- Prevenção de condições de corrida (*race conditions*) com `Cache::lock()` ou `lockForUpdate()`
- Manipulação segura de strings UTF-8 com helpers fluentes `Str::*` ou funções multibyte `mb_*`
- Processamento assíncrono pós-resposta HTTP com `defer()` para rotinas leves
- Compartilhamento de contexto de requisição via Facade `Context`
- Execução de tarefas concorrentes com a Facade `Concurrency::run()`
- Respeito estrito às convenções nativas do Laravel (*Convention Over Configuration*)

### 6. Migration Best Practices → `.agents/rules/php/migrations.md`

- Geração obrigatória de migrations exclusivamente via `php artisan make:migration`
- Chaves estrangeiras automáticas com `foreignId()->constrained()->cascadeOnDelete()`
- Imutabilidade de migrations já executadas em produção (criar novas migrations de alteração)
- Criação de índices no momento da migração para colunas de busca, filtro e ordenação
- Espelhamento de valores default da coluna na propriedade `$attributes` da Model correspondente
- Métodos `down()` reversíveis por padrão para suporte seguro a rollback

### 7. Fundamentos PHP (Coding Style, Hooks, Patterns & Security) → `.agents/rules/php/`

- **Estilo de Código** (`coding-style.md`): Tipagem estrita (`strict_types=1`), constructor promotion, chaves obrigatórias, backed enums e Laravel Pint (`--dirty`).
- **Hooks & Testes** (`hooks.md`): Pest v4 (`php artisan test --compact`), verificação de rotas e linter pós-edição.
- **Padrões Arquiteturais** (`patterns.md`): Thin Controllers, Action Classes transacionais, Form Requests com Precognition e API Resources.
- **Segurança** (`security.md`): Prevenção a SQL Injection, Mass Assignment, IDOR, proteção com Policies e senhas criptografadas com Hash.

---

## How to Apply

1. **Identifique o domínio da tarefa** e consulte a regra ativa correspondente:
   - Queries Eloquent e performance no banco → **§1** (`.agents/rules/php/advanced-queries.md`)
   - Formulários, validação e sanitização → **§2** (`.agents/rules/php/validation.md`)
   - Rotas, controllers e endpoints → **§3** (`.agents/rules/php/routing.md`)
   - E-mails transacionais e filas de mensageria → **§4** (`.agents/rules/php/mail.md`)
   - Actions, Services, injeção e arquitetura → **§5** (`.agents/rules/php/architecture.md`)
   - Banco de dados, schema e migrations → **§6** (`.agents/rules/php/migrations.md`)
   - Estilo, hooks, padrões e segurança do PHP → **§7** (`.agents/rules/php/`)
2. **Consistência do Projeto:** Sempre valide com `app/backend-rules.md` para seguir a padronização em Português e a segregação de responsabilidades.
3. **Verificação da Sintaxe:** Use `search-docs` para confirmar métodos da versão instalada do Laravel (Laravel 13 / PHP 8.3).
