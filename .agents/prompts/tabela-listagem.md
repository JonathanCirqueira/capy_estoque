# 📋 Prompts para Páginas de Listagem (Data Table)

Use os modelos deste arquivo para solicitar a criação de telas completas de listagem ao assistente.

---

## 🎯 Modelo Canônico (Copie, Preencha e Envie no Chat)

> **Dica:** Não é necessário especificar paginação, cards mobile ou detalhes de layout. A skill `@[skills/tabela-listagem]` já aplica toda a arquitetura visual canônica automaticamente.

```markdown
/table [Nome da Entidade]

Use a skill @[skills/tabela-listagem] para gerar a página de listagem completa com base no template canônico do starter kit:

- **Entidade:** [Ex: Fornecedor / Fornecedores]
- **Título da Página:** [Ex: Gestão de Fornecedores]
- **Descrição:** [Ex: Visualize e gerencie os fornecedores cadastrados no sistema.]
- **Botão Principal:** "+ Novo [Ex: Fornecedor]"

- **Colunas da Tabela:**
    - [Nome da Coluna 1] (ordenável: sim/não)
    - [Nome da Coluna 2] (ordenável: sim/não)
    - [Nome da Coluna 3] (ordenável: sim/não)
    - Status (badge colorido com tokens do tema)

- **Abas de Status (com contagem e cores de tema):**
    - Todas (primary), [Status A (success)], [Status B (warning)], [Status C (destructive)]

- **Filtros Secundários em Grid:**
    - [Nome do Filtro 1]: [Opção 1, Opção 2, Opção 3]
    - [Nome do Filtro 2]: [Opção 1, Opção 2, Opção 3]

- **Pesquisa Rápida:**
    - Filtrar por: [Campos buscáveis, ex: nome, documento, e-mail]
```

---

## 🚀 Exemplos Prontos para Copiar e Testar

### 1. Gestão de Usuários

```markdown
/table Usuarios

Use a skill @[skills/tabela-listagem] para gerar a página de listagem completa com base no template canônico do starter kit:

- **Entidade:** Usuário / Usuários
- **Título da Página:** Gestão de Usuários
- **Descrição:** Controle os usuários, perfis de acesso e departamentos do sistema.
- **Botão Principal:** "Cadastrar"

- **Colunas da Tabela:**
    - Nome Completo (ordenável: sim)
    - E-mail (ordenável: sim)
    - Perfil / Cargo (ordenável: sim)
    - Departamento (ordenável: sim)
    - Status (badge colorido)

- **Abas de Status (com contagem e cores de tema):**
    - Todos (primary), Ativos (success), Pendentes (warning), Inativos (destructive)

- **Filtros Secundários em Grid:**
    - Departamento: [Engenharia, Comercial, RH, Financeiro]
    - Perfil: [Administrador, Gestor, Operador]

- **Pesquisa Rápida:**
    - Filtrar por: nome ou e-mail
```
