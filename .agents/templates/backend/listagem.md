# Blueprint Canônico: Backend - Listagem, Filtros e Consultas

> **Objetivo:** Padrão arquitetural agnóstico para listagens, filtros reativos, contadores de abas, paginação e exportação em lote no Starter Kit Laravel 13 + Inertia v3.

---

## ⚡ Regras de Ouro Inegociáveis

1. **Schema First (Zero Alucinações):** Inspecione sempre a Model (`app/Models/[Entidade].php`), colunas da migration e Enums reais antes de montar a query.
2. **Zero Strings Mágicas:** Status, perfis, tipos e categorias devem ser Backed Enums (`string` ou `int`) em `app/Enums/`. Use `StatusEnum::Ativo->value` ou `StatusEnum::Ativo` diretamente.
3. **Raw Data Only:** O backend entrega dados brutos (centavos, ISO dates, booleans). Formatação de apresentação pertence exclusivamente ao frontend React.
4. **Anti-N+1 Estrito:** Relacionamentos exibidos na listagem devem ser carregados via `with(['relacionamento'])`. Nunca use `with()` em colunas JSON/array nativas.
5. **Preservação de URL:** Sempre encadear `->paginate(10)->withQueryString()` para manter filtros e abas ao mudar de página.
6. **Contadores Reativos via Clone:** Os contadores de abas devem usar `(clone $queryBase)->count()`, garantindo que respeitem a busca e filtros secundários ativos.

---

## 📁 Estrutura de Arquivos do Módulo

| Camada | Arquivo Canônico | Responsabilidade |
| :--- | :--- | :--- |
| **Enum** | `app/Enums/[Nome]Enum.php` | Backed Enum tipado com `options()`, `label()` e `badgeVariant()` |
| **Form Request** | `app/Http/Requests/Listar[Entidades]Request.php` | Validação de query params, busca e default da aba |
| **Action** | `app/Actions/Filtrar[Entidades]Action.php` | `executeQuery()` com busca/filtros + `aplicarFiltroAba()` isolado |
| **Thin Controller** | `app/Http/Controllers/[Entidade]Controller.php` | Gate + Action + contadores via clone + `Inertia::render()` |
| **Policy** | `app/Policies/[Entidade]Policy.php` | Autorização RBAC nos métodos `viewAny()` e `export()` |
| **Exportação** | `app/Http/Controllers/Exportar[Entidades]Controller.php` | Streaming em lote via cursor lazy com consumo O(1) de RAM |

---

## 🧩 Esqueletos Canônicos

### 1. Enum Tipado (`app/Enums/[Nome]Enum.php`)

```php
<?php

declare(strict_types=1);

namespace App\Enums;

enum Status[Entidade]: string
{
    case Ativo = 'ATIVO';
    case Pendente = 'PENDENTE';
    case Inativo = 'INATIVO';

    /** @return array<int, array{value: string, label: string}> */
    public static function options(): array
    {
        return array_map(static fn (self $case): array => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }

    public function label(): string
    {
        return match ($this) {
            self::Ativo => 'Ativo',
            self::Pendente => 'Pendente',
            self::Inativo => 'Inativo',
        };
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Ativo => 'success',
            self::Pendente => 'warning',
            self::Inativo => 'destructive',
        };
    }
}
```

---

### 2. Form Request de Listagem (`app/Http/Requests/Listar[Entidades]Request.php`)

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\[Entidade];
use Illuminate\Foundation\Http\FormRequest;

final class Listar[Entidades]Request extends FormRequest
{
    public function rules(): array
    {
        return [
            'termo' => ['nullable', 'string', 'max:255'],
            'filtro_id' => ['nullable', 'integer'],
            'aba' => ['required', 'string'],
            'ordem_campo' => ['nullable', 'string'],
            'ordem_direcao' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'termo' => $this->filled('termo') ? $this->string('termo')->trim()->toString() : null,
            'aba' => $this->input('aba', 'todos'),
        ]);
    }
}
```

---

### 3. Action de Filtragem (`app/Actions/Filtrar[Entidades]Action.php`)

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\Status[Entidade];
use App\Models\[Entidade];
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

final readonly class Filtrar[Entidades]Action
{
    /**
     * @param Collection<string, mixed> $filtros
     * @return Builder<[Entidade]>
     */
    public function executeQuery(Collection $filtros): Builder
    {
        $query = [Entidade]::query()->with(['relacionamento']);

        // 1. Busca textual agrupada
        $query->when($filtros->get('termo'), static function (Builder $q, string $termo): void {
            $q->where(static function (Builder $sub) use ($termo): void {
                $sub->where('nome', 'like', "%{$termo}%")
                    ->orWhere('email', 'like', "%{$termo}%");
            });
        });

        // 2. Filtro secundário em grid
        $query->when($filtros->get('filtro_id'), static function (Builder $q, int|string $id): void {
            $q->where('relacionamento_id', $id);
        });

        // 3. Ordenação
        $campoOrdem = (string) $filtros->get('ordem_campo', 'created_at');
        $direcaoOrdem = (string) $filtros->get('ordem_direcao', 'desc');
        $query->orderBy($campoOrdem, $direcaoOrdem);

        return $query;
    }

    /**
     * @param Builder<[Entidade]> $query
     * @return Builder<[Entidade]>
     */
    public function aplicarFiltroAba(Builder $query, string $aba): Builder
    {
        return match ($aba) {
            Status[Entidade]::Ativo->value => $query->where('status', Status[Entidade]::Ativo),
            Status[Entidade]::Pendente->value => $query->where('status', Status[Entidade]::Pendente),
            Status[Entidade]::Inativo->value => $query->where('status', Status[Entidade]::Inativo),
            default => $query,
        };
    }
}
```

---

### 4. Thin Controller (`app/Http/Controllers/[Entidade]Controller.php`)

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Filtrar[Entidades]Action;
use App\Enums\Status[Entidade];
use App\Http\Requests\Listar[Entidades]Request;
use App\Models\[Entidade];
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

final class [Entidade]Controller extends Controller
{
    public function __construct(
        private readonly Filtrar[Entidades]Action $filtrar[Entidades]Action,
    ) {}

    public function index(Listar[Entidades]Request $request): InertiaResponse
    {
        Gate::authorize('viewAny', [Entidade]::class);

        $filtros = $request->safe()->collect();
        $queryBase = $this->filtrar[Entidades]Action->executeQuery($filtros);

        // Contadores das abas preservando a busca e filtros ativos
        $contadores = [
            'todos' => (clone $queryBase)->count(),
            'ativos' => (clone $queryBase)->where('status', Status[Entidade]::Ativo)->count(),
            'pendentes' => (clone $queryBase)->where('status', Status[Entidade]::Pendente)->count(),
            'inativos' => (clone $queryBase)->where('status', Status[Entidade]::Inativo)->count(),
        ];

        $aba = (string) $filtros->get('aba', 'todos');
        $[entidades] = $this->filtrar[Entidades]Action->aplicarFiltroAba($queryBase, $aba)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('[modulo]/index', [
            '[entidades]' => $[entidades],
            'contadores' => $contadores,
            'filtros' => $filtros->toArray(),
        ]);
    }
}
```

---

### 5. Policy RBAC (`app/Policies/[Entidade]Policy.php`)

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

final class [Entidade]Policy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('[entidades].visualizar');
    }

    public function export(User $user): bool
    {
        return $user->hasPermissionTo('[entidades].exportar');
    }
}
```

---

### 6. Exportação Streaming CSV O(1) de RAM

```php
public function exportar(Listar[Entidades]Request $request): StreamedResponse
{
    Gate::authorize('export', [Entidade]::class);

    $filtros = $request->safe()->collect();
    $query = $this->filtrar[Entidades]Action->executeQuery($filtros);
    $aba = (string) $filtros->get('aba', 'todos');
    $query = $this->filtrar[Entidades]Action->aplicarFiltroAba($query, $aba);

    $headers = [
        'Content-Type' => 'text/csv; charset=UTF-8',
        'Content-Disposition' => 'attachment; filename="[entidades].csv"',
    ];

    return response()->stream(static function () use ($query): void {
        $out = fopen('php://output', 'w');
        // BOM UTF-8 para suporte a acentos no Excel PT-BR
        fwrite($out, "\xEF\xBB\xBF");
        fputcsv($out, ['ID', 'Nome', 'Status', 'Criado Em'], ';');

        foreach ($query->cursor() as $item) {
            fputcsv($out, [
                $item->id,
                $item->nome,
                $item->status->label(),
                $item->created_at?->format('d/m/Y H:i') ?? '',
            ], ';');
        }

        fclose($out);
    }, 200, $headers);
}
```
