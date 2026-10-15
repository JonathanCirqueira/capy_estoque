---
name: backend-cadastro-item
description: "Passo a passo padronizado para implementação de criação/cadastro de recursos no backend Laravel com Inertia, seguindo strict types, Thin Controllers, FormRequests com Precognition e Actions transacionais."
allowed-tools: Read, Write, Edit
version: 1.1
priority: HIGH
---

# Backend: Cadastro de Recursos (Store / Create Flow)

> **MANDATÓRIO PARA CRIAÇÃO E PERSISTÊNCIA NO BACKEND:**
> Todo novo fluxo de cadastro no backend **DEVE** seguir estritamente as diretrizes de `app/backend-rules.md`, `laravel-best-practices` e os blueprints canônicos presentes na pasta `app/Templates/`.

---

## 📁 Arquivos de Referência do Template (`app/Templates/`)

Antes de gerar ou refatorar qualquer código de cadastro no backend, inspecione diretamente os arquivos de template:

1. **Controller Canônico:** `app/Templates/ControllerTemplate.php` (Seção `store()`)
2. **Action Canônica:** `app/Templates/ActionTemplate.php` (Padrão 1: `Salvar[Entidade]Action`)
3. **Form Request Canônico:** `app/Templates/RequestTemplate.php` (Cenário 3: Validação, Sanitização e Precognition)
4. **Policy Canônica (RBAC):** `app/Templates/PolicyTemplate.php` (Método `create()`)
5. **Enum Tipado:** `app/Templates/EnumTemplate.php` (Backed Enums com `options()` e `label()`)
6. **Mails Assíncronos:** `app/Templates/MailTemplate.php` (Caso o cadastro envie convite/notificação com `afterCommit()`)

---

## 🎯 Arquitetura e Regras de Ouro

| Camada | Arquivo de Destino | Responsabilidade Exclusiva | Template de Origem |
| :--- | :--- | :--- | :--- |
| **Enum Tipado** | `app/Enums/[Nome]Enum.php` | **ZERO STRINGS MÁGICAS**: Status, perfis, tipos e categorias devem ser Backed Enums com `options()` e `label()` | `app/Templates/EnumTemplate.php` |
| **Migration** | `database/migrations/...` | Criação/alteração de tabelas e colunas em português. Sem método `down()` para evitar acidentes de rollback | N/A |
| **Rota** | `routes/web.php` | Registro direto de POST/Resource sob middleware `auth`, `verified` | N/A |
| **Form Request** | `app/Http/Requests/Salvar[Entidade]Request.php` | 100% da validação, sanitização no `prepareForValidation()` com API Fluente, sem `authorize` redundante, Precognition | `app/Templates/RequestTemplate.php` |
| **Policy** | `app/Policies/[Entidade]Policy.php` | Regras de autorização RBAC e permissões no método `create()` | `app/Templates/PolicyTemplate.php` |
| **Action** | `app/Actions/Criar[Entidade]Action.php` | Único ponto de escrita no banco via `DB::transaction()`. Usa Enums para status/tipos. Retorna a Model | `app/Templates/ActionTemplate.php` |
| **Thin Controller** | `app/Http/Controllers/[Entidade]Controller.php` | Orquestra HTTP: `Gate::authorize`, invoca Action e redireciona (< 10 linhas) | `app/Templates/ControllerTemplate.php` |
| **Mailable (Opcional)**| `app/Mail/[Fluxo]Mail.php` | Envio em fila (`ShouldQueue`) com trava anti-race condition `$this->afterCommit()` | `app/Templates/MailTemplate.php` |

---

## 📋 Passo a Passo Canônico de Implementação

### Passo 1: Definir a Rota (`routes/web.php`)

Evite prefixos e rotas manuais desnecessárias. Use rota direta sob os middlewares padrão:

```php
use App\Http\Controllers\GestaoItemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/itens', [GestaoItemController::class, 'store'])->name('itens.store');
});
```

---

### Passo 2: Form Request com Precognition
> 📖 **Basear-se em:** `app/Templates/RequestTemplate.php` (Cenário 3)

- **Arquivo:** `app/Http/Requests/Salvar[Entidade]Request.php`
- **Validação:** 100% da validação aqui. O Controller e a Action confiam totalmente no Request validado.
- **Sem `authorize()` Redundante:** Como a autorização é realizada de forma centralizada pelo Controller via `Gate::authorize()`, não há necessidade de declarar `public function authorize(): bool { return true; }`.
- **Sanitização Obrigatória com API Fluente:** Feita exclusivamente no método `prepareForValidation()`. É PROIBIDO usar funções nativas soltas como `trim()` ou `mb_strtolower()`. Use OBRIGATORIAMENTE a API Fluente de Strings do Laravel (`$this->string('campo')->trim()->lower()->toString()`) e Helpers Globais (`clean_digits`, `clean_moeda`, `clean_placa`).
- **Nomenclatura Padrão do Sistema:** Nomenclatura estrita em português, snake_case e foreign keys no padrão `tabela_singular_id` (ex: `perfil_id`, `servico_ids`, `nome_completo`).
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
     * Sanitização e preparação de dados pré-validação com API fluente.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'nome' => $this->filled('nome')
                ? $this->string('nome')->trim()->toString()
                : $this->input('nome'),
            'codigo' => $this->filled('codigo')
                ? $this->string('codigo')->upper()->trim()->toString()
                : $this->input('codigo'),
            'valor' => $this->filled('valor')
                ? clean_moeda((string) $this->input('valor'))
                : null,
            'servico_ids' => is_array($this->input('servico_ids'))
                ? array_values(array_filter($this->input('servico_ids')))
                : $this->input('servico_ids'),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'codigo' => ['required', 'string', 'max:50', Rule::unique('itens', 'codigo')],
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
            'codigo' => 'Código de Identificação',
            'status' => 'Status do Item',
            'categoria_id' => 'Categoria',
            'valor' => 'Valor Estimado',
            'servico_ids' => 'Serviços Vinculados',
        ];
    }
}
```

---

### Passo 3: Action de Criação e Persistência
> 📖 **Basear-se em:** `app/Templates/ActionTemplate.php` (Padrão 1)

- **Arquivo:** `app/Actions/Criar[Entidade]Action.php`
- **Imutabilidade:** Sempre declarada como `final readonly class`.
- **Transação:** Toda persistência multitable ou de vínculos many-to-many é encapsulada em `DB::transaction()`.
- **ZERO STRINGS MÁGICAS (Enums Obrigatórios):** NUNCA insira strings cruas de status, perfis ou tipos (ex: `'pendente'`, `'ativo'`, `'ADMINISTRADOR'`) no código da Action. Toda constante de estado deve ser referenciada pelo seu Enum correspondente (ex: `StatusItem::Pendente` ou `StatusUsuario::Pendente`).
- **Respeito ao Schema Canônico (Single Source of Truth):** Siga estritamente as colunas canônicas da tabela e da Model (ex: na tabela padrão `users`, utiliza-se exclusivamente `name`, conforme Exceção 1 de `app/backend-rules.md`). Não duplique colunas nem crie campos redundantes.
- **Entrada:** Recebe `Collection<string, mixed>` oriunda do FormRequest.
- **Retorno:** Instância tipada da Model criada.
- **Disparo de Mails:** Caso envie convite ou e-mail, use `Mail::to(...)->send(...)` garantindo que o Mailable utilize `$this->afterCommit()`.

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

---

### Passo 4: Thin Controller
> 📖 **Basear-se em:** `app/Templates/ControllerTemplate.php` (Método `store()`)

- **Arquivo:** `app/Http/Controllers/[Entidade]Controller.php`
- **Constructor Promotion:** Injeta a Action no construtor via PHP 8.3 (`private readonly CriarItemAction $criarItemAction`).
- **Tamanho:** O método `store` deve ter **menos de 10 linhas**.
- **Apenas Orquestra:** Autoriza via Gate, executa a Action passando `collect($request->validated())` e redireciona.

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CriarItemAction;
use App\Http\Requests\SalvarItemRequest;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class GestaoItemController extends Controller
{
    public function __construct(
        private readonly CriarItemAction $criarItemAction,
    ) {}

    public function store(SalvarItemRequest $request): RedirectResponse
    {
        Gate::authorize('create', Item::class);

        $this->criarItemAction->execute(collect($request->validated()));

        return redirect()->back();
    }
}
```

---

### Passo 5: Policy de Segurança RBAC
> 📖 **Basear-se em:** `app/Templates/PolicyTemplate.php`

- **Arquivo:** `app/Policies/[Entidade]Policy.php`

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

final class ItemPolicy
{
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('itens.criar');
    }
}
```

---

### Passo 6 (Opcional): Disparo de E-mails / Convites
> 📖 **Basear-se em:** `app/Templates/MailTemplate.php`

- **Arquivo:** `app/Mail/[NomeDoFluxo]Mail.php`
- Implementa `ShouldQueue`.
- No construtor, invoca `$this->afterCommit();` para garantir entrega segura sem race conditions.

---

## 🛡️ Checklist de Verificação da Skill

Ao concluir uma implementação de cadastro backend, confirme:
- [ ] Rota direta sem prefixos redundantes em `routes/web.php`.
- [ ] **ZERO STRINGS MÁGICAS:** Status, perfis e tipos possuem Enum em `app/Enums/` (baseado em `app/Templates/EnumTemplate.php`) e foram usados como constante do Enum na Action e cast na Model.
- [ ] **Schema Canônico (Single Source of Truth):** Segue estritamente as colunas canônicas da tabela e da Model (ex: em `users`, usa-se apenas `name` sem redundância de colunas).
- [ ] Baseou-se no `app/Templates/RequestTemplate.php` com `prepareForValidation()` para limpeza de dados.
- [ ] Sem getters customizados no Request (`$request->getItem()` proibido).
- [ ] Baseou-se no `app/Templates/ActionTemplate.php` com `final readonly class` e `DB::transaction()`.
- [ ] Baseou-se no `app/Templates/ControllerTemplate.php` com menos de 10 linhas no método `store`.
- [ ] Baseou-se no `app/Templates/PolicyTemplate.php` com autorização via `Gate::authorize('create', ...)`.
- [ ] Se houver disparo de e-mail, seguiu o `app/Templates/MailTemplate.php` com `$this->afterCommit()`.
- [ ] Código formatado com `vendor/bin/pint --dirty --format agent` e verificado via `php artisan test --compact`.
