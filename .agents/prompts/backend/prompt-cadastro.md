# 📋 Prompts para Cadastro Backend (Criar e Salvar)

Use os modelos deste arquivo para solicitar a implementação completa da camada backend de cadastro (Store/Create) seguindo o padrão canônico do Starter Kit: **Thin Controller + Action Transacional + FormRequest com Precognition e Sanitização + Policy**.

---

## 🎯 Modelo Canônico (Copie, Preencha e Envie no Chat)

```markdown
/backend-cadastro [Nome da Entidade]

Use a skill @[skills/backend-cadastro-item] para implementar a funcionalidade completa de cadastro/criação no backend seguindo o padrão canônico do Starter Kit:

- **Entidade:** [Ex: Fornecedor / Produto / Cliente]
- **Tabela:** [Ex: fornecedores]
- **Rota:** [Ex: POST /fornecedores -> fornecedores.store]
- **Controller:** [Ex: App\Http\Controllers\FornecedorController@store]
- **Action de Criação:** [Ex: App\Actions\CriarFornecedorAction]
- **Form Request:** [Ex: App\Http\Requests\SalvarFornecedorRequest]
- **Policy:** [Ex: App\Policies\FornecedorPolicy@create]

- **Campos e Regras de Validação:**
    - [nome_campo_1]: [tipo, ex: string, obrigatório, max: 255, sanitizar trim]
    - [nome_campo_2]: [tipo, ex: string, cnpj/cpf, único na tabela, sanitizar clean_digits]
    - [valor]: [tipo, ex: moeda/decimal, opcional, sanitizar clean_moeda]
    - [status]: [tipo, enum: App\Enums\StatusFornecedor]
    - [categoria_id]: [tipo, foreignId, exists:categorias,id]
    - [relacionamento_ids]: [tipo, array de IDs muitos-para-muitos, sync na Action]

- **Efeitos Colaterais / Pós-persistência:**
    - [Ex: Enviar e-mail de confirmação ou disparar evento, se aplicável]
```

---

## 🚀 Exemplo 100% Conectado: Cadastro de Usuário / Convite

> 💡 **Integração Ponta a Ponta:** Este backend foi perfeitamente alinhado com o modal de cadastro gerado pela skill `@[skills/formulario-cadastro]` (em `resources/js/pages/usuarios/components/modal-cadastro-usuario.tsx`). Os nomes dos campos, tipos e retornos casam com precisão matemática.

```markdown
/backend-cadastro Usuario

Use a skill @[skills/backend-cadastro-item] para implementar a funcionalidade completa de cadastro/convite de usuário no backend com base no template canônico:

- **Entidade:** Usuário (`App\Models\User`)
- **Tabela:** `users`
- **Rota:** `POST /usuarios` -> `usuarios.store`
- **Controller:** `App\Http\Controllers\UsuarioController@store`
- **Action de Criação:** `App\Actions\CriarUsuarioAction`
- **Form Request:** `App\Http\Requests\SalvarUsuarioRequest`
- **Policy:** `App\Policies\UserPolicy@create`

- **Campos e Regras de Validação (Alinhados com o Modal React):**
    - `nome`: string, obrigatório, max: 255, mapeado para a coluna `name` de `users`, sanitizar com `trim()`
    - `email`: string, email, obrigatório, max: 255, único em `users`, sanitizar com `lower()` e `trim()`
    - `servicos`: array de strings ou IDs, opcional/nullable (onde `null` ou array vazio representa "Todos os Serviços" selecionados no MultiSelect). Se for relacionamento pivot, sincronizar na Action via `servicos()->sync()`
    - `nivelAcesso`: string/enum `ADMINISTRADOR`, `COMPRADOR` ou `USUARIO_PADRAO` (selecionado nos 3 cards do Selector), obrigatório

- **Processamento na Action:**
    - Gerar senha provisória criptografada segura se não fornecida.
    - Persistir na tabela `users` dentro de `DB::transaction()`.
    - Definir `status` através do Enum tipado `App\Enums\StatusUsuario::Pendente` (ZERO strings mágicas como 'pendente').
    - Sincronizar serviços vinculados (se aplicável).

- **Efeitos Colaterais:**
    - Enviar convite de acesso por e-mail (`App\Mail\ConviteUsuarioMail`) usando fila (`ShouldQueue`) e `$this->afterCommit()`, contendo link temporário de acesso e credenciais provisórias.

- **Resposta HTTP do Controller:**
    - Redirecionar com `redirect()->back()` para que o Inertia no frontend recarregue os dados via `router.reload({ only: ['usuarios'] })`.
```
