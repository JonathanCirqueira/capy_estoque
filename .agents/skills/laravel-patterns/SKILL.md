---
name: laravel-patterns
description: Laravel 13 architecture patterns, routing/controllers, Eloquent ORM, Action classes, queues, events, caching, and API resources for production apps. Use when building or reviewing Laravel apps — controllers, Eloquent, service/action layers, queues, or API resources.
metadata:
  origin: ECC
---

# Laravel Development Patterns

Production-grade Laravel 13 (PHP 8.3) architecture patterns for scalable, maintainable applications adhering to Starter Kit conventions.

## When to Use

- Building Laravel web applications with Inertia.js v3 or REST APIs.
- Structuring controllers, Action classes, and domain logic.
- Working with Eloquent models, relationships, and scopes.
- Designing APIs with Eloquent API Resources.
- Implementing background jobs, queues, events, and caching.

---

## Core Architecture Principles

1. **Clear Layer Boundaries**:
   - **Controllers**: Thin (< 10 lines per method), HTTP orchestration only.
   - **FormRequests**: Single source of truth for validation and input sanitization (`prepareForValidation`).
   - **Actions**: `final readonly class` with single public executor (`execute()` or `handle()`) wrapped in `DB::transaction()` for mutations.
   - **Models**: Explicit casts (`casts(): array`), relationships, and reusable scopes.
2. **Zero Strings Mágicas**: Always use PHP Backed Enums (`app/Enums/`) for statuses, types, roles, and categories.
3. **Raw Data Only**: Backend returns raw, unformatted data (monetary values in integer cents, ISO 8601 dates, booleans). Presentation formatting belongs exclusively to the frontend.
4. **Wayfinder Compatibility**: Use standard named routes (`name('users.index')`) and Eloquent route model binding.

---

## Recommended Project Structure

```
app/
├── Actions/            # Single-purpose transactional domain actions
├── Enums/              # PHP Backed Enums (Strict typing, no magic strings)
├── Events/             # Domain events for asynchronous side-effects
├── Http/
│   ├── Controllers/    # Thin HTTP controllers (< 10 lines per action)
│   ├── Middleware/
│   ├── Requests/       # Form requests (prepareForValidation, rules)
│   └── Resources/      # Eloquent API Resources
├── Jobs/               # Asynchronous queue jobs (ShouldQueue)
├── Models/             # Eloquent models with casts(): array and relations
├── Policies/           # Authorization policies
└── Providers/
database/
├── factories/          # Model factories for testing and seeding
├── migrations/         # Schema evolution (up() method only)
└── seeders/            # Database seeders
routes/
├── api.php
├── console.php
└── web.php             # Inertia & application web routes
```

---

## Architectural Patterns

### 1. Controllers -> Actions -> Models (Thin Controllers)

Keep controllers lean and focused on HTTP orchestration. Delegate business logic and mutations to transactional Action classes.

```php
declare(strict_types=1);

namespace App\Actions;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

final readonly class CreateOrderAction
{
    /**
     * @param array<string, mixed> $data
     */
    public function execute(array $data): Order
    {
        return DB::transaction(function () use ($data): Order {
            $order = Order::create([
                'customer_id' => $data['customer_id'],
                'status' => $data['status'],
                'total_cents' => $data['total_cents'],
            ]);

            // Side-effects or child creation
            return $order;
        });
    }
}
```

```php
declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateOrderAction;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class OrderController extends Controller
{
    public function store(StoreOrderRequest $request, CreateOrderAction $action): RedirectResponse
    {
        Gate::authorize('create', Order::class);

        $action->execute($request->validated());

        return to_route('orders.index')
            ->with('success', 'Pedido criado com sucesso.');
    }
}
```

---

### 2. FormRequests & Validation

- Normalização e limpeza de máscaras são feitas em `prepareForValidation()`.
- O método `authorize()` é omitido quando gerenciado por Gates/Policies de rota.
- Zero verificações redundantes no Controller ou Action após o FormRequest validar os dados.

```php
declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreOrderRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('total')) {
            // Converte valor monetário formatado para centavos inteiros antes da validação
            $this->merge([
                'total_cents' => (int) preg_replace('/\D/', '', (string) $this->input('total')),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'total_cents' => ['required', 'integer', 'min:0'],
        ];
    }
}
```

---

### 3. Eloquent Models: Casts Modernos & Enums

- Utilize o método `casts(): array` (padrão moderno Laravel 11/12/13).
- Utilize PHP Backed Enums para todos os campos com valores discretos.

```php
declare(strict_types=1);

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

final class Order extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'customer_id',
        'status',
        'total_cents',
    ];

    /**
     * @return array<string, string|class-string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'total_cents' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', OrderStatus::Pending);
    }
}
```

---

### 4. Consultas Otimizadas & Prevenção de N+1

- Sempre pré-carregue relacionamentos via `with(['relacao'])`.
- Na listagem com abas de status, reutilize a query base clonada para calcular contadores sem N+1:

```php
$queryBase = Order::query()
    ->with(['customer'])
    ->when($busca, fn ($q) => $q->where('id', 'like', "%{$busca}%"));

$totalTodos = (clone $queryBase)->count();
$totalPendentes = (clone $queryBase)->where('status', OrderStatus::Pending)->count();

$orders = (clone $queryBase)
    ->when($status, fn ($q) => $q->where('status', $status))
    ->latest('id')
    ->paginate(15);
```

---

### 5. Exportação de Grande Volume com Streaming

Para exportações CSV em listagens, mantenha consumo de memória constante $O(1)$ usando `$query->cursor()` com separador `;` e BOM UTF-8:

```php
use Symfony\Component\HttpFoundation\StreamedResponse;

public function export(): StreamedResponse
{
    return response()->streamDownload(function () {
        $handle = fopen('php://output', 'w');
        fputs($handle, "\xEF\xBB\xBF"); // UTF-8 BOM para Excel
        fputcsv($handle, ['ID', 'Cliente', 'Status', 'Total'], ';');

        Order::query()
            ->with(['customer'])
            ->cursor()
            ->each(function (Order $order) use ($handle) {
                fputcsv($handle, [
                    $order->id,
                    $order->customer?->name,
                    $order->status->value,
                    $order->total_cents,
                ], ';');
            });

        fclose($handle);
    }, 'pedidos.csv', [
        'Content-Type' => 'text/csv; charset=UTF-8',
    ]);
}
```

---

### 6. Migrations Canônicas

- Foco exclusivo na evolução da base: **apenas método `up()`**.
- O método `down()` deve ser omitido conforme regra do projeto.

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('status', 32)->index();
            $table->unsignedInteger('total_cents');
            $table->timestamps();
        });
    }
};
```

---

### 7. Jobs Assíncronos & Side-Effects

Para operações pesadas (envio de emails, integração com APIs externas, processamento de arquivos):
- Implemente `ShouldQueue`.
- Chame `$this->afterCommit()` no construtor para garantir que o job só rode após o commit da transação do banco de dados.

```php
declare(strict_types=1);

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class SendOrderConfirmationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order)
    {
        $this->afterCommit();
    }

    public function handle(): void
    {
        // Envio de email ou notificação
    }
}
```

---

## Verificação e Diagnóstico

Toda implementação baseada nestes padrões deve ser verificada programaticamente:

```bash
composer verify
```
