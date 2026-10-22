---
name: backend-listagem
description: "Passo a passo padronizado para listagem, filtros reativos e contadores de abas no backend Laravel com Inertia, seguindo strict types, Thin Controllers, FormRequests de listagem e Actions de consulta sem N+1."
allowed-tools: Read, Write, Edit
version: 1.2
priority: HIGH
---

# Backend: Listagem e Consulta de Recursos (Index / Filter Flow)

> **MANDATÓRIO PARA TELAS DE LISTAGEM NO BACKEND:**
> Todo novo fluxo de listagem e filtragem no backend **DEVE** seguir estritamente as diretrizes de `app/backend-rules.md`, `laravel-best-practices` e os blueprints canônicos presentes na pasta `.agents/templates/backend/`.

---

## 📁 Arquivo de Referência do Template

Antes de gerar ou refatorar qualquer código de listagem no backend, inspecione diretamente o blueprint canônico:

- **Blueprint Canônico de Listagem Backend:** `.agents/templates/backend/listagem.md`

---

## 🎯 Arquitetura e Regras de Ouro

| Camada | Arquivo de Destino | Responsabilidade Exclusiva | Blueprint de Origem |
| :--- | :--- | :--- | :--- |
| **Enum Tipado** | `app/Enums/[Nome]Enum.php` | **ZERO STRINGS MÁGICAS**: Abas de status, perfis e filtros devem ser Backed Enums com `options()` e `badgeVariant()` | `.agents/templates/backend/listagem.md` |
| **Rota** | `routes/web.php` | Registro direto de GET nomeada (ex: `itens.index`) sob `auth`, `verified` | N/A |
| **Form Request** | `app/Http/Requests/Listar[Entidades]Request.php` | Validação de query string, termo de busca e filtros (sem `prepareForValidation` redundante) | `.agents/templates/backend/listagem.md` |
| **Policy** | `app/Policies/[Entidade]Policy.php` | Regras de autorização no método `viewAny()` | `.agents/templates/backend/listagem.md` |
| **Action** | `app/Actions/Filtrar[Entidades]Action.php` | Query Builder com `when()`, eager loading (`with()`) anti-N+1 e escopo de abas usando cases do Enum | `.agents/templates/backend/listagem.md` |
| **Thin Controller** | `app/Http/Controllers/[Entidade]Controller.php` | Contadores de abas via `clone $queryBase` comparando com constantes do Enum, paginação com `withQueryString()` | `.agents/templates/backend/listagem.md` |
| **Exportação** | `app/Http/Controllers/Exportar[Entidades]Controller.php` | Streaming em lote com `$query->cursor()` O(1) de RAM e BOM UTF-8 PT-BR | `.agents/templates/backend/listagem.md` |

---

## 📋 Passo a Passo Canônico de Implementação

### Passo 0: Inspeção Obrigatória do Banco Real e Schema First (MANDATÓRIO)

> ⚠️ **REGRA DE OURO - ZERO ALUCINAÇÕES DE BANCO:**
> Antes de criar ou alterar qualquer arquivo (FormRequest, Action, Controller ou Policy), **SEMPRE** inspecione:
> 1. O Model correspondente (`app/Models/[Entidade].php`) e seu método `casts()`.
> 2. As migrations da tabela (`database/migrations/`).
> 3. Os Enums reais existentes em `app/Enums/`.

- **Mapeamento Direto do Schema Real:**
  - Se o prompt fornecido pelo usuário contiver nomes de colunas, tabelas ou enums hipotéticos (ex: `departamentos`, `departamento_id`, `PerfilUsuario`), **NUNCA** crie tabelas ou migrations imaginárias. Mapeie imediatamente para os campos e Enums reais já presentes no projeto (ex: `nivel_acesso` mapeado para `App\Enums\NivelAcesso`).
- **Diferença Crítica: Relações Eloquent vs Colunas JSON/Array:**
  - O método `with(['relacionamento'])` para prevenção de N+1 é **EXCLUSIVO para métodos de relacionamento declarados no Model** (`belongsTo`, `hasMany`, `belongsToMany`, etc.).
  - **NUNCA passe colunas nativas ou campos com cast de JSON/array (como `servicos` em `users`) para o `with()`**, pois isso lançará a exceção `Call to undefined relationship`.
  - Confirme no Model se o atributo é um relacionamento antes de incluí-lo no `with()`.
- **Validação de Colunas de Busca e Ordenação:**
  - Certifique-se de que todas as colunas passadas para `$query->where()`, `$query->orWhere()` ou `$query->orderBy()` existem fisicamente na tabela.

---

### Passo 1: Definir a Rota (`routes/web.php`)

Defina a rota GET com nome canônico:

```php
use App\Http\Controllers\GestaoItemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/itens', [GestaoItemController::class, 'index'])->name('itens.index');
    Route::get('/itens/exportar', [GestaoItemController::class, 'exportar'])->name('itens.exportar');
});
```

---

### Passo 2: Form Request de Listagem
> 📖 **Basear-se em:** `.agents/templates/backend/listagem.md` (Seção FormRequest)

- **Arquivo:** `app/Http/Requests/Listar[Entidades]Request.php`
- **Validação Segura:** Focado exclusivamente em declarar regras para query params.
- **🚫 Sem `prepareForValidation()` Redundante:** O Laravel já faz `trim` de strings e converte strings vazias para `null` globalmente. Defaults de aba (`'todos'`) e ordenação devem ser lidos no Controller (`$filtros->get('aba', 'todos')`) ou na Action, eliminando código duplicado.

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\StatusItem;
use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListarItensRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'aba' => ['nullable', 'string', 'in:todos,ativos,pendentes,inativos'],
            'termo' => ['nullable', 'string', 'max:255'],
            'categoria_id' => ['nullable', 'integer', Rule::exists('categorias', 'id')],
            'status' => ['nullable', Rule::enum(StatusItem::class)],
            'ordem_campo' => ['nullable', 'string'],
            'ordem_direcao' => ['nullable', 'string', 'in:asc,desc'],
            'por_pagina' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }
}
```
            'aba' => ['required', 'string', 'in:todos,ativos,pendentes,inativos'],
            'ordem_campo' => ['nullable', 'string', 'in:nome,codigo,created_at'],
            'ordem_direcao' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
```

---

### Passo 3: Action de Filtragem e Consulta
> 📖 **Basear-se em:** `.agents/templates/backend/listagem.md` (Seção Action)

- **Arquivo:** `app/Actions/Filtrar[Entidades]Action.php`
- **Eager Loading Anti-N+1:** Incluir relacionamentos Eloquent declarados no Model que serão exibidos na tabela via `with(['categoria'])`. **Atenção:** Jamais incluir colunas JSON nativas no `with()`.
- **Busca Textual:** Cláusula `when()` com agrupamento seguro `orWhere`.
- **Separação de Abas:** O método `aplicarFiltroAba()` isola o filtro específico de status para que a query base possa ser reutilizada pelos contadores.

```php
<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\StatusItem;
use App\Models\Item;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

final readonly class FiltrarItensAction
{
    /**
     * Monta a query base com relacionamentos e filtros secundários aplicados.
     *
     * @param  Collection<string, mixed>  $filtros
     * @return Builder<Item>
     */
    public function executeQuery(Collection $filtros): Builder
    {
        /** @var Builder<Item> $query */
        $query = Item::query()->with(['categoria', 'servicos']);

        // 1. Busca textual rápida (nome, código)
        $query->when($filtros->get('termo'), function (Builder $q, string $termo): void {
            $q->where(function (Builder $sub) use ($termo): void {
                $sub->where('nome', 'like', "%{$termo}%")
                    ->orWhere('codigo', 'like', "%{$termo}%");
            });
        });

        // 2. Filtros secundários em grid
        $query->when($filtros->get('categoria_id'), function (Builder $q, int|string $categoriaId): void {
            $q->where('categoria_id', (int) $categoriaId);
        });

        // 3. Ordenação dinâmica
        $campoOrdem = (string) $filtros->get('ordem_campo', 'created_at');
        $direcaoOrdem = (string) $filtros->get('ordem_direcao', 'desc');
        $query->orderBy($campoOrdem, $direcaoOrdem);

        return $query;
    }

    /**
     * Aplica o filtro da aba ativa (todos, ativos, pendentes, inativos).
     *
     * @param  Builder<Item>  $query
     * @return Builder<Item>
     */
    public function aplicarFiltroAba(Builder $query, string $aba): Builder
    {
        return match ($aba) {
            'ativos' => $query->where('status', StatusItem::Ativo),
            'pendentes' => $query->where('status', StatusItem::Pendente),
            'inativos' => $query->where('status', StatusItem::Inativo),
            default => $query,
        };
    }
}
```

---

### Passo 4: Thin Controller (Index e Contadores de Abas)
> 📖 **Basear-se em:** `.agents/templates/backend/listagem.md` (Seção Thin Controller)

- **Arquivo:** `app/Http/Controllers/[Entidade]Controller.php`
- **Contadores Consistentes:** Usa `(clone $queryBase)->count()` para calcular a quantidade de cada aba respeitando os termos de busca e filtros secundários ativos.
- **Preservação de Query Strings:** Sempre encadear `->paginate(10)->withQueryString()`.
- **Dados Brutos:** Entrega as Models puras sem formatação manual de data/moeda no backend.

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\FiltrarItensAction;
use App\Enums\StatusItem;
use App\Http\Requests\ListarItensRequest;
use App\Models\Categoria;
use App\Models\Item;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

final class GestaoItemController extends Controller
{
    public function __construct(
        private readonly FiltrarItensAction $filtrarItensAction,
    ) {}

    public function index(ListarItensRequest $request): InertiaResponse
    {
        Gate::authorize('viewAny', Item::class);

        $filtros = $request->safe()->collect();
        $queryBase = $this->filtrarItensAction->executeQuery($filtros);

        // Contadores das abas dinâmicas clonando a query com os mesmos filtros
        $totalTodos = (clone $queryBase)->count();
        $totalAtivos = (clone $queryBase)->where('status', StatusItem::Ativo)->count();
        $totalPendentes = (clone $queryBase)->where('status', StatusItem::Pendente)->count();
        $totalInativos = (clone $queryBase)->where('status', StatusItem::Inativo)->count();

        /** @var string $aba */
        $aba = $filtros->get('aba', 'todos');
        $itens = $this->filtrarItensAction->aplicarFiltroAba($queryBase, $aba)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('itens/index', [
            'itens' => $itens,
            'totalTodos' => $totalTodos,
            'totalAtivos' => $totalAtivos,
            'totalPendentes' => $totalPendentes,
            'totalInativos' => $totalInativos,
            'categorias' => Categoria::all(['id', 'nome']),
            'filtros' => $filtros->toArray(),
        ]);
    }
}
```

---

### Passo 5: Policy de Segurança RBAC
> 📖 **Basear-se em:** `.agents/templates/backend/listagem.md` (Seção Policy)

- **Arquivo:** `app/Policies/[Entidade]Policy.php`

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

final class ItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('itens.visualizar');
    }

    public function export(User $user): bool
    {
        return $user->hasPermissionTo('itens.exportar');
    }
}
```

---

### Passo 6 (Opcional): Exportação em Lote via Streaming
> 📖 **Basear-se em:** `.agents/templates/backend/listagem.md` (Seção Exportação Streaming CSV)

- Usa LazyCollection (`$query->cursor()`) para consumo constante de RAM $O(1)$.
- Adiciona BOM UTF-8 (`\xEF\xBB\xBF`) e delimitador `;` para total compatibilidade com Excel no Brasil.

---

## 🔍 REGRA DE AUDITORIA E VERIFICAÇÃO FINAL OBRIGATÓRIA (Fase de Conclusão)

> ⚠️ **MANDATÓRIO ANTES DE CONCLUIR QUALQUER TAREFA DESTA SKILL:**
> Todo final de tarefa ou prompt em que esta skill for invocada DEVE obrigatoriamente submeter o código implementado a uma verificação estrita em 4 pilares antes de considerar a entrega finalizada:

### 1. Verificação contra o Blueprint Canônico (`.agents/templates/backend/listagem.md`)
- [ ] **Schema First:** Model (`app/Models/[Entidade].php`), migrations e Enums inspecionados previamente. Relacionamentos em `with()` são métodos Eloquent reais (`belongsTo`, `hasMany`), nunca colunas JSON/array nativas.
- [ ] **Enum Tipado:** Enums de status e filtros presentes em `app/Enums/` com `options()`, `label()` e `badgeVariant()`. Zero strings soltas para filtros de abas.
- [ ] **FormRequest de Listagem:** Valida busca, filtros e default de `'aba' => 'todos'` sem `prepareForValidation` redundante.
- [ ] **Action de Filtragem Estruturada:** Separação canônica entre `executeQuery()` (busca textual e filtros em grid) e `aplicarFiltroAba()` (filtro específico da aba).
- [ ] **Contadores de Abas Otimizados via Clone:** Os contadores usam `(clone $queryBase)->count()`, garantindo que respeitem os filtros e termos de busca aplicados.
- [ ] **Thin Controller:** Método `index` com menos de 10 linhas, autorização com `Gate::authorize('viewAny', ...)` e retorno via `Inertia::render()`.
- [ ] **Paginação Preservando Parâmetros:** Uso obrigatório de `->paginate(10)->withQueryString()`.
- [ ] **Exportação via Streaming (se houver):** Controller invokable dedicado usando `$query->cursor()`, BOM UTF-8 e delimitador `;`.

### 2. Verificação contra as Diretrizes do Backend (`app/backend-rules.md`)
- [ ] **A Regra da Fronteira (PT-BR Obrigatório):** Todas as colunas, queries, filtros, controllers e actions customizados nomeados em Português.
- [ ] **Segregação Absoluta:** O Controller não processa queries diretamente; a lógica de filtragem é delegada à Action de filtragem.
- [ ] **Single Action Controllers (Invokable):** Ações fora do CRUD padrão (ex: `Exportar[Entidade]Controller`) implementadas com `__invoke`.
- [ ] **Objetos e Coleções vs Arrays Brutos:** Paginação e dados alimentados diretamente no `Inertia::render()` como Models/Coleções, sem transformações manuais intermediárias em array.
- [ ] **Zero Strings Mágicas:** Status e abas consultados e comparados exclusivamente via Enums tipados (ex: `StatusItem::Ativo`).
- [ ] **Raw Data Only:** Backend retorna apenas dados puros (centavos, ISO dates, booleans, enums). Máscaras e formatações de data/moeda são exclusivas da UI.

### 3. Verificação contra as Boas Práticas Laravel (`.agents/skills/laravel-best-practices`)
- [ ] **Strict Types:** `declare(strict_types=1);` no topo de todos os arquivos PHP.
- [ ] **Advanced Queries & Anti-N+1:** Prevenção estrita de N+1 via eager loading (`with(...)`) das relações necessárias na listagem.
- [ ] **Constructor Property Promotion:** Injeção tipada de dependências no construtor do Controller.
- [ ] **Rotas RESTful:** Rota `GET` registrada sob middleware de autenticação (`auth`, `verified`).

### 4. Execução de Pipeline de Qualidade e Comandos Obrigatórios
Antes de responder ao usuário, execute os seguintes comandos no terminal:
```bash
# 1. Formatar código PHP modificado
vendor/bin/pint --dirty --format agent

# 2. Executar a suíte de verificação integrada (Oxlint, Rector, PHPStan max e Pest)
composer verify
```
⚠️ Se qualquer teste ou verificação falhar, corrija a inconsistência imediatamente antes de declarar a tarefa como concluída.
