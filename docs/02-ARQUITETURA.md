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

## [ADR-002] Blindagem do Código (Essentials)

- **Status:** Aceito

### Contexto

Manter a integridade dos modelos e evitar comportamentos inesperados (N+1 queries invisíveis).

### Decisão

Uso do pacote **nunomaduro/essentials** para ativar:

- **Strict Models:** Erro imediato se tentar acessar um atributo inexistente ou disparar Lazy Loading.
- **CarbonImmutable:** Todas as datas são imutáveis por padrão.

---

## [ADR-003] Actions Pattern

- **Status:** Aceito

### Contexto

Controllers muito grandes dificultam a manutenção e testes.

### Decisão

Extrair a lógica de negócio para classes **Action** (em `app/Actions`). Controllers apenas recebem a requisição e chamam a Action correspondente.

---
