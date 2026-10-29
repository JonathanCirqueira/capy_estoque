# 📋 Especificação do Módulo (`CONTEXT.md`)

> **Instruções para a IA**:
> 1. Consulte o `MEMORY.md` antes de iniciar qualquer tarefa.
> 2. Execute **uma tarefa por vez** seguindo estritamente a ordem do checklist abaixo.
> 3. Ao finalizar a implementação de cada passo, submeta obrigatoriamente a auditoria ao revisor especializado correspondente:
>    - **Passo 1**: `php-reviewer` (Schema, Migrations, Enums e Models)
>    - **Passo 2**: `react-reviewer` (Componentes, Design, Precognition e Acessibilidade)
>    - **Passo 3**: `php-reviewer` (Thin Controllers, Actions, FormRequests e Best Practices)
>    - **Passo 4**: `typescript-reviewer` & `react-reviewer` (Integração E2E, Wayfinder, bodyData e Testes)
> 4. Somente após a aprovação do revisor e aprovação total no `composer verify`, marque o checkbox `[x]` e realize o `git commit` automaticamente em português (`feat`, `refactor`, `fix`, `chore`). NUNCA faça `git push` de forma autônoma.

---

## 📌 Visão Geral do Módulo Atual
<!-- Preencher com a descrição do módulo que será construído -->
- **Nome do Módulo**: [A definir]
- **Objetivo**: [A definir]
- **Entidades Principais**: [A definir]

---

## 🔄 Fluxo de Desenvolvimento em 4 Passos com Quality Gates

```mermaid
flowchart TD
    A["Passo 1: Schema & Banco<br/>(passo1-schema-banco)"] --> R1["Quality Gate: Review Schema<br/>(php-reviewer)"]
    R1 -->|Aprovado| B["Passo 2: Frontend & UI<br/>(passo2-frontend-ui)"]
    R1 -.->|Ajustes| A
    B --> R2["Quality Gate: Review Frontend<br/>(react-reviewer)"]
    R2 -->|Aprovado| C["Passo 3: Backend & API<br/>(passo3-backend-api)"]
    R2 -.->|Ajustes| B
    C --> R3["Quality Gate: Review Backend<br/>(php-reviewer)"]
    R3 -->|Aprovado| D["Passo 4: Integração & E2E<br/>(passo4-integracao-e2e)"]
    R3 -.->|Ajustes| C
    D --> R4["Quality Gate: Review Integração<br/>(typescript-reviewer & react-reviewer)"]
    R4 -->|Aprovado| E["Módulo Concluído com Sucesso"]
    R4 -.->|Ajustes| D
```

---

### 🗄️ Passo 1: Schema, Enums & Banco (`passo1-schema-banco`)
Responsável pelo modelamento de banco de dados, enums tipados, models com casts estritos, migrations sem `down()`, factories e seeders.

- [ ] **1.1. Enums PHP & TypeScript**: Criar PHP Backed Enums em `app/Enums/` e espelhar exatamente em `resources/js/types/` (sem strings mágicas).
- [ ] **1.2. Migration**: Criar migration evolutiva apenas com `up()`, com chaves estrangeiras seguras (`restrictOnDelete` / `nullOnDelete`), índices adequados e campos brutos.
- [ ] **1.3. Model**: Definir Model com `$fillable`, `casts(): array` tipados (Enums, datas, booleans) e relacionamentos.
- [ ] **1.4. Factory & Seeder**: Criar Factory com estados coerentes e Seeder associado.
- [ ] **1.5. Quality Gate: Code Review de Schema & Banco (`php-reviewer`)**: Submeter migrations, models, enums e seeders ao `php-reviewer` para auditar ausência de `down()`, ausência de `cascadeOnDelete()`, uso de Backed Enums, `casts(): array` nas models e integridade de tipos. Corrigir eventuais apontamentos antes de prosseguir.
- [ ] **1.6. Verificação de Integridade**: Executar `php artisan migrate`, `php artisan db:seed` e `composer verify`.
- [ ] **1.7. Commit**: `feat(database): criar migrations, models, enums e seeders de [modulo]`.

---

### 🎨 Passo 2: Frontend & Interface do Usuário (`passo2-frontend-ui`)
Responsável pela construção visual e componentes com React 19, Inertia.js v3, Tailwind CSS v4 e Shadcn/UI, seguindo as diretrizes de design e usabilidade.

- [ ] **2.1. Tipos TypeScript**: Definir interfaces em `resources/js/types/` alinhadas 100% com o backend (campos em `snake_case`, dados brutos).
- [ ] **2.2. Página de Listagem**: Criar `resources/js/pages/[modulo]/index.tsx` com container fluido (`p-4 md:p-6`, sem `max-w-*`), cabeçalho de título, busca unificada, filtros em linha, contadores/tabs e tabela responsiva com cards mobile agnósticos.
- [ ] **2.3. Modal ou Página de Cadastro/Edição**:
  - Se $\le$ 8 campos: Modal (`sm:max-w-3xl`) com validação Precognition em tempo real e foco acessível.
  - Se > 8 campos: Página dedicada.
- [ ] **2.4. Modal de Confirmação**: Usar padrão de confirmação com título/botão destrutivo em `#ce3765` para inativação lógica.
- [ ] **2.5. Menu Sidebar**: Registrar item de navegação no menu lateral da aplicação com ícone Lucide adequado.
- [ ] **2.6. Quality Gate: Code Review Frontend (`react-reviewer`)**: Submeter os arquivos de UI ao `react-reviewer` para auditar conformidade com `frontend-cadastro`, `frontend-listagem`, Precognition e regras do Starter Kit. Corrigir eventuais apontamentos antes de prosseguir.
- [ ] **2.7. Verificação de Integridade**: Executar `npm run build` ou `composer verify` para validar componentes e tipagens.
- [ ] **2.8. Commit**: `feat(ui): implementar telas de listagem e formulario de [modulo]`.

---

### ⚙️ Passo 3: Backend, Regras de Negócio & API (`passo3-backend-api`)
Responsável por Thin Controllers, FormRequests com Precognition, Actions transacionais puras e rotas nomeadas.

- [ ] **3.1. FormRequests**: Criar Requests específicos (`IndexRequest`, `StoreRequest`, `UpdateRequest`) com regras de validação estritas (sem `authorize()` desnecessário e sem `prepareForValidation()` redundante).
- [ ] **3.2. Actions Transacionais**: Criar Actions isoladas em `app/Actions/[Modulo]/` encapsuladas em `DB::transaction()` para mutações (sem injeção no `__construct` do Controller).
- [ ] **3.3. Thin Controller**: Implementar Controller enxuto que recebe o FormRequest validado, delega para a Action e retorna `Inertia::render()` com dados brutos ou redirecionamento.
- [ ] **3.4. Rotas & Wayfinder**: Registrar rotas em `routes/web.php` e executar `php artisan wayfinder:generate --with-form`.
- [ ] **3.5. Quality Gate: Code Review Backend (`php-reviewer`)**: Submeter os arquivos PHP ao `php-reviewer` para auditar conformidade com `backend-cadastro`, `backend-listagem`, `laravel-best-practices`, ausência de strings mágicas e dados brutos. Corrigir eventuais apontamentos antes de prosseguir.
- [ ] **3.6. Verificação de Integridade**: Executar `composer verify` (PHPStan nível estrito, Pint e Pest).
- [ ] **3.7. Commit**: `feat(api): implementar controller, form requests e actions de [modulo]`.

---

### 🧪 Passo 4: Integração, Testes & E2E (`passo4-integracao-e2e`)
Responsável pela validação ponta a ponta, conectando UI via rotas tipadas do Wayfinder com Precognition e cobrindo com testes automatizados Pest v4.

- [ ] **4.1. Conexão UI ↔ Wayfinder**: Conectar botões, formulários e links aos métodos gerados do Wayfinder (`@/actions/...` ou `@/routes/...`) com `useForm` ou Precognition, enviando os dados diretamente como payload no `bodyData` (zero `FormData` manual).
- [ ] **4.2. Testes de Feature (Pest)**: Criar testes cobrindo:
  - Renderização da listagem e filtros.
  - Validação de dados no cadastro e atualização.
  - Execução bem-sucedida de criação, edição e inativação lógica.
  - Permissões e proteção de rotas.
- [ ] **4.3. Quality Gate: Code Review de Integração & Tipagem (`typescript-reviewer` & `react-reviewer`)**: Submeter os arquivos integrados e testes aos revisores para auditar: rotas tipadas do Wayfinder sem URLs hardcoded, envio direto em `bodyData` (zero `FormData` manual), paridade 1:1 de campos em `snake_case`, ausência de `any` no TypeScript e cobertura completa de testes. Corrigir eventuais apontamentos antes de prosseguir.
- [ ] **4.4. Verificação de Integridade**: Rodar `composer verify` (Oxlint, Rector, PHPStan, Pint e Pest).
- [ ] **4.5. Commit**: `test(e2e): adicionar testes automatizados e integracao do [modulo]`.

