# Antigravity Kit Architecture

> Comprehensive AI Agent Capability Expansion Toolkit

---

## 📋 Overview

Antigravity Kit is a modular system consisting of:

- **20 Specialist Agents** - Role-based AI personas
- **36 Skills** - Domain-specific knowledge modules
- **11 Workflows** - Slash command procedures

---

## 🏗️ Directory Structure

```plaintext
.agent/
├── ARCHITECTURE.md          # This file
├── agents/                  # 20 Specialist Agents
├── skills/                  # 36 Skills
├── workflows/               # 11 Slash Commands
├── rules/                   # Global Rules
└── scripts/                 # Master Validation Scripts
```

---

## 🤖 Agents (20)

Specialist AI personas for different domains.

| Agent                    | Focus                      | Skills Used                                              |
| ------------------------ | -------------------------- | -------------------------------------------------------- |
| `orchestrator`           | Multi-agent coordination   | parallel-agents, behavioral-modes, intelligent-routing   |
| `project-planner`        | Discovery, task planning   | brainstorming, plan-writing, architecture                |
| `frontend-specialist`    | Web UI/UX (Inertia/React)  | frontend-design, inertia-react-development, tailwind-patterns, wayfinder-development, shadcn, frontend-listagem, frontend-cadastro |
| `backend-specialist`     | Laravel API, logic, DB     | laravel-best-practices, laravel-patterns, fortify-development, pest-testing, wayfinder-development, debug-using-debugbar, api-patterns, database-design, backend-cadastro, backend-listagem |
| `database-architect`     | Schema, SQL, Migrations    | database-design, laravel-best-practices                 |
| `test-engineer`          | Testing strategies (Pest)  | pest-testing, laravel-tdd, testing-patterns, tdd-workflow |
| `debugger`               | Root cause analysis        | systematic-debugging, debug-using-debugbar              |
| `performance-optimizer`  | Speed, Web Vitals, Queries | performance-profiling, debug-using-debugbar, laravel-best-practices |
| `security-auditor`       | Security compliance        | vulnerability-scanner, clean-code                        |
| `code-reviewer`          | Code quality, security, git diffs | clean-code, code-review-checklist, laravel-best-practices, testing-patterns |
| `php-reviewer`           | PHP 8.3 & Laravel 13 review | laravel-best-practices, laravel-patterns, clean-code, pest-testing, database-design, backend-cadastro, backend-listagem |
| `react-reviewer`         | React 19 & Inertia v3 review | inertia-react-development, frontend-design, shadcn, tailwindcss-development, frontend-cadastro, frontend-listagem, clean-code |
| `typescript-reviewer`    | TypeScript type safety & patterns | clean-code, inertia-react-development, wayfinder-development |
| `code-simplifier`        | Code clarity, simplification | clean-code, laravel-best-practices, inertia-react-development, pest-testing |
| `qa-automation-engineer` | E2E testing, CI pipelines  | webapp-testing, pest-testing                             |
| `code-archaeologist`     | Legacy code, refactoring   | clean-code, code-review-checklist                        |
| `documentation-writer`   | Manuals, docs              | documentation-templates                                  |
| `explorer-agent`         | Codebase analysis          | -                                                        |

---

## 🧩 Skills (41)

Modular knowledge domains that agents can load on-demand based on task context.

### Backend & Laravel

| Skill                   | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `laravel-best-practices`| Regras essenciais de Eloquent, actions, routing, migrations, queries e mail     |
| `laravel-patterns`      | Padrões arquiteturais Laravel 13, thin controllers, Action classes e queues    |
| `backend-cadastro`      | Padrão para criação/cadastro de recursos no backend com FormRequests e Actions  |
| `backend-listagem`      | Listagem, filtros reativos e contadores de abas sem N+1                         |
| `fortify-development`   | Autenticação completa, 2FA, login, registro e profile com Laravel Fortify       |
| `api-patterns`          | Princípios de design de API REST, paginação e versionamento                     |
| `database-design`       | Modelagem relacional, estratégias de indexação e integridade                    |
| `debug-using-debugbar`  | Investigação de N+1, queries lentas e profiling via Laravel Debugbar            |

### Frontend & Inertia React

| Skill                           | Description                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| `inertia-react-development`     | Aplicações client-side com Inertia.js v3 e React 19                   |
| `wayfinder-development`         | Integração tipada TypeScript para rotas e actions do Laravel          |
| `frontend-design`               | Design thinking, UI/UX, acessibilidade e sistemas de design          |
| `frontend-cadastro`         | Formulários padronizados, Precognition, decisão Modal vs Página       |
| `frontend-listagem`         | Tabelas completas, StatusTabs, filtros dinâmicos e exportação         |
| `tailwind-patterns`             | Princípios e arquitetura de design tokens com Tailwind CSS v4         |
| `tailwindcss-development`       | Utilitários e responsividade Tailwind CSS para componentes JSX        |
| `shadcn`                        | Catálogo, composição e estilização de componentes shadcn/ui           |
| `web-design-guidelines`         | Auditoria de interface web para acessibilidade, UX e performance     |

### Testing & Quality

| Skill                   | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `pest-testing`          | Testes automatizados Pest PHP v4, datasets e asserções     |
| `laravel-tdd`           | Ciclo TDD no Laravel 13 com Pest v4, Inertia e Fakes       |
| `testing-patterns`      | Padrões de teste unitário, integração e mocking            |
| `webapp-testing`        | Testes E2E e Playwright para validação de fluxos completos  |
| `tdd-workflow`          | Ciclo Red-Green-Refactor                                   |
| `code-review-checklist` | Diretrizes de code review, qualidade e segurança          |
| `lint-and-validate`     | Execução de linter e validações estáticas                  |

### Architecture, Planning & Discovery

| Skill                   | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `architecture`          | Tomada de decisão arquitetural, ADRs e trade-offs         |
| `app-builder`           | Orquestrador de construção de aplicações full-stack        |
| `plan-writing`          | Planejamento estruturado de tarefas e quebra de escopo     |
| `brainstorming`         | Protocolo socrático e discovery com o usuário              |
| `intelligent-routing`   | Seleção automática e roteamento de agentes especialistas   |

### Security & Performance

| Skill                   | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `vulnerability-scanner` | Auditoria de segurança, OWASP 2025 e análise de dependências |
| `performance-profiling` | Métricas de performance e otimização Core Web Vitals       |
| `systematic-debugging`  | Metodologia em 4 fases para identificação de causa-raiz    |

### Core, Process & Environment

| Skill                     | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| `clean-code`              | Código conciso, direto e sem over-engineering (Global)   |
| `behavioral-modes`        | Modos operacionais dos agentes                           |
| `parallel-agents`         | Padrões de orquestração multi-agente                      |
| `documentation-templates` | Padrões de documentação e manuais                        |
| `i18n-localization`       | Padrões de internacionalização e localização             |
| `deployment-procedures`   | Princípios de deploy seguro e verificação                |
| `server-management`       | Gestão de processos e servidores                         |
| `powershell-windows`      | Padrões e operadores de execução no PowerShell Windows   |
| `bash-linux`              | Padrões e comandos de terminal Linux / Bash              |

---

## 🔄 Workflows (11)

Slash command procedures. Invoke with `/command`.

| Command          | Description              |
| ---------------- | ------------------------ |
| `/brainstorm`    | Socratic discovery       |
| `/create`        | Create new features      |
| `/debug`         | Debug issues             |
| `/deploy`        | Deploy application       |
| `/enhance`       | Improve existing code    |
| `/orchestrate`   | Multi-agent coordination |
| `/plan`          | Task breakdown           |
| `/preview`       | Preview changes          |
| `/status`        | Check project status     |
| `/test`          | Run tests                |
| `/ui-ux-pro-max` | Design with 50 styles    |

---

## 🎯 Skill Loading Protocol

```plaintext
User Request → Skill Description Match → Load SKILL.md
                                            ↓
                                    Read references/
                                            ↓
                                    Read scripts/
```

### Skill Structure

```plaintext
skill-name/
├── SKILL.md           # (Required) Metadata & instructions
├── scripts/           # (Optional) Python/Bash scripts
├── references/        # (Optional) Templates, docs
└── assets/            # (Optional) Images, logos
```

### Enhanced Skills (with scripts/references)

| Skill           | Files | Coverage                         |
| --------------- | ----- | -------------------------------- |
| `ui-ux-pro-max` | 27    | 50 styles, 21 palettes, 50 fonts |
| `app-builder`   | 20    | Full-stack scaffolding           |

---

## � Scripts (2)

Master validation scripts that orchestrate skill-level scripts.

### Master Scripts

| Script          | Purpose                                 | When to Use              |
| --------------- | --------------------------------------- | ------------------------ |
| `checklist.py`  | Priority-based validation (Core checks) | Development, pre-commit  |
| `verify_all.py` | Comprehensive verification (All checks) | Pre-deployment, releases |

### Usage

```bash
# Quick validation during development
python .agent/scripts/checklist.py .

# Full verification before deployment
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

### What They Check

**checklist.py** (Core checks):

- Security (vulnerabilities, secrets)
- Code Quality (lint, types)
- Schema Validation
- Test Suite
- UX Audit
- SEO Check

**verify_all.py** (Full suite):

- Everything in checklist.py PLUS:
- Lighthouse (Core Web Vitals)
- Playwright E2E
- Bundle Analysis
- Mobile Audit
- i18n Check

For details, see [scripts/README.md](scripts/README.md)

---

## 📊 Statistics

| Metric              | Value                         |
| ------------------- | ----------------------------- |
| **Total Agents**    | 20                            |
| **Total Skills**    | 36                            |
| **Total Workflows** | 11                            |
| **Total Scripts**   | 2 (master) + 18 (skill-level) |
| **Coverage**        | ~90% web/mobile development   |

---

## 🔗 Quick Reference

| Need     | Agent                 | Skills                                |
| -------- | --------------------- | ------------------------------------- |
| Web App  | `frontend-specialist` | react-best-practices, frontend-design |
| API      | `backend-specialist`  | api-patterns, nodejs-best-practices   |
| Mobile   | `mobile-developer`    | mobile-design                         |
| Database | `database-architect`  | database-design, prisma-expert        |
| Security | `security-auditor`    | vulnerability-scanner                 |
| Testing  | `test-engineer`       | testing-patterns, webapp-testing      |
| Debug    | `debugger`            | systematic-debugging                  |
| Plan     | `project-planner`     | brainstorming, plan-writing           |
