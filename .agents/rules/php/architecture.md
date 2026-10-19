---
trigger: glob
globs: "{app,database,routes}/**/*.php"
---

# 🏛️ Diretrizes de Arquitetura Backend (Laravel 13 & PHP 8.3)

Padrões arquiteturais mandatórios para consistência, manutenibilidade, segurança e performance no backend.

---

## 1. Actions (`app/Actions/{Domain}`)

Toda regra de negócio e operação de escrita DEVE seguir o padrão Action. Controllers, Jobs e Comandos apenas orquestram chamadas para Actions.

- **Nomenclatura & Estrutura:** `app/Actions/{Domain}/{Nome}Action.php` (`final readonly class`).
- **Propósito Único:** Uma Action por caso de uso (`Single-Purpose Action`).
- **Injeção:** Exclusiva pelo construtor com *Property Promotion*. Proibido `app(...)` ou `resolve(...)`.
- **Invocação:** Ponto de entrada único via `__invoke()`. Chame diretamente: `$action($payload)`.
- **Contrato de Retorno:** Retorne exclusivamente dados de domínio (Model, DTO tipado ou Collection). **NUNCA** retorne respostas HTTP (`redirect`, `response`, `view`, `Inertia::render`) ou arrays soltos.
- **Transações:** Mutações e efeitos colaterais envolvidos em `DB::transaction()`.
- **Anti-patterns:** Proibido *Pass-through Actions* vazias, validações imperativas ou `Validator::make()` inline.

```php
declare(strict_types=1);

namespace App\Actions\Pedidos;

use App\Dto\Pedidos\CriarPedidoData;
use App\Models\Pedido;
use App\Services\EstoqueService;
use Illuminate\Support\Facades\DB;

final readonly class CriarPedidoAction
{
    public function __construct(private EstoqueService $estoqueService) {}

    public function __invoke(CriarPedidoData $dados): Pedido
    {
        return DB::transaction(function () use ($dados): Pedido {
            $pedido = Pedido::query()->create([
                'cliente_id' => $dados->clienteId,
                'total_centavos' => $dados->totalCentavos,
                'status' => $dados->status,
            ]);

            $this->estoqueService->reservarItens($pedido, $dados->itens);

            return $pedido;
        });
    }
}
```

---

## 2. Controllers (`app/Http/Controllers`)

Controllers são estritamente *Thin Controllers* (< 10 linhas por método). Apenas recebem a requisição, delegam para uma Action e retornam a resposta.

- **Resource Controllers:** Exclusivamente os 7 métodos CRUD canônicos (`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`). Proibido adicionar métodos customizados/não-CRUD.
- **Single-Action Controllers:** Endpoints fora do CRUD usam controllers invokable com `__invoke()`, nomeados após a ação (ex: `ExportarRelatorioController`).
- **Tratamento de Exceções:** Falhas de domínio esperadas retornam status HTTP semântico (`422`, `409`, `404`). NUNCA use `catch (\Throwable)` engolindo erros; bugs reais devem subir ao log (500).

```php
declare(strict_types=1);

namespace App\Http\Controllers\Pedidos;

use App\Actions\Pedidos\CriarPedidoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pedidos\StorePedidoRequest;
use Illuminate\Http\RedirectResponse;

final class PedidoController extends Controller
{
    public function __construct(private readonly CriarPedidoAction $criarPedidoAction) {}

    public function store(StorePedidoRequest $request): RedirectResponse
    {
        $pedido = ($this->criarPedidoAction)($request->toDto());

        return redirect()->route('pedidos.show', $pedido);
    }
}
```

---

## 3. Form Requests (`app/Http/Requests/{Domain}`)

Toda entrada consumida pelo controller deve ser tipada por um FormRequest dedicado em `app/Http/Requests/{Domain}/{Nome}Request.php`.

- **Um por Formato:** Um FormRequest dedicado por shape de requisição. Proibido compartilhar o mesmo Request entre verbos divergentes ou ramificar regras por `$this->method()`.
- **Mapeamento para DTO (`toDto()`):** Encapsule a conversão para DTO tipado no próprio FormRequest via `toDto(): MeuData`. O controller apenas chama `$request->toDto()`.
- **Sem `authorize()` desnecessário:** Se a autorização for pública ou tratada por middlewares/policies de rota, use simplesmente `return true;`.
- **Acesso Estrito:** Use sempre `$request->validated()` ou `$request->toDto()`. Proibido `$request->all()`.

```php
declare(strict_types=1);

namespace App\Http\Requests\Pedidos;

use App\Dto\Pedidos\CriarPedidoData;
use App\Enums\StatusPedido;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StorePedidoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'cliente_id' => ['required', 'integer', Rule::exists('clientes', 'id')],
            'total_centavos' => ['required', 'integer', 'min:1'],
            'itens' => ['required', 'array', 'min:1'],
        ];
    }

    public function toDto(): CriarPedidoData
    {
        return CriarPedidoData::fromArray([
            ...$this->validated(),
            'status' => StatusPedido::Pendente,
        ]);
    }
}
```

---

## 4. Models do Eloquent (`app/Models`)

Models contêm apenas métodos de domínio autossuficientes (predicados como `isPago()`, cálculos locais, relacionamentos e scopes). Sem orquestração complexa ou chamadas externas.

- **Casts Tipados Modernos:** Declare via método `protected function casts(): array` para Enums, datas imutáveis e tipos primitivos.
- **Mass Assignment:** Sempre use `$guarded = ['id'];` ou `$fillable`, e oculte dados sensíveis com `$hidden`.
- **Convenções:** Nomes no plural `snake_case`, PK `id`, FK `tabela_singular_id`. Sem propriedades redundantes.
- **Geração Completa:** Crie sempre models com migration, factory e seeder (`php artisan make:model -mfs`).

```php
declare(strict_types=1);

namespace App\Models;

use App\Enums\StatusPedido;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Pedido extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => StatusPedido::class,
            'total_centavos' => 'integer',
            'pago_em' => 'immutable_datetime',
        ];
    }

    public function cliente(): BelongsTo { return $this->belongsTo(Cliente::class); }
    public function isPendente(): bool { return $this->status === StatusPedido::Pendente; }
}
```

---

## 5. Enums & DTOs

### 5.1 Enums Tipados (`app/Enums`)
- Backed Enums (`string` ou `int`) do PHP 8.3 com casos em `TitleCase` (ex: `StatusPedido::Pendente`).
- Centralize métodos de apresentação (`label()`, `cor()`) no próprio Enum e espelhe no TypeScript.

### 5.2 Data Transfer Objects (`app/Dto/{Domain}`)
- Classes `final readonly` em `app/Dto/{Domain}/{Nome}Data.php` com propriedades promovidas.
- Use named constructors (`fromArray()`, `fromRequest()`). Proibido trafegar arrays associativos soltos entre camadas.

```php
declare(strict_types=1);

namespace App\Dto\Pedidos;

use App\Enums\StatusPedido;

final readonly class CriarPedidoData
{
    public function __construct(
        public int $clienteId,
        public int $totalCentavos,
        public StatusPedido $status,
        public array $itens,
    ) {}

    public static function fromArray(array $dados): self
    {
        return new self(
            clienteId: (int) $dados['cliente_id'],
            totalCentavos: (int) $dados['total_centavos'],
            status: $dados['status'] instanceof StatusPedido ? $dados['status'] : StatusPedido::from($dados['status']),
            itens: (array) ($dados['itens'] ?? []),
        );
    }
}
```

---

## 6. Eloquent API Resources (`app/Http/Resources/{Domain}`)

NUNCA retorne models Eloquent brutos diretamente em respostas HTTP ou serializados para o Inertia.

- Protege contra vazamento de atributos internos e garante contrato estável com o frontend.
- Tipagem explícita no método `toArray(Request $request): array`.

```php
declare(strict_types=1);

namespace App\Http\Resources\Pedidos;

use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Pedido */
final class PedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'total_centavos' => $this->total_centavos,
            'status' => $this->status->value,
            'criado_em' => $this->created_at?->toIso8601String(),
        ];
    }
}
```

---

## 7. Migrations (`database/migrations`)

- **Apenas `up()`:** Foque na evolução do schema em `up()`. O método `down()` é dispensado.
- **Integridade:** Chaves estrangeiras com `$table->foreignId('...')->constrained()->cascadeOnDelete()`.
- **Indexação Mandatória:** Adicione índices em colunas frequentemente filtradas ou ordenadas (`$table->index(...)`).
- **Imutabilidade:** Migrations já executadas em produção são imutáveis. Alterações exigem novas migrations aditivas.

---

## 8. Padrões de Classes, Injeção e Performance

- **Strict Types:** `declare(strict_types=1);` obrigatório em todo arquivo PHP.
- **Constructor Injection:** Injeção obrigatória via *Property Promotion*. Proibido `app(...)` ou `resolve(...)` nos métodos.
- **Interfaces em Fronteiras:** Provedores de pagamento e storage devem usar interfaces para mocks e desacoplamento.
- **Zero N+1:** Proibido queries em loop (`foreach`). Use operações em lote (`upsert`, `insert`, `whereIn`).
- **Concorrência & Tarefas:** Use `Cache::lock()` para travas atômicas, `defer()` para tarefas pós-resposta e `Concurrency::run()` para tarefas paralelas.
