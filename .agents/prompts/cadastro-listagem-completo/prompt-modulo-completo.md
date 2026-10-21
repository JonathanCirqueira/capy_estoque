# 📋 Prompts para Módulo Completo: Cadastro + Listagem (Frontend + Backend)

> 💡 **Critério Arquitetural do Módulo:**
> - **Até 8 campos (`<= 8`):** O cadastro/edição será gerado como um **MODAL (`Dialog`)** na própria listagem.
> - **Mais de 8 campos (`> 8`):** O cadastro/edição será gerado como uma **PÁGINA COMPLETA** contínua com seções temáticas e rodapé sticky.
> - **Remoção Segura (Regra de Ouro):** **NUNCA DELETAR DO BANCO**. A exclusão é sempre lógica (`status = Inativo`).

---

## ⚡ Opção 1: Formulário em MODAL (até 8 campos)

Copie o prompt abaixo, preencha os dados da sua entidade e envie para iniciar a geração:

```markdown
Use a skill @[skills/cadastro-listagem-completo] para criar o módulo fullstack completo de "[Nome da Entidade]" (Frontend + Backend):

### 1. Entidade e Arquitetura
- **Entidade:** [Ex: Produto / App\Models\Produto]
- **Tabela:** [Ex: produtos]
- **Tipo de Formulário:** Modal (até 8 campos)
- **Menu Lateral:** Adicionar link em `resources/js/components/app-sidebar.tsx` com o título "[Nome do Menu]" e ícone Lucide [Ex: Package].

### 2. Campos (Mesmos nomes no Front e Back em snake_case)
- `[campo_1]`: string, obrigatório, max: 255 (Ex: nome)
- `[campo_2]`: string, obrigatório, único na tabela ignorando ID atual (Ex: codigo)
- `[campo_3]`: integer, obrigatório, centavos de moeda ou quantidade (Ex: preco_centavos)
- `[campo_relacionado_id]`: integer, foreignId exists:[tabela_relacionada],id (Ex: categoria_id)
- `status`: Backed Enum `App\Enums\Status[Entidade]` (`Ativo`, `Pendente`, `Inativo`)

### 3. Listagem e Filtros
- **Abas de Status:** Todos, Ativos, Pendentes, Inativos (com contadores dinâmicos).
- **Busca:** Pesquisar em `[campo_1]` e `[campo_2]` com ícone de lupa.
- **Filtros em Grid:** Combobox para `[campo_relacionado_id]`.
- **Tabela:** Colunas ordenáveis, badges temáticos de status e cards responsivos para mobile.
- **Ações por Linha:** Editar (abre modal preenchido) e Inativar (altera status para Inativo).

### 4. Ciclo de Vida e Regras de Negócio
- **Cadastro (POST):** `Criar[Entidade]Action` dentro de `DB::transaction()`.
- **Edição (PUT):** `Atualizar[Entidade]Action` preservando integridade.
- **Inativação (DELETE):** Nunca deletar do banco. `Inativar[Entidade]Action` altera status para `Inativo`.

### 5. Finalização Obrigatória
- Executar `php artisan wayfinder:generate --with-form`.
- Executar `composer verify`.
```

---

## ⚡ Opção 2: Formulário em PÁGINA COMPLETA (mais de 8 campos)

Copie o prompt abaixo, preencha as seções e envie para gerar o módulo com tela dedicada:

```markdown
Use a skill @[skills/cadastro-listagem-completo] para criar o módulo fullstack completo de "[Nome da Entidade]" com formulário em Página Completa (Frontend + Backend):

### 1. Entidade e Arquitetura
- **Entidade:** [Ex: Colaborador / App\Models\Colaborador]
- **Tabela:** [Ex: colaboradores]
- **Tipo de Formulário:** Página Completa Contínua (mais de 8 campos)
- **Rotas:**
  - Listagem: `GET /[modulo]` -> `[modulo].index`
  - Formulário: `GET /[modulo]/cadastrar` -> `[modulo].create` (suporta `?id=` para edição)
  - Persistência: `POST /[modulo]` e `PUT /[modulo]/{id}`
  - Inativação: `DELETE /[modulo]/{id}` -> exclusão lógica
- **Menu Lateral:** Adicionar link em `resources/js/components/app-sidebar.tsx` com o título "[Nome do Menu]" e ícone Lucide [Ex: Users].

### 2. Seções e Campos (Mesmos nomes no Front e Back em snake_case)
- **Seção 1: [Nome da Seção 1]** (Ícone Lucide: [Ex: User])
  - `[campo_1]`: string, obrigatório, max: 255
  - `[campo_2]`: string, obrigatório, único ignorando ID atual
  - `[campo_3]`: string/email, obrigatório, único
- **Seção 2: [Nome da Seção 2]** (Ícone Lucide: [Ex: Briefcase])
  - `[campo_4]`: string, obrigatório
  - `[campo_relacionado_id]`: integer, foreignId exists:[tabela_relacionada],id
  - `[campo_5]`: date, obrigatório
- **Seção 3: [Nome da Seção 3]** (Ícone Lucide: [Ex: Shield])
  - `[perfil_ou_tipo]`: Backed Enum `App\Enums\[TipoEnum]` (`Opcao1`, `Opcao2`)
  - `status`: Backed Enum `App\Enums\Status[Entidade]` (`Ativo`, `Inativo`)
  - `[observacoes]`: text, opcional

### 3. Listagem e Filtros
- **Abas de Status:** Todos, Ativos, Inativos com contadores dinâmicos.
- **Busca:** Pesquisar em `[campo_1]` e `[campo_2]`.
- **Filtros Secundários em Grid:** Comboboxes para relacionamentos e enums.
- **Navegação do Formulário:**
  - Botão "Cadastrar" no cabeçalho navega para `/[modulo]/cadastrar`.
  - Ação "Editar" na tabela navega para `/[modulo]/cadastrar?id={item.id}`.
  - Ação "Inativar" executa exclusão lógica sem remover do banco.

### 4. Ciclo de Vida e Regras de Negócio
- **Cadastro (POST):** `Criar[Entidade]Action` dentro de `DB::transaction()`.
- **Edição (PUT):** `Atualizar[Entidade]Action` preservando integridade.
- **Inativação (DELETE):** Nunca deletar do banco. `Inativar[Entidade]Action` altera status para `Inativo`.

### 5. Finalização Obrigatória
- Executar `php artisan wayfinder:generate --with-form`.
- Executar `composer verify`.
```
