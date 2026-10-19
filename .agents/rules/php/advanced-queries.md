---
trigger: glob
globs: app/**/*.php
---

# ⚡ Padrões Avançados de Queries (Laravel Eloquent)

Guia prático e diretrizes para otimização de consultas no banco de dados, prevenção de **N+1** e ganho de performance.

---

### 1. Subqueries com `addSelect()` para Valores Únicos (Has-Many)

> **Regra:** Nunca carregue uma relação has-many inteira (`with('logins')`) apenas para pegar um único valor (ex: data do último login). Use uma subconsulta correlacionada com `addSelect()`.

❌ **Incorreto (Gera N+1 ou carrega centenas de registros na memória PHP):**

```php
$users = User::with('logins')->get();
$ultimoLogin = $users->first()->logins->sortByDesc('created_at')->first()?->created_at;
```

✅ **Correto (Zero queries extras, direto no SQL principal):**

```php
public function scopeWithLastLoginAt($query): void
{
    $query->addSelect([
        'last_login_at' => Login::select('created_at')
            ->whereColumn('user_id', 'users.id')
            ->latest()
            ->take(1),
    ])->withCasts(['last_login_at' => 'datetime']);
}
```

---

### 2. Relacionamentos Dinâmicos via Subquery FK

> **Regra:** Para carregar um registro completo do has-many (ex: o último registro) sem trazer a lista inteira, selecione o `id` via subquery e defina um relacionamento virtual `belongsTo`.

✅ **Exemplo Prático:**

```php
public function lastLogin(): BelongsTo
{
    return $this->belongsTo(Login::class);
}

public function scopeWithLastLogin($query): void
{
    $query->addSelect([
        'last_login_id' => Login::select('id')
            ->whereColumn('user_id', 'users.id')
            ->latest()
            ->take(1),
    ])->with('lastLogin');
}
```

---

### 3. Agregações Condicionais em Vez de Múltiplos `count()`

> **Regra:** Substitua N consultas separadas de `count()` por uma única query usando `CASE WHEN` dentro de `selectRaw()`. Utilize `toBase()` para evitar o custo de hidratação de Models quando precisar apenas dos números escalares.

❌ **Incorreto (3 queries separadas ao banco):**

```php
$solicitados = Feature::where('status', 'Requested')->count();
$planejados = Feature::where('status', 'Planned')->count();
$concluidos = Feature::where('status', 'Completed')->count();
```

✅ **Correto (1 única query consolidada):**

```php
$totais = Feature::toBase()
    ->selectRaw("count(case when status = 'Requested' then 1 end) as solicitados")
    ->selectRaw("count(case when status = 'Planned' then 1 end) as planejados")
    ->selectRaw("count(case when status = 'Completed' then 1 end) as concluidos")
    ->first();
```

---

### 4. Evitar N+1 Circular com `setRelation()`

> **Regra:** Quando o Model pai carrega seus filhos (`$feature->load('comments.user')`), e a view ou o recurso precisa acessar `$comment->feature`, use `setRelation()` para injetar a instância já carregada em memória.

✅ **Exemplo Prático:**

```php
$feature->load('comments.user');

// Evita que cada comentário dispare uma nova query para buscar a mesma feature
$feature->comments->each->setRelation('feature', $feature);
```

---

### 5. Preferir `whereIn` + Subquery ao invés de `whereHas`

> **Regra:** O `whereHas()` gera uma subconsulta correlacionada com `EXISTS` que reexecuta para cada linha da tabela. Usar `whereIn()` com uma subquery `select('id')` permite que o banco utilize índices sem estourar a memória do PHP.

❌ **Incorreto (Subquery correlacionada lenta em tabelas grandes):**

```php
$query->whereHas('company', fn ($q) => $q->where('name', 'like', "%{$termo}%"));
```

✅ **Correto (Permite uso de índice na coluna estrangeira):**

```php
$query->whereIn('company_id', Company::where('name', 'like', "%{$termo}%")->select('id'));
```

---

### 6. Duas Queries Simples Podem Vencer Uma Complexa

> **Regra:** Executar uma consulta secundária pontual e passar seus IDs via `whereIn` frequentemente é muito mais rápido do que um join complexo ou subquery aninhada quando a busca secundária é altamente seletiva e indexada.

---

### 7. Índices Compostos Alinhados ao `orderBy`

> **Regra:** Ao ordenar por mais de uma coluna, crie um índice composto na migração com **exatamente a mesma ordem** das colunas do `orderBy()`. Índices simples individuais não atendem ordenações múltiplas e geram _filesort_ no banco.

```php
// Na Migration:
$table->index(['last_name', 'first_name']);

// Na Query (a ordem deve ser idêntica ao índice criado):
User::query()
    ->orderBy('last_name')
    ->orderBy('first_name')
    ->paginate();
```

---

### 8. Ordenação de Relações Has-Many via Subquery Correlacionada

> **Regra:** Para ordenar registros por um valor de relação has-many, evite `JOIN` (que duplica linhas da tabela principal). Use uma subquery correlacionada diretamente no `orderBy()`.

✅ **Exemplo Prático:**

```php
public function scopeOrderByLastLogin($query): void
{
    $query->orderByDesc(
        Login::select('created_at')
            ->whereColumn('user_id', 'users.id')
            ->latest()
            ->take(1)
    );
}
```
