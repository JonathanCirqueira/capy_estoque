# 🏗️ Arquitetura e Decisões Técnicas

Registro das decisões que moldaram o projeto para que futuros devs entendam o "porquê".

---

## [ADR-001] Stack Core: Laravel 13 + React 19 + Inertia 3

- **Data:** 10/04/2026
- **Status:** Aceito

### Contexto

Necessidade de uma aplicação monolítica com experiência de SPA (Single Page Application) sem a complexidade de gerenciar uma API separada e estados globais complexos.

### Decisão

Escolhemos o **Laravel 13** com **Inertia.js 3** e **React 19**.

### Consequências

- **Positivo:** Desenvolvimento rápido, roteamento unificado no Laravel, SEO aprimorado via SSR simplificado do Inertia 3.

---

## [ADR-002] Blindagem do Código (Configurações Nativas)

- **Status:** Aceito (Substituído por implementação nativa)

### Contexto

Manter a integridade dos modelos e evitar comportamentos inesperados (N+1 queries invisíveis) sem adicionar dependências externas desnecessárias que possam ser descontinuadas ou causar quebras futuras.

### Decisão

Configuração nativa diretamente no `AppServiceProvider.php` (e ambientes de testes) para ativar:

- **Strict Models:** Erro imediato se tentar acessar um atributo inexistente, disparar Lazy Loading ou descartar atributos silenciados (`Model::shouldBeStrict()`).
- **CarbonImmutable:** Todas as datas do framework usam datas imutáveis por padrão (`Date::use(CarbonImmutable::class)`).
- **Proibições de Produção:** Proteção ativa de banco de dados (`DB::prohibitDestructiveCommands()`) e HTTPS forçado.
- **Ambiente de Testes Seguro:** Bloqueio de requisições reais (`Http::preventStrayRequests()`) e simulações rápidas de tempo (`Sleep::fake()`).

---

## [ADR-003] Actions Pattern

- **Status:** Aceito

### Contexto

Controllers muito grandes dificultam a manutenção e testes.

### Decisão

Extrair a lógica de negócio para classes **Action** (em `app/Actions`). Controllers apenas recebem a requisição e chamam a Action correspondente.

---
