---
name: backend-cadastro
description: "Passo a passo padronizado para implementação de criação/cadastro de recursos no backend Laravel com Inertia, seguindo strict types, Thin Controllers, FormRequests com Precognition, espelhamento de Enums em TypeScript e Actions transacionais."
allowed-tools: Read, Write, Edit
version: 1.2
priority: HIGH
---

# Backend: Cadastro de Recursos (Store / Create Flow)

> **MANDATÓRIO PARA CRIAÇÃO E PERSISTÊNCIA NO BACKEND:**
> Todo novo fluxo de cadastro no backend **DEVE** seguir estritamente as diretrizes de `app/backend-rules.md`, `laravel-best-practices` e os blueprints canônicos presentes na pasta `.agents/templates/backend/`.

---

## 📁 Arquivo de Referência do Template

Antes de gerar ou refatorar qualquer código de cadastro no backend, inspecione diretamente o blueprint canônico:

- **Blueprint Canônico de Cadastro Backend:** `.agents/templates/backend/cadastro.md`

---

## 🎯 Arquitetura e Regras de Ouro

| Camada | Arquivo de Destino | Responsabilidade Exclusiva | Blueprint de Origem |
| :--- | :--- | :--- | :--- |
| **Enum Tipado (Backend)** | `app/Enums/[Nome]Enum.php` | **ZERO STRINGS MÁGICAS**: Status, perfis, tipos e categorias devem ser Backed Enums com `options()` e `label()` | `.agents/templates/backend/cadastro.md` |
| **Enum Tipado (Frontend)** | `resources/js/pages/[modulo]/types.ts` ou `resources/js/types/` | **ESPELHAMENTO 1:1**: Enum TypeScript espelhado do backend, eliminando strings mágicas no React | N/A |
| **Migration** | `database/migrations/...` | Criação/alteração de tabelas e colunas em português. Sem método `down()` para evitar acidentes de rollback | N/A |
| **Rota** | `routes/web.php` | Registro direto de POST/Resource sob middleware `auth`, `verified` | N/A |
| **Form Request** | `app/Http/Requests/Salvar[Entidade]Request.php` | 100% da validação com `Rule::enum()`, sanitização no `prepareForValidation()` com API Fluente, sem `authorize` redundante, Precognition | `.agents/templates/backend/cadastro.md` |
| **Policy** | `app/Policies/[Entidade]Policy.php` | Regras de autorização RBAC e permissões no método `create()` | `.agents/templates/backend/cadastro.md` |
| **Action** | `app/Actions/Criar[Entidade]Action.php` | Único ponto de escrita no banco via `DB::transaction()`. Usa Enums para status/tipos. Retorna a Model | `.agents/templates/backend/cadastro.md` |
| **Thin Controller** | `app/Http/Controllers/[Entidade]Controller.php` | Orquestra HTTP: `Gate::authorize`, invoca Action e redireciona (< 10 linhas) | `.agents/templates/backend/cadastro.md` |
| **Mailable (Opcional)**| `app/Mail/[Fluxo]Mail.php` | Envio em fila (`ShouldQueue`) com trava anti-race condition `$this->afterCommit()` | `.agents/templates/backend/cadastro.md` |

---

## 📋 Passo a Passo Canônico de Implementação

### Passo 0: Inspeção Obrigatória do Banco Real e Schema First (MANDATÓRIO)

> ⚠️ **REGRA DE OURO - ZERO ALUCINAÇÕES DE BANCO:**
> Antes de criar ou alterar qualquer arquivo (Migration, FormRequest, Action, Controller ou Policy), **SEMPRE** inspecione:
> 1. O Model correspondente (`app/Models/[Entidade].php`) e seu método `casts()`.
> 2. As migrations existentes da tabela (`database/migrations/`).
> 3. Os Enums reais existentes em `app/Enums/`.

- **Mapeamento Direto do Schema Real:**
  - Se a tabela já existir, adeque os campos validados e atribuídos exatamente às colunas existentes e aos Enums reais do projeto.
  - Se o campo for armazenado diretamente como JSON (ex: `servicos` em `users`), atribua o valor diretamente no array de criação ou atualização da Model (graças ao cast `'servicos' => 'array'`), sem tentar chamar métodos inexistentes de relacionamento pivot como `->servicos()->sync()`.
  - Só crie novas migrations se a entidade ou coluna realmente não existir no banco.

- **Inspeção e Espelhamento de Enums Backend -> Frontend (TypeScript) (MANDATÓRIO):**
  - Inspecione todos os Enums em `app/Enums/` associados à entidade (ex: `StatusUsuario`, `NivelAcesso`, `StatusPatrimonio`).
  - **Espelhamento Obrigatório em TypeScript:** Todo Backed Enum PHP deve ter seu correspondente exato em TypeScript declarado em `resources/js/pages/[modulo]/types.ts` ou `resources/js/types/`:
    ```typescript
    export enum NivelAcesso {
        Administrador = 'ADMINISTRADOR',
        Comprador = 'COMPRADOR',
        UsuarioPadrao = 'USUARIO_PADRAO',
    }
    ```
  - **ZERO STRINGS MÁGICAS NO FRONTEND:** É terminantemente proibido o uso de unions literais cruas (ex: `'ADMINISTRADOR' | 'COMPRADOR'`) ou strings soltas em cards de `Selector`, opções de `Combobox`, `MultiSelect`, `StatusTabs` e no estado do `useForm`. O frontend deve importar e usar `NivelAcesso.Administrador`, `NivelAcesso.Comprador`, etc.
  - **Validação Pré-Envio no Cadastro:** No formulário de cadastro, a validação de cliente deve verificar a conformidade com o Enum via `Object.values(NomeEnum).includes(data.campo as NomeEnum)`, evitando envio de payloads corrompidos.
  - **Validação no Backend:** No FormRequest, valide com `Rule::enum(NomeEnum::class)`.
  - **Funções de Resolução:** Funções auxiliares (ex: `resolverNivelAcesso`) devem sempre ter tipagem estrita de retorno com o Enum TypeScript (`: NivelAcesso`).

---

### Passo 1: Migrations (PROIBIDO MÉTODO `down()`)
- **Regra Rígida do Projeto:** Todas as migrations criadas ou alteradas **NUNCA DEVEM CONTER O MÉTODO `down()`**.
- O método `down()` deve ser completamente omitido da classe da migration para evitar acidentes de rollback ou perda de dados.
- Estrutura obrigatória:
```php
<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('itens', function (Blueprint $table): void {
            $table->id();
            $table->string('nome');
            $table->timestamps();
        });
    }
};
```

---

### Passo 2: Definir as Rotas (`routes/web.php`)

Evite prefixos e rotas manuais desnecessárias. Use rota direta sob os middlewares padrão para criação (`POST`) e atualização (`PUT`):

```php
use App\Http\Controllers\GestaoItemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/itens', [GestaoItemController::class, 'store'])->name('itens.store');
    Route::put('/itens/{item}', [GestaoItemController::class, 'update'])->name('itens.update');
});
```

---

### Passo 3: Form Request com Precognition e Suporte a Criação vs Edição
> 📖 **Basear-se em:** `.agents/templates/backend/cadastro.md` (Seção FormRequest)

- **Arquivo:** `app/Http/Requests/Salvar[Entidade]Request.php`
- **Validação:** 100% da validação aqui. O Controller e a Action confiam totalmente no Request validado.
- **Sem `authorize()` Redundante:** Como a autorização é realizada de forma centralizada pelo Controller via `Gate::authorize()`, não há necessidade de declarar `public function authorize(): bool { return true; }`.
- **Diferenciação Crítica: Criação (POST) vs Edição (PUT/PATCH):**
  - **Campos Únicos (ex: `email`, `cpf`, `codigo`):** Na edição, OBRIGATORIAMENTE ignore o ID do registro atual via `Rule::unique('tabela', 'coluna')->ignore($id)`.
  - **Recuperação Segura do ID:** Recupere o ID da rota ou payload defensivamente:
    ```php
    /** @var Item|string|int|null $itemRoute */
    $itemRoute = $this->route('item') ?? $this->route('id') ?? $this->input('id');
    $itemId = $itemRoute instanceof Item ? $itemRoute->id : $itemRoute;
    ```
  - **Campos Opcionais ou Não-Alteráveis na Edição (ex: Senha):**
    - Na criação: Senha ou credencial provisória pode ser obrigatória ou gerada automaticamente.
    - Na edição: Senha deve ser `['nullable', 'string', 'min:8']`, nunca forçando redefinição quando o usuário apenas altera dados cadastrais.
- **Padronização Estrita de Nomes (Frontend = Backend):** Como o frontend e o backend convivem no mesmo projeto, os nomes dos campos no frontend (`useForm`, payload de envio) **DEVEM ser exatamente os mesmos do backend**. Nunca mantenha nomes divergentes (ex: `nomeCompleto` no front e `nome` no back). Se houver divergência, padronize no frontend para casar diretamente com o backend.
- **Proibição de Ternários Redundantes no `prepareForValidation()`:** Não faça verificações redundantes como `$this->filled('campo') ? ... : ...` ou mapeamentos alternativos. Faça a limpeza ou casting direto usando a API Fluente do Laravel (`$this->string('campo')->trim()->toString()`) ou `$this->boolean('campo')` diretamente dentro de `$this->merge([...])`.
- **Sanitização Limpa com API Fluente:** Feita no método `prepareForValidation()`. É PROIBIDO usar funções nativas soltas como `trim()` ou `mb_strtolower()`. Use OBRIGATORIAMENTE a API Fluente de Strings do Laravel (`$this->string('campo')->trim()->lower()->toString()`) ou `$this->boolean('campo')` e Helpers Globais (`clean_digits`, `clean_moeda`, `clean_placa`).
- **Nomenclatura Padrão do Sistema:** Nomenclatura estrita em português, snake_case e foreign keys no padrão `tabela_singular_id` (ex: `perfil_id`, `servico_ids`, `nome`).
- **PROIBIDO:** Não crie métodos getters auxiliares no Request (ex: `$request->getItem()`).

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\StatusItem;
use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SalvarItemRequest extends FormRequest
{
    /**
     * Prepara os dados do request para validação (sem ternários ou validações redundantes).
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'nome' => $this->string('nome')->trim()->toString(),
            'codigo' => $this->string('codigo')->upper()->trim()->toString(),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        /** @var Item|string|int|null $itemRoute */
        $itemRoute = $this->route('item') ?? $this->route('id') ?? $this->input('id');
        $itemId = $itemRoute instanceof Item ? $itemRoute->id : $itemRoute;

        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($itemId)],
            'codigo' => ['required', 'string', 'max:50', Rule::unique('itens', 'codigo')->ignore($itemId)],
            'status' => ['required', Rule::enum(StatusItem::class)],
            'categoria_id' => ['required', 'integer', Rule::exists('categorias', 'id')],
            'valor' => ['nullable', 'numeric', 'min:0'],
            'servico_ids' => ['nullable', 'array'],
            'servico_ids.*' => ['integer', Rule::exists('servicos', 'id')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'nome' => 'Nome do Item',
            'email' => 'E-mail',
            'codigo' => 'Código de Identificação',
            'status' => 'Status do Item',
            'categoria_id' => 'Categoria',
            'valor' => 'Valor Estimado',
            'servico_ids' => 'Serviços Vinculados',
        ];
    }

    /**
     * Mensagens customizadas de validação (para erros de unicidade e regras de negócio).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'Este e-mail já está cadastrado no sistema.',
            'codigo.unique' => 'Este código já está em uso por outro registro.',
        ];
    }
}
```

> ⚠️ **CONTRATO OBRIGATÓRIO DE INTEGRAÇÃO FRONTEND-BACKEND PARA ERROS:**
> - O frontend **NÃO DEVE** exibir toasts genéricos de erro como `toast.error('Ocorreu um erro')` quando houver resposta de validação do backend.
> - O callback `onError` do `useForm` ou `router.post`/`router.put` deve extrair a **primeira mensagem vinda do backend** e exibi-la no toast:
>   ```tsx
>   onError: (errs) => {
>       const primeiraMensagem = Object.values(errs)[0];
>       if (primeiraMensagem) {
>           toast.error(primeiraMensagem);
>       } else {
>           toast.error('Ocorreu um erro ao salvar o registro.');
>       }
>   }
>   ```
> - Assim, mensagens como "Este e-mail já está cadastrado no sistema." originadas no FormRequest do backend são mostradas de forma fluida, consistente e humana no toast e logo abaixo do input com `errors.email`.
> - **Contraste e Cores do Toast de Notificação:**
>   - O texto do toast deve respeitar rigorosamente o tema do sistema com alto contraste legível.
>   - **NUNCA** utilize texto branco sobre fundos claros/pasteis de alerta no Light Mode. O Toaster (`@/components/ui/sonner`) utiliza `text-destructive` (ou tokens de alta saturação/contraste no light mode) e tokens luminosos adequados no dark mode para que a mensagem superior nunca fique apagada ou ilegível.

---

### Passo 4: Actions de Criação e Atualização
> 📖 **Basear-se em:** `.agents/templates/backend/cadastro.md` (Seção Action)

- **Arquivos:**
  - `app/Actions/Criar[Entidade]Action.php`
  - `app/Actions/Atualizar[Entidade]Action.php`
- **Imutabilidade:** Sempre declaradas como `final readonly class`.
- **Transação:** Toda persistência multitable ou de vínculos many-to-many é encapsulada em `DB::transaction()`.
- **ZERO STRINGS MÁGICAS (Enums Obrigatórios):** NUNCA insira strings cruas de status, perfis ou tipos (ex: `'pendente'`, `'ativo'`, `'ADMINISTRADOR'`) no código da Action. Toda constante de estado deve ser referenciada pelo seu Enum correspondente (ex: `StatusItem::Pendente` ou `StatusUsuario::Pendente`).
- **Respeito ao Schema Canônico (Single Source of Truth):** Siga estritamente as colunas canônicas da tabela e da Model (ex: na tabela padrão `users`, utiliza-se exclusivamente `name`, conforme Exceção 1 de `app/backend-rules.md`). Não duplique colunas nem crie campos redundantes.
- **Entrada:** Recebe `Collection<string, mixed>` oriunda do FormRequest (e a Model alvo no caso da atualização).
- **Confiança Total no FormRequest (Anti-Overengineering):** A Action confia 100% nos dados recebidos do FormRequest validado. É terminantemente PROIBIDO fazer revalidações, ternários de checagem ou `isset`/`empty` para campos já validados.
- **Proibição de Conversões Redundantes de Enums:** NUNCA faça `instanceof BackedEnum ? $val : BackedEnum::from((string) $val)`. Como a Model já possui o cast tipado declarado em `casts()` (`'coluna' => Enum::class`), o Eloquent aceita tanto a string validada pelo FormRequest quanto a instância do Enum diretamente.
- **Código Direto (Sem Variáveis Temporárias Inúteis):** Não crie variáveis temporárias redundantes (ex: `$nome = $dados->get('nome');`). Mapeie os atributos diretamente no `create([ 'name' => $dados->get('nome') ])` ou `update([ ... ])`.
- **Retorno:** Instância tipada da Model criada ou atualizada.
- **Disparo de Mails e Efeitos Colaterais:**
  - Na **Criação**: Caso envie convite ou e-mail de boas-vindas, use `Mail::to(...)->send(...)` garantindo que o Mailable utilize `$this->afterCommit()`.
  - Na **Atualização**: NÃO reenvie convites de cadastro nem regere credenciais provisórias a não ser que explicitamente solicitado.

#### Exemplo: `CriarItemAction.php`
```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\StatusItem;
use App\Models\Item;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final readonly class CriarItemAction
{
    /**
     * Cria um novo item com seus vínculos no banco de dados.
     *
     * @param  Collection<string, mixed>  $dados
     */
    public function execute(Collection $dados): Item
    {
        return DB::transaction(function () use ($dados): Item {
            /** @var Item $item */
            $item = Item::query()->create([
                'nome' => $dados->get('nome'),
                'codigo' => $dados->get('codigo'),
                'status' => StatusItem::Pendente, // ZERO STRINGS MÁGICAS: sempre use Enum tipado!
                'categoria_id' => $dados->get('categoria_id'),
                'valor' => $dados->get('valor'),
            ]);

            /** @var array<int>|null $servicoIds */
            $servicoIds = $dados->get('servico_ids');
            if (! empty($servicoIds)) {
                $item->servicos()->sync($servicoIds);
            }

            return $item;
        });
    }
}
```

#### Exemplo: `AtualizarItemAction.php`
```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Item;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final readonly class AtualizarItemAction
{
    /**
     * Atualiza os dados de um item existente no banco de dados.
     *
     * @param  Collection<string, mixed>  $dados
     */
    public function execute(Item $item, Collection $dados): Item
    {
        return DB::transaction(function () use ($item, $dados): Item {
            $item->update([
                'nome' => $dados->get('nome'),
                'codigo' => $dados->get('codigo'),
                'categoria_id' => $dados->get('categoria_id'),
                'valor' => $dados->get('valor'),
            ]);

            /** @var array<int>|null $servicoIds */
            $servicoIds = $dados->get('servico_ids');
            if ($servicoIds !== null) {
                $item->servicos()->sync($servicoIds);
            }

            return $item;
        });
    }
}
```

---

### Passo 5: Thin Controller
> 📖 **Basear-se em:** `.agents/templates/backend/cadastro.md` (Seção Thin Controller)

- **Arquivo:** `app/Http/Controllers/[Entidade]Controller.php`
- **Constructor Promotion:** Injeta as Actions no construtor via PHP 8.3 (`private readonly CriarItemAction $criarItemAction`, `private readonly AtualizarItemAction $atualizarItemAction`).
- **Tamanho:** Tanto o método `store` quanto o `update` devem ter **menos de 10 linhas cada**.
- **Apenas Orquestra:** Autoriza via Gate, executa a Action passando `collect($request->validated())` e redireciona.

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\AtualizarItemAction;
use App\Actions\CriarItemAction;
use App\Http\Requests\SalvarItemRequest;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class GestaoItemController extends Controller
{
    public function __construct(
        private readonly CriarItemAction $criarItemAction,
        private readonly AtualizarItemAction $atualizarItemAction,
    ) {}

    public function store(SalvarItemRequest $request): RedirectResponse
    {
        Gate::authorize('create', Item::class);

        $this->criarItemAction->execute(collect($request->validated()));

        return redirect()->back();
    }

    public function update(SalvarItemRequest $request, Item $item): RedirectResponse
    {
        Gate::authorize('update', $item);

        $this->atualizarItemAction->execute($item, collect($request->validated()));

        return redirect()->back();
    }
}
```

---

### Passo 6: Policy de Segurança RBAC
> 📖 **Basear-se em:** `.agents/templates/backend/cadastro.md` (Seção Policy)

- **Arquivo:** `app/Policies/[Entidade]Policy.php`

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Item;
use App\Models\User;

final class ItemPolicy
{
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('itens.criar');
    }

    public function update(User $user, Item $item): bool
    {
        return $user->hasPermissionTo('itens.editar');
    }
}
```

---

### Passo 7: Efeitos Colaterais (Disparo de E-mails / Convites - Opcional)
> 📖 **Basear-se em:** `.agents/templates/backend/cadastro.md` (Seção Mailable Assíncrono)

- **Arquivo:** `app/Mail/[NomeDoFluxo]Mail.php`
- Implementa `ShouldQueue` com `$tries`, `$backoff` e timeouts adequados.
- No construtor, invoca OBRIGATORIAMENTE `$this->afterCommit();` para garantir que o job de e-mail só seja postado na fila após o commit real do banco de dados (`DB::transaction`).
- **Quando NÃO houver envio de e-mail:** Não crie Mailable e omita o disparo via `Mail::to()` na Action. O fluxo segue exclusivamente a persistência no banco de dados.

---

## 📝 Modelo Canônico de Prompt para Acionamento da Skill

Ao solicitar a implementação do cadastro backend via prompt, siga as 2 decisões arquiteturais simples:

| Decisão | Opção | Impacto no Backend |
| :--- | :--- | :--- |
| **1. Interface** | **Modal (`<= 8` campos)** | `redirect()->back()` (fecha o modal e recarrega dados com `router.reload({ only: ['...'] })`). |
| | **Página Completa (`> 8` campos)** | Rota `create` (GET) e `store`/`update` com `redirect()->route('[rota].index')`. |
| **2. Envio de E-mail** | **Com Convite / E-mail** | Dispara Mailable com fila assíncrona (`ShouldQueue`) e `$this->afterCommit()`. |
| | **Sem E-mail** | Persistência pura no banco dentro de `DB::transaction()`. |

```markdown
Use a skill @[skills/backend-cadastro] para implementar o cadastro no backend:

- **Entidade:** [Ex: Fornecedor / App\Models\Fornecedor]
- **Tabela:** [Ex: fornecedores]
- **Rotas:** 
    - POST /[rota] -> [rota].store
    - PUT /[rota]/{[entidade]} -> [rota].update
- **Controller:** App\Http\Controllers\[Entidade]Controller (store e update)
- **Actions:** 
    - App\Actions\Criar[Entidade]Action
    - App\Actions\Atualizar[Entidade]Action
- **Form Request:** App\Http\Requests\Salvar[Entidade]Request
- **Policy:** App\Policies\[Entidade]Policy (create e update)

### 1. Formato da Interface (Escolha UMA opção):
- **Interface:** Modal (Dialog - até 8 campos) -> Resposta: redirect()->back()
<!-- OU -->
<!-- - **Interface:** Página Completa (> 8 campos) -> GET /[rota]/cadastrar e Resposta: redirect()->route('[rota].index') -->

### 2. Campos e Regras (Mesmos nomes do Frontend):
- `nome`: string, obrigatório, max: 255, sanitizar trim
- `email`: string, email, obrigatório, único na tabela ignorando o ID atual (Rule::unique()->ignore($id)), sanitizar lower e trim
- `status`: Enum tipado App\Enums\Status[Entidade]::Ativo (ZERO strings mágicas)
- `categoria_id`: foreignId, exists:categorias,id
- `servicos`: array opcional de IDs, sync na Action

### 3. Notificação por E-mail (Escolha UMA opção):
- **E-mail:** Enviar App\Mail\Convite[Entidade]Mail com fila (ShouldQueue) e afterCommit() no cadastro
<!-- OU -->
<!-- - **E-mail:** Não enviar. Apenas salvar no banco via DB::transaction(). -->
```

---

## 🛡️ Checklist de Verificação da Skill

Ao concluir uma implementação de cadastro backend, confirme:
- [ ] Tipo de interface respeitado: **Modal (`<= 8` campos)** responde com `redirect()->back()`; **Página Completa (`> 8` campos)** responde com `redirect()->route('...')` e possui método/rota `create` se aplicável.
- [ ] **Fluxo de Edição / Atualização (PUT/PATCH):** Rotas `POST` e `PUT` definidas, FormRequest ignora o ID do registro atual em regras `Rule::unique()->ignore($id)`, e regras sensíveis a criação (como senha) são ajustadas condicionalmente.
- [ ] Se o caso de uso requereu e-mail: implementou `ShouldQueue` com `$this->afterCommit()`. Se NÃO requereu: Action limpa sem chamadas de Mail.
- [ ] Rotas diretas sem prefixos redundantes em `routes/web.php`.
- [ ] **ZERO STRINGS MÁGICAS & ESPELHAMENTO DE ENUMS (BACKEND -> FRONTEND):** Status, perfis e tipos possuem Enum em `app/Enums/` (baseado em `.agents/templates/backend/cadastro.md`), validados via `Rule::enum()` e espelhados como TypeScript `enum` no frontend (`types.ts`), eliminando strings mágicas no `useForm`, seletores e validações.
- [ ] **Schema Canônico (Single Source of Truth):** Segue estritamente as colunas canônicas da tabela e da Model (ex: em `users`, usa-se apenas `name` sem redundância de colunas).
- [ ] Baseou-se no `.agents/templates/backend/cadastro.md` com `prepareForValidation()` para limpeza de dados direta sem ternários e recuperação segura do ID para regras `Rule::unique()->ignore(...)`.
- [ ] Sem getters customizados no Request (`$request->getItem()` proibido).
- [ ] Baseou-se no `.agents/templates/backend/cadastro.md` com `final readonly class` e `DB::transaction()` para `Criar[Entidade]Action` e `Atualizar[Entidade]Action`.
- [ ] **Sem Validações ou Conversões Redundantes na Action:** Action mapeia diretamente `$dados->get('campo')` sem ternários, sem `instanceof BackedEnum ? ... : BackedEnum::from(...)` e sem variáveis temporárias desnecessárias, confiando no FormRequest e nos casts nativos do Eloquent.
- [ ] Baseou-se no `.agents/templates/backend/cadastro.md` com menos de 10 linhas nos métodos `store` e `update`.
- [ ] Baseou-se no `.agents/templates/backend/cadastro.md` com autorização via `Gate::authorize('create', ...)` e `Gate::authorize('update', ...)`.
- [ ] Código formatado com `vendor/bin/pint --dirty --format agent` e verificado via `php artisan test --compact`.


