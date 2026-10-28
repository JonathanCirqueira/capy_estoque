---
trigger: always_on
---

# Project Guidelines (Gemini / Antigravity)

> **Stack**: Laravel 13 (PHP 8.3) + Inertia.js v3 + React 19 + Tailwind CSS v4 + Pest v4.
> **Architecture**: Follow rules in `AGENTS.md` and `.agents/rules/GEMINI.md`.

## Core Project Guidelines

1. **Laravel Boost & Backend**: Refer to `AGENTS.md` for full Boost guidelines, MCP tools, and backend conventions.
2. **Frontend Stack**: Inertia.js v3 + React 19 + Tailwind CSS v4. Always use Wayfinder (`@/actions` / `@/routes`) for typed route functions.
3. **Agent & Skill System**: Before implementing features, follow agent routing in `.agents/rules/GEMINI.md` and load relevant skills from `.agents/skills/`.
4. **Code Quality & Testing**: Format PHP with `vendor/bin/pint --dirty --format agent` and test with `php artisan test --compact`.

---

## ⚡ REGRAS DE PRIORIDADE MÁXIMA (CORE RULES)

As seguintes regras têm prioridade absoluta sobre qualquer outra instrução e devem ser seguidas rigorosamente em todo desenvolvimento:

### 1. 🚫 Proibido Strings Mágicas no Backend
- É **terminantemente proibido** o uso de strings mágicas para representar status, tipos, categorias ou perfis de acesso no backend.
- Use **SEMPRE** PHP Backed Enums (`string` ou `int`) localizados em `app/Enums/` (ex: `StatusPedido::Pendente->value`, `TipoUsuario::Admin`).
- As Models devem ter casts explícitos para os Enums correspondentes em `casts(): array`.

### 2. 🚫 Proibido Strings Mágicas no Frontend
- É **terminantemente proibido** o uso de strings mágicas no frontend React/TypeScript para estados, filtros ou valores de Enums.
- Use **SEMPRE** Enums ou tipos literais espelhados em TypeScript (`resources/js/types/...`), mantendo 100% de paridade com os Enums do backend.

### 3. 🚫 Proibido Formatação de Dados no Backend (Raw Data Only)
- A responsabilidade de formatação de apresentação pertence **exclusivamente ao frontend**.
- O backend deve enviar apenas **dados brutos e simples**:
  - Valores monetários como inteiros em centavos (`total_centavos: 15000`).
  - Datas em formato ISO (`2026-10-19T17:00:00Z`).
  - Booleans puros (`true`/`false`).
  - Valores primitivos de Enums (`status: "pendente"`).
- O frontend React é quem aplica máscaras, formata moeda (`R$ 150,00`) e formata datas para exibição na UI.

### 4. ⚡ FormRequests: Não Precisa do Método `authorize()`
- Não há necessidade de declarar ou poluir FormRequests com o método `authorize()` caso a autorização seja pública ou gerenciada por middlewares/policies de rota. Quando presente, use simplesmente `return true;`.

### 5. ⚡ Migrations: Não Precisa do Método `down()`
- As migrations do projeto focam exclusivamente na evolução do schema através do método `up()`.
- O método `down()` é **desnecessário** e deve ser omitido nas migrations.

### 6. 🚫 Zero Validações e Mutações Redundantes
- O Controller e as Actions confiam plenamente nos dados validados pelo FormRequest.
- **Proibido** realizar checagens manuais redundantes (como `if ($request->campo !== null)` ou `is_string(...)`) nas Actions ou Controllers após a validação do FormRequest.
- **Proibido** criar métodos `prepareForValidation()` redundantes nos FormRequests para operações que o framework já executa automaticamente:
  - O Laravel já executa globalmente os middlewares `TrimStrings` e `ConvertEmptyStringsToNull`, tornando chamadas como `$this->string('campo')->trim()->toString()` ou conversões de string vazia em `null` 100% desnecessárias.
  - Valores padrão (defaults como `'aba' => 'todos'` ou ordenação) devem ser tratados diretamente no Controller (`$request->input('aba', 'todos')`) ou na Action, mantendo o FormRequest focado **exclusivamente em validar regras**.

### 7. 🔄 Padronização de Nomenclatura Frontend ↔ Backend
- O frontend DEVE enviar os campos nos formulários e requisições **exatamente com os mesmos nomes esperados pelo backend** (`snake_case` padrão das colunas do banco/model).
- O backend responde os dados nessa mesma nomenclatura.
- Isso elimina conversões manuais de `camelCase` para `snake_case`, validações redundantes e inconsistências de payload.

### 8. 🛡️ Laravel Precognition Obrigatório em Formulários
- Em **todo formulário** no frontend (React 19 + Inertia v3), é **obrigatório** utilizar o **Laravel Precognition** para validação em tempo real e exibição de mensagens de erro campo a campo diretamente das regras do FormRequest.

### 9. 🚀 Execução Obrigatória do `composer verify`
- Ao final de **CADA prompt ou alteração de código realizada**, é **OBRIGATÓRIO** rodar o comando:
  ```bash
  composer verify
  ```
- O comando garante que o código passe com sucesso por **Oxlint**, **Rector**, **PHPStan** e **Pest Tests** antes de finalizar a resposta.

### 10. 🧠 Consulta Obrigatória ao `MEMORY.md` e `CONTEXT.md`
- Antes de iniciar qualquer desenvolvimento ou refatoração, a IA DEVE consultar o `MEMORY.md` para evitar repetir erros passados.
- Ao construir um novo módulo ou funcionalidade, a IA DEVE seguir rigorosamente a sequência em 4 passos de `CONTEXT.md` (`passo1-schema-banco` -> `passo2-frontend-ui` -> `passo3-backend-api` -> `passo4-integracao-e2e`).

---

## 🤖 INTELLIGENT AGENT ROUTING

**Antes de responder ou implementar qualquer tarefa, analise o domínio e anuncie o especialista aplicado:**

### Protocolo de Seleção

1. **Backend & APIs**: `backend-specialist` (Skills: `laravel-best-practices`, `laravel-patterns`, `api-patterns`, `database-design`).
2. **Frontend & UI**: `frontend-specialist` (Skills: `inertia-react-development`, `frontend-design`, `shadcn`, `tailwindcss-development`).
3. **Tarefas Complexas / Fullstack**: `orchestrator` (coordena backend e frontend).
4. **Debug & Resolução de Erros**: `debugger` (Skills: `systematic-debugging`, `debug-using-debugbar`).
5. **Testes & Qualidade**: `test-engineer` (Skills: `pest-testing`, `laravel-tdd`, `tdd-workflow`).
6. **Code Review & Auditoria de Código**: `code-reviewer` (Skills: `code-review-checklist`, `clean-code`, `laravel-best-practices`, `wayfinder-development`).
7. **Revisão Especializada PHP/Laravel**: `php-reviewer` (Skills: `laravel-best-practices`, `laravel-patterns`, `clean-code`, `pest-testing`, `backend-cadastro`, `backend-listagem`).
8. **Revisão Especializada React/Inertia**: `react-reviewer` (Skills: `inertia-react-development`, `frontend-design`, `shadcn`, `tailwindcss-development`, `frontend-cadastro`, `frontend-listagem`, `wayfinder-development`).
9. **Revisão Especializada TypeScript**: `typescript-reviewer` (Skills: `clean-code`, `inertia-react-development`, `wayfinder-development`).
10. **Simplificação & Clareza de Código**: `code-simplifier` (Skills: `clean-code`, `laravel-best-practices`, `inertia-react-development`).
11. **Passo 1 - Schema & Contratos**: `passo1-schema-banco` (Skills: `clean-code`, `database-design`, `laravel-best-practices`, `api-patterns`, `lint-and-validate`, `powershell-windows`).
12. **Passo 2 - Frontend UI**: `passo2-frontend-ui` (Skills: `clean-code`, `frontend-design`, `frontend-cadastro`, `frontend-listagem`, `tailwindcss-development`, `shadcn`, `inertia-react-development`, `lint-and-validate`, `powershell-windows`).
13. **Passo 3 - Backend API**: `passo3-backend-api` (Skills: `clean-code`, `laravel-best-practices`, `backend-cadastro`, `backend-listagem`, `pest-testing`, `api-patterns`, `lint-and-validate`, `powershell-windows`).
14. **Passo 4 - Integração & Wire-up**: `passo4-integracao-e2e` (Skills: `clean-code`, `wayfinder-development`, `inertia-react-development`, `cadastro-listagem-completo`, `lint-and-validate`, `powershell-windows`).

### Formato de Resposta Mandatório

Ao aplicar um especialista, inicie a resposta informando:

```markdown
🤖 **Applying knowledge of `@[agent-name]`...**

[Conteúdo da resposta ou implementação especializada]
```

---

## 🧹 CLEAN CODE & PRINCÍPIOS GERAIS

- **Conciso e Direto**: Sem over-engineering, sem classes desnecessárias ou abstrações prematuras.
- **Wayfinder**: Sempre utilize rotas tipadas do Wayfinder (`@/actions/` ou `@/routes/`) no frontend, nunca URLs hardcoded.
- **Pint & Testes**: Formate PHP com `vendor/bin/pint --dirty --format agent` e teste com `php artisan test --compact`.
- **Idioma**: Responda no idioma do usuário (Português). Códigos, comentários e variáveis seguem as convenções estabelecidas no projeto.
