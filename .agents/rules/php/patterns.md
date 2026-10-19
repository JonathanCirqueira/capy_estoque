---
trigger: glob
globs: "{app,database,routes,tests}/**/*.php"
---

# PHP / Laravel Architectural Patterns

> Padrões arquiteturais obrigatórios no backend do Starter Kit: Thin Controllers, Action Classes transacionais, Form Requests e Eloquent Resources.

## Thin Controllers

Os Controllers devem atuar unicamente como orquestradores HTTP, mantendo métodos concisos (idealmente menos de 10 linhas):
1. Injetar o `FormRequest` tipado para autorização e validação.
2. Delegar a execução da regra de negócio para uma `Action` especializada.
3. Retornar a resposta HTTP (Inertia view, API Resource ou redirect).

```php
namespace App\Http\Controllers;

use App\Actions\Users\CreateUserAction;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Resources\UserResource;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    public function store(StoreUserRequest $request, CreateUserAction $createUser): Response
    {
        $user = $createUser->execute($request->validated());

        return to_route('users.show', $user)
            ->with('success', 'Usuário criado com sucesso.');
    }
}
```

## Single-Purpose Action Classes

Toda regra de negócio que altere estado, crie registros ou processe fluxos complexos deve residir em uma Action dedicada:
- Possui um único método público de entrada: `execute(...)` ou `__invoke(...)`.
- Transações atômicas com `DB::transaction()` sempre que envolver 2 ou mais operações no banco.
- Retorno tipado e tratamento de eventos.

```php
namespace App\Actions\Orders;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateOrderAction
{
    /**
     * @param array<string, mixed> $data
     */
    public function execute(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data): Order {
            $order = $user->orders()->create([
                'total_amount' => $data['total_amount'],
                'status' => $data['status'],
            ]);

            $order->items()->createMany($data['items']);

            return $order;
        });
    }
}
```

## Form Requests com Precognition

Toda validação e autorização de entrada deve residir em uma classe `FormRequest`:
- Nunca utilize `$request->validate()` inline em controllers.
- Use notação em array para regras: `['required', 'string', 'max:255']`.
- Sempre acesse dados exclusivamente através de `$request->validated()`.

```php
namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')],
            'role' => ['required', 'string'],
        ];
    }
}
```

## Prevenção de N+1 e Eager Loading

- Sempre carregue relações esperadas utilizando eager loading explícito: `Post::with('author', 'tags')->latest()->paginate()`.
- Use `loadMissing()` em instâncias existentes quando relações forem necessárias condicionalmente.
- Subqueries e agregados no banco devem seguir as diretrizes de `.agents/rules/php/advanced-queries.md`.

## Respostas Inertia e Resources

- Para rotas SPA Inertia: `Inertia::render('Users/Show', ['user' => UserResource::make($user)])`.
- Para endpoints API: retorne instâncias ou coleções de `JsonResource` (`UserResource::collection($users)`).
