---
name: laravel-patterns
description: Padrões de arquitetura do Laravel 13, rotas/controllers, Eloquent ORM, Action classes, filas, eventos, cache e API resources para aplicações de produção. Use ao criar ou revisar código Laravel — controllers, Eloquent, camadas de actions, filas ou resources de API.
metadata:
  origin: ECC
---

# Padrões de Desenvolvimento Laravel 13

Padrões de arquitetura prontos para produção em **Laravel 13 (PHP 8.3)** para aplicações escaláveis, sustentáveis e aderentes às convenções do Starter Kit.

## Quando Usar

- Construção de aplicações web Laravel com Inertia.js v3 ou APIs REST.
- Estruturação de controllers, classes de Action e lógica de domínio.
- Modelagem de dados com Eloquent, relacionamentos e escopos (`scopes`).
- Criação de APIs com Eloquent API Resources.
- Implementação de jobs em segundo plano, filas, eventos e estratégias de cache.

---

## Princípios Fundamentais de Arquitetura

1. **Fronteiras Claras entre Camadas**:
   - **Controllers**: Enxutos (< 10 linhas por método), focados apenas na orquestração HTTP.
   - **FormRequests**: Única fonte de verdade para validação e sanitização de dados de entrada (`prepareForValidation`).
   - **Actions**: Declaradas como `final readonly class` com único método executor público (`execute()` ou `handle()`), encapsuladas em `DB::transaction()` para mutações.
   - **Models**: Casts explícitos (`casts(): array`), relacionamentos tipados e escopos reutilizáveis.
2. **Zero Strings Mágicas**: Uso obrigatório de PHP Backed Enums (`app/Enums/`) para status, tipos, perfis e categorias.
3. **Raw Data Only (Apenas Dados Brutos)**: O backend retorna exclusivamente dados brutos e sem formatação de apresentação (valores monetários em centavos inteiros, datas no formato ISO 8601, booleanos). A formatação de exibição é responsabilidade exclusiva do frontend.
4. **Compatibilidade com Wayfinder**: Uso de rotas nomeadas padronizadas (`name('users.index')`) e Route Model Binding do Eloquent.

---

## Estrutura Recomendada do Projeto

```
app/
├── Actions/            # Ações de domínio transacionais de propósito único
├── Enums/              # PHP Backed Enums (Tipagem estrita, sem strings mágicas)
├── Events/             # Eventos de domínio para efeitos colaterais assíncronos
├── Http/
│   ├── Controllers/    # Controllers HTTP enxutos (< 10 linhas por ação)
│   ├── Middleware/
│   ├── Requests/       # Form requests (prepareForValidation, rules)
│   └── Resources/      # Eloquent API Resources
├── Jobs/               # Processamento em fila assíncrona (ShouldQueue)
├── Models/             # Models Eloquent com casts(): array e relacionamentos
├── Policies/           # Políticas de autorização
└── Providers/
database/
├── factories/          # Model factories para testes e seeders
├── migrations/         # Evolução do schema (apenas método up())
└── seeders/            # Seeders do banco de dados
routes/
├── api.php
├── console.php
└── web.php             # Rotas web da aplicação e Inertia
```

---

## Padrões Arquiteturais

### 1. Controllers -> Actions -> Models (Thin Controllers)

Mantenha controllers enxutos e dedicados apenas à orquestração HTTP. Delegue regras de negócio e mutações no banco de dados para classes de Action transacionais.

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

            // Efeitos colaterais ou criação de itens filhos
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

### 2. FormRequests & Validação

- A normalização e limpeza de máscaras são feitas no método `prepareForValidation()`.
- O método `authorize()` é omitido quando a autorização é gerenciada por Gates/Policies de rota.
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

### 3. Models Eloquent: Casts Modernos & Enums

- Utilize o método `casts(): array` (padrão moderno do Laravel).
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
- Na listagem com abas de status, reutilize a query base clonada para calcular contadores sem incorrer em N+1:

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

### 7. Jobs Assíncronos & Efeitos Colaterais

Para operações pesadas (envio de emails, integração com APIs externas, processamento de arquivos):
- Implemente a interface `ShouldQueue`.
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
