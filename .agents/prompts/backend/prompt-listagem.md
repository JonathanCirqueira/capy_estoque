# 📋 Prompts para Listagem Backend (Index, Filtros e Abas)

> 💡 **Princípio Schema First:**
> Sempre declare campos, filtros e Enums alinhados com o Model (`app/Models/`) e migrations reais.
> Relacionamentos em `with()` devem ser métodos Eloquent reais (nunca inclua colunas JSON/array nativas).

Use os modelos deste arquivo para solicitar a implementação completa da camada backend de listagem e consulta (Index/Filters) seguindo o padrão canônico do Starter Kit: **Thin Controller + Action de Filtragem sem N+1 + FormRequest de Listagem + Contadores de Abas Cloned**.

---

## 🎯 Modelo Canônico (Copie, Preencha e Envie no Chat)

```markdown
/backend-listagem [Nome da Entidade]

Use a skill @[skills/backend-listagem-itens] para implementar a listagem e filtros de consulta no backend seguindo o padrão canônico do Starter Kit:

- **Entidade:** [Ex: Fornecedor / Fornecedores]
- **Tabela / Model:** [Ex: fornecedores / App\Models\Fornecedor]
- **Rota:** [Ex: GET /fornecedores -> fornecedores.index]
- **Controller:** [Ex: App\Http\Controllers\FornecedorController@index]
- **Action de Filtragem:** [Ex: App\Actions\FiltrarFornecedoresAction]
- **Form Request de Listagem:** [Ex: App\Http\Requests\ListarFornecedoresRequest]
- **Policy:** [Ex: App\Policies\FornecedorPolicy@viewAny]
- **Página Inertia:** [Ex: fornecedores/index]

- **Abas de Status (com contagem dinâmica):**
    - Todos (`todos`), Ativos (`ativos`), Pendentes (`pendentes`), Inativos (`inativos`)

- **Pesquisa Rápida (Termo textual):**
    - Campos pesquisados: [Ex: razao_social, nome_fantasia, cnpj, email]

- **Filtros Secundários em Grid:**
    - [campo_filtro_1]: [tipo, ex: categoria_id, foreignId]
    - [campo_filtro_2]: [tipo, ex: cidade, string]

- **Relacionamentos Eager Loading (Prevenção de N+1):**
    - [Ex: categoria, servicos, departamento]

- **Ordenação:**
    - Campos permitidos: [Ex: nome, created_at]
    - Padrão: created_at desc
```

---

## 🚀 Exemplo Pronto: Listagem de Usuários

```markdown
/backend-listagem Usuarios

Use a skill @[skills/backend-listagem-itens] para implementar a listagem, filtros e abas de usuários no backend com base no template canônico:

- **Entidade:** Usuário (`App\Models\User`)
- **Tabela / Model:** `users` / `App\Models\User`
- **Rota:** `GET /usuarios` -> `usuarios.index`
- **Controller:** `App\Http\Controllers\UsuarioController@index`
- **Action de Filtragem:** `App\Actions\FiltrarUsuariosAction`
- **Form Request de Listagem:** `App\Http\Requests\ListarUsuariosRequest`
- **Policy:** `App\Policies\UserPolicy@viewAny`
- **Página Inertia:** `usuarios/index`

- **Abas de Status (com contagem dinâmica):**
    - Todos (`todos`), Ativos (`ativos`), Pendentes (`pendentes`), Inativos (`inativos`)

- **Pesquisa Rápida (Termo textual):**
    - Campos pesquisados: `name`, `email`

- **Filtros Secundários em Grid:**
    - `nivel_acesso`: valor de enum `App\Enums\NivelAcesso`

- **Relacionamentos Eager Loading (Prevenção de N+1):**
    - Nenhum (a coluna `servicos` é um campo JSON nativo da tabela `users`, não é um método de relação Eloquent e NÃO deve ser passada no `with()`)

- **Ordenação:**
    - Campos permitidos: `name`, `email`, `created_at`
    - Padrão: `created_at desc`
```
