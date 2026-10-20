# Blueprint Canônico: Backend - Cadastro e Persistência (Store & Update)

> **Objetivo:** Padrão arquitetural agnóstico para criação, edição e persistência de recursos no Starter Kit Laravel 13 + Inertia v3.

---

## ⚡ Regras de Ouro Inegociáveis

1. **Actions Transacionais (`DB::transaction`):** Toda persistência ou alteração de dados no banco ocorre exclusivamente dentro de uma Action imutável (`final readonly class`) envolvida por transação.
2. **Form Request com Precognition:** Toda validação é isolada no FormRequest. O Controller e a Action confiam cegamente nos dados validados (`$request->validated()`).
3. **Sem Método `authorize()` Redundante:** A autorização pertence ao Controller através de `Gate::authorize(...)` ou Policy. Não declare `public function authorize(): bool { return true; }` no FormRequest.
4. **Sem Validações ou Conversões Redundantes na Action:** Nunca faça checagens manuais redundantes (`if ($data->has('...'))`), ternários desnecessários ou `instanceof BackedEnum ? ... : BackedEnum::from(...)`. O Eloquent já cuida do cast nativo do Enum via `casts(): array` na Model.
5. **Diferenciação Criação (POST) vs Edição (PUT/PATCH):**
   - Na edição, obrigatoriamente ignore o ID do registro atual com `Rule::unique('tabela', 'coluna')->ignore($id)`.
   - Campos condicionais (como senha) devem ser `required` na criação e `nullable` na edição.
6. **Thin Controller (< 10 linhas):** Os métodos `store` e `update` apenas invocam `Gate::authorize`, delegam para a Action e retornam `redirect()->back()` (ou `redirect()->route(...)`).
7. **Mails Assíncronos Resilientes:** Se o cadastro dispara e-mail ou convite, a classe Mailable DEVE implementar `ShouldQueue` e chamar `$this->afterCommit()` no construtor para evitar race condition antes do commit do banco.

---

## 📁 Estrutura de Arquivos do Módulo

| Camada | Arquivo Canônico | Responsabilidade |
| :--- | :--- | :--- |
| **Enum** | `app/Enums/[Nome]Enum.php` | Backed Enum tipado para status, perfis e categorias |
| **Form Request** | `app/Http/Requests/Salvar[Entidade]Request.php` | Validação, sanitização via `prepareForValidation()`, Precognition |
| **Action Criar** | `app/Actions/Criar[Entidade]Action.php` | Persistência transacional com `DB::transaction()` |
| **Action Atualizar** | `app/Actions/Atualizar[Entidade]Action.php` | Atualização transacional de campos ou relacionamentos |
| **Thin Controller** | `app/Http/Controllers/[Entidade]Controller.php` | Injeção das Actions no construtor, Gate e redirect |
| **Policy** | `app/Policies/[Entidade]Policy.php` | Autorização RBAC nos métodos `create()` e `update()` |
| **Mailable (Opcional)** | `app/Mail/[Fluxo]Mail.php` | Notificação assíncrona com `ShouldQueue` e `afterCommit()` |

---

## 🧩 Esqueletos Canônicos

### 1. Form Request com Suporte a Store e Update (`app/Http/Requests/Salvar[Entidade]Request.php`)

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\Status[Entidade];
use App\Models\[Entidade];
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class Salvar[Entidade]Request extends FormRequest
{
    public function rules(): array
    {
        // Recupera ID defensivamente para ignorar em regras unique na edição
        $entidadeRoute = $this->route('[entidade]') ?? $this->input('id');
        $entidadeId = $entidadeRoute instanceof [Entidade] ? $entidadeRoute->id : $entidadeRoute;
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch') || $entidadeId !== null;

        return [
            'nome' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique([Entidade]::class, 'email')->ignore($entidadeId),
            ],
            'status' => ['required', Rule::enum(Status[Entidade]::class)],
            'categoria_id' => ['required', 'integer', Rule::exists('categorias', 'id')],
            'senha' => [$isUpdate ? 'nullable' : 'required', 'string', 'min:8'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nome' => $this->filled('nome') ? $this->string('nome')->trim()->toString() : $this->input('nome'),
            'email' => $this->filled('email') ? $this->string('email')->trim()->lower()->toString() : $this->input('email'),
        ]);
    }

    public function attributes(): array
    {
        return [
            'nome' => 'nome completo',
            'email' => 'e-mail',
            'status' => 'status da entidade',
            'categoria_id' => 'categoria',
            'senha' => 'senha de acesso',
        ];
    }
}
```

---

### 2. Action de Criação (`app/Actions/Criar[Entidade]Action.php`)

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\[Entidade];
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final readonly class Criar[Entidade]Action
{
    /**
     * @param Collection<string, mixed> $dados
     */
    public function execute(Collection $dados): [Entidade]
    {
        return DB::transaction(static function () use ($dados): [Entidade] {
            /** @var [Entidade] $[entidade] */
            $[entidade] = [Entidade]::query()->create([
                'nome' => $dados->get('nome'),
                'email' => $dados->get('email'),
                'status' => $dados->get('status'), // Cast nativo do Eloquent
                'categoria_id' => $dados->get('categoria_id'),
                'password' => bcrypt((string) $dados->get('senha')),
            ]);

            // Se houver relacionamentos many-to-many:
            // if ($dados->has('tags')) {
            //     $[entidade]->tags()->sync($dados->get('tags'));
            // }

            return $[entidade];
        });
    }
}
```

---

### 3. Action de Atualização (`app/Actions/Atualizar[Entidade]Action.php`)

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\[Entidade];
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final readonly class Atualizar[Entidade]Action
{
    /**
     * @param Collection<string, mixed> $dados
     */
    public function execute([Entidade] $[entidade], Collection $dados): [Entidade]
    {
        return DB::transaction(static function () use ($[entidade], $dados): [Entidade] {
            $payload = [
                'nome' => $dados->get('nome'),
                'email' => $dados->get('email'),
                'status' => $dados->get('status'),
                'categoria_id' => $dados->get('categoria_id'),
            ];

            if ($dados->filled('senha')) {
                $payload['password'] = bcrypt((string) $dados->get('senha'));
            }

            $[entidade]->update($payload);

            return $[entidade]->refresh();
        });
    }
}
```

---

### 4. Thin Controller (`app/Http/Controllers/[Entidade]Controller.php`)

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Criar[Entidade]Action;
use App\Actions\Atualizar[Entidade]Action;
use App\Http\Requests\Salvar[Entidade]Request;
use App\Models\[Entidade];
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class [Entidade]Controller extends Controller
{
    public function __construct(
        private readonly Criar[Entidade]Action $criar[Entidade]Action,
        private readonly Atualizar[Entidade]Action $atualizar[Entidade]Action,
    ) {}

    public function store(Salvar[Entidade]Request $request): RedirectResponse
    {
        Gate::authorize('create', [Entidade]::class);

        $this->criar[Entidade]Action->execute(collect($request->validated()));

        return redirect()->back();
    }

    public function update(Salvar[Entidade]Request $request, [Entidade] $[entidade]): RedirectResponse
    {
        Gate::authorize('update', $[entidade]);

        $this->atualizar[Entidade]Action->execute($[entidade], collect($request->validated()));

        return redirect()->back();
    }
}
```

---

### 5. Policy RBAC (`app/Policies/[Entidade]Policy.php`)

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\[Entidade];
use App\Models\User;

final class [Entidade]Policy
{
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('[entidades].criar');
    }

    public function update(User $user, [Entidade] $[entidade]): bool
    {
        return $user->hasPermissionTo('[entidades].editar');
    }
}
```

---

### 6. Mailable Assíncrono com Trava Anti-Race Condition (`app/Mail/[Fluxo]Mail.php`)

```php
<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\[Entidade];
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class [Entidade]CriadoMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 5;
    /** @var array<int, int> */
    public array $backoff = [5, 10, 20];

    public function __construct(public readonly [Entidade] $[entidade])
    {
        // Garante que o e-mail só saia da fila APÓS o commit real do banco
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Novo Registro Criado no Sistema',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.[entidade]-criado',
        );
    }
}
```
