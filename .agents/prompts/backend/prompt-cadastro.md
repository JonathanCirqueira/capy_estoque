# 📋 Prompts para Cadastro Backend (Copiar e Colar)

> 💡 **Critério Rápido:**
> - **Até 8 campos (`<= 8`):** Use a **Opção 1 (Modal)** -> Controller responde com `redirect()->back()`.
> - **Mais de 8 campos (`> 8`):** Use a **Opção 2 (Página Completa)** -> Controller possui `create()` e `store()` responde com `redirect()->route('[entidade].index')`.

---

## ⚡ Opção 1: Backend para Cadastro via MODAL (até 8 campos)

Copie e envie o prompt abaixo quando a tela de cadastro for um **Modal (Dialog)**:

### 🎯 Modelo Simples (Preencha os dados):
```markdown
/backend-cadastro [Nome da Entidade]

Use a skill @[skills/backend-cadastro-item] para implementar a funcionalidade completa de cadastro no backend com base no template canônico:

- **Entidade:** [Ex: Fornecedor / App\Models\Fornecedor]
- **Tabela:** [Ex: fornecedores]
- **Tipo de Cadastro:** Modal (até 8 campos)
- **Rotas:** 
    - `POST /[rota]` -> `[rota].store`
    - `PUT /[rota]/{[entidade]}` -> `[rota].update`
- **Controller:** App\Http\Controllers\[Entidade]Controller (métodos `store` e `update`)
- **Actions:** 
    - Criação: App\Actions\Criar[Entidade]Action
    - Edição: App\Actions\Atualizar[Entidade]Action
- **Form Request:** App\Http\Requests\Salvar[Entidade]Request
- **Policy:** App\Policies\[Entidade]Policy (`create` e `update`)

- **Resposta HTTP do Controller:**
    - `redirect()->back()` para permitir que o modal seja fechado e o Inertia recarregue a listagem via `router.reload({ only: ['[entidade]'] })`.

- **Campos e Regras de Validação (Mesmos nomes do Modal React):**
    - `[campo_1]`: string, obrigatório, max: 255, sanitizar com `trim()`
    - `[campo_2]`: string, email, obrigatório, único na tabela ignorando o ID atual (`Rule::unique()->ignore($id)`), sanitizar com `lower()` e `trim()`
    - `status`: Enum tipado obrigatório (App\Enums\Status[Entidade])
    - `[relacionamento_ids]`: array opcional de IDs, sync na Action

- **Processamento nas Actions:**
    - Persistir na tabela dentro de `DB::transaction()`.
    - Definir `status` exclusivamente através do Enum tipado (ZERO strings mágicas).
    - Mapear os campos validados diretamente no `create()` ou `update()` sem variáveis temporárias, sem ternários e sem conversões manuais de enum (`instanceof`/`from`), aproveitando os casts nativos do Eloquent.
    - Sincronizar relacionamentos n:n via `sync()` se houver seleção múltipla.

<!-- OPÇÃO COM ENVIO DE E-MAIL / CONVITE (Apenas no cadastro inicial): -->
- **Efeitos Colaterais:**
    - No cadastro (`store`): Enviar convite/notificação por e-mail (`App\Mail\Convite[Entidade]Mail`) usando fila (`ShouldQueue`) e `$this->afterCommit()`. Na edição (`update`): nenhuma reemissão de convite.

<!-- OPÇÃO SEM ENVIO DE E-MAIL: 
- **Efeitos Colaterais:**
    - Nenhum disparo de e-mail. Apenas persistência direta no banco de dados.
-->
```

### 🚀 Exemplo Preenchido (Usuário com Convite por E-mail):
```markdown
/backend-cadastro Usuario

Use a skill @[skills/backend-cadastro-item] para implementar a funcionalidade completa de cadastro/convite e edição de usuário no backend com base no template canônico:

- **Entidade:** Usuário (`App\Models\User`)
- **Tabela:** `users`
- **Tipo de Cadastro:** Modal (até 8 campos - alinhado com `resources/js/pages/usuarios/components/modal-cadastro-usuario.tsx`)
- **Rotas:** 
    - `POST /usuarios` -> `usuarios.store`
    - `PUT /usuarios/{usuario}` -> `usuarios.update`
- **Controller:** `App\Http\Controllers\UsuarioController` (métodos `store` e `update`)
- **Actions:** 
    - Criação: `App\Actions\CriarUsuarioAction`
    - Edição: `App\Actions\AtualizarUsuarioAction`
- **Form Request:** `App\Http\Requests\SalvarUsuarioRequest`
- **Policy:** `App\Policies\UserPolicy` (`create` e `update`)

- **Resposta HTTP do Controller:**
    - `redirect()->back()` para permitir que o modal seja fechado e o Inertia recarregue os dados via `router.reload({ only: ['usuarios'] })`.

- **Campos e Regras de Validação (Alinhados com o Modal React):**
    - `nome`: string, obrigatório, max: 255, mapeado para a coluna `name` de `users`, sanitizar com `trim()`
    - `email`: string, email, obrigatório, max: 255, único em `users` ignorando o ID atual (`Rule::unique('users', 'email')->ignore($id)`), sanitizar com `lower()` e `trim()`
    - `servicos`: array de strings ou IDs, opcional/nullable (onde `null` representa "Todos os Serviços"). Coluna JSON nativa em `users`.
    - `nivelAcesso`: string/enum `ADMINISTRADOR`, `COMPRADOR` ou `USUARIO_PADRAO`, obrigatório

- **Processamento nas Actions:**
    - Na criação: Gerar senha provisória criptografada segura se não fornecida e definir `status` através do Enum tipado `App\Enums\StatusUsuario::Pendente`.
    - Na edição: Atualizar apenas os dados cadastrais mantendo a integridade de acesso.
    - Persistir na tabela `users` dentro de `DB::transaction()`.
    - Mapear os campos validados diretamente no `create()` / `update()` sem variáveis temporárias, sem ternários e sem conversões manuais de enum (`instanceof`/`from`), aproveitando os casts nativos do Eloquent (incluindo `'servicos' => 'array'`).

<!-- OPÇÃO COM ENVIO DE CONVITE POR E-MAIL (ATIVA NESTE EXEMPLO): -->
- **Efeitos Colaterais:**
    - No cadastro: Enviar convite de acesso por e-mail (`App\Mail\ConviteUsuarioMail`) usando fila (`ShouldQueue`) e `$this->afterCommit()`, contendo link temporário de acesso e credenciais provisórias. Na edição: não reenviar convite.

<!-- OPÇÃO SEM ENVIO DE E-MAIL (CASO NÃO PRECISE DE E-MAIL, COMENTE O BLOCO ACIMA E USE ESTE):
- **Efeitos Colaterais:**
    - Nenhum envio de e-mail necessário. Apenas criação/atualização direta no banco de dados.
-->
```

---

## ⚡ Opção 2: Backend para Cadastro via PÁGINA COMPLETA (mais de 8 campos)

Copie e envie o prompt abaixo quando a tela de cadastro for uma **Página Completa Contínua**:

### 🎯 Modelo Simples (Preencha os dados):
```markdown
/backend-cadastro [Nome da Entidade]

Use a skill @[skills/backend-cadastro-item] para implementar a funcionalidade completa de cadastro em página completa no backend com base no template canônico:

- **Entidade:** [Ex: Patrimônio / App\Models\Patrimonio]
- **Tabela:** [Ex: patrimonios]
- **Tipo de Cadastro:** Página Completa (mais de 8 campos)
- **Rotas:**
    - `GET /[rota]/cadastrar` -> `[rota].create` (exibe a página de formulário)
    - `POST /[rota]` -> `[rota].store` (persiste os dados)
- **Controller:** `App\Http\Controllers\[Entidade]Controller` (métodos `create` e `store`)
- **Action de Criação:** `App\Actions\Criar[Entidade]Action`
- **Form Request:** `App\Http\Requests\Salvar[Entidade]Request`
- **Policy:** `App\Policies\[Entidade]Policy@create`

- **Resposta HTTP do Controller:**
    - `create()` -> Renderiza a página Inertia: `Inertia::render('[rota]/cadastrar', [...])`
    - `store()` -> Redireciona para a listagem: `redirect()->route('[rota].index')`

- **Campos e Regras de Validação (Mesmos nomes da Página React):**
    - `[campo_1]`: string, obrigatório, max: 255, sanitizar com `trim()`
    - `[campo_2]`: string, obrigatório, único na tabela, sanitizar com `clean_digits`
    - `[campo_3]`: integer, obrigatório, exists:[tabela_relacionada],id
    - `status`: Enum tipado obrigatório (App\Enums\Status[Entidade])
    <!-- Adicione os demais campos do formulário longo -->

- **Processamento na Action:**
    - Persistir na tabela dentro de `DB::transaction()`.
    - Definir `status` exclusivamente através do Enum tipado (ZERO strings mágicas).
    - Mapear os campos validados diretamente no `create()` sem variáveis temporárias, sem ternários e sem conversões manuais de enum (`instanceof`/`from`), aproveitando os casts nativos do Eloquent.

<!-- OPÇÃO SEM ENVIO DE E-MAIL: -->
- **Efeitos Colaterais:**
    - Nenhum disparo de e-mail. Apenas persistência no banco de dados.

<!-- OPÇÃO COM ENVIO DE E-MAIL:
- **Efeitos Colaterais:**
    - Enviar e-mail de notificação (`App\Mail\[Nome]Mail`) usando fila (`ShouldQueue`) e `$this->afterCommit()`.
-->
```

### 🚀 Exemplo Preenchido (Patrimônio em Página Completa SEM E-mail):
```markdown
/backend-cadastro Patrimonio

Use a skill @[skills/backend-cadastro-item] para implementar a funcionalidade completa de cadastro de patrimônio no backend com base no template canônico:

- **Entidade:** Patrimônio (`App\Models\Patrimonio`)
- **Tabela:** `patrimonios`
- **Tipo de Cadastro:** Página Completa (mais de 8 campos - alinhado com `resources/js/pages/patrimonios/cadastrar.tsx`)
- **Rotas:**
    - `GET /patrimonios/cadastrar` -> `patrimonios.create`
    - `POST /patrimonios` -> `patrimonios.store`
- **Controller:** `App\Http\Controllers\PatrimonioController` (métodos `create` e `store`)
- **Action de Criação:** `App\Actions\CriarPatrimonioAction`
- **Form Request:** `App\Http\Requests\SalvarPatrimonioRequest`
- **Policy:** `App\Policies\PatrimonioPolicy@create`

- **Resposta HTTP do Controller:**
    - `create()` -> `Inertia::render('patrimonios/cadastrar', ['categorias' => Categoria::all()])`
    - `store()` -> `redirect()->route('patrimonios.index')`

- **Campos e Regras de Validação (Alinhados com a Página React):**
    - `descricao`: string, obrigatório, max: 255, sanitizar com `trim()`
    - `numero_tombamento`: string, obrigatório, único em patrimonios, sanitizar com `upper()` e `trim()`
    - `categoria_id`: integer, obrigatório, exists:categorias,id
    - `departamento_id`: integer, obrigatório, exists:departamentos,id
    - `fornecedor_id`: integer, nullable, exists:fornecedores,id
    - `valor_aquisicao`: decimal, opcional, sanitizar com helper `clean_moeda()`
    - `data_aquisicao`: date, obrigatório
    - `localizacao`: string, obrigatório, max: 255, sanitizar com `trim()`
    - `observacoes`: text, nullable, max: 1000
    - `status`: Enum tipado `App\Enums\StatusPatrimonio::Disponivel`

- **Processamento na Action:**
    - Persistir na tabela `patrimonios` dentro de `DB::transaction()`.
    - Definir `status` exclusivamente através do Enum tipado (sem strings mágicas).
    - Mapear os campos validados diretamente no `create()` sem variáveis temporárias, sem ternários e sem conversões manuais de enum (`instanceof`/`from`), aproveitando os casts nativos do Eloquent.

<!-- OPÇÃO SEM ENVIO DE E-MAIL (ATIVA NESTE EXEMPLO): -->
- **Efeitos Colaterais:**
    - Nenhum disparo de e-mail. Apenas persistência no banco de dados.

<!-- OPÇÃO COM ENVIO DE E-MAIL (CASO PRECISE NOTIFICAR POR E-MAIL):
- **Efeitos Colaterais:**
    - Enviar e-mail de notificação (`App\Mail\NovoPatrimonioMail`) usando fila (`ShouldQueue`) e `$this->afterCommit()`.
-->
```



