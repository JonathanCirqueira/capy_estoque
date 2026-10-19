---
trigger: glob
globs: "{app,database}/**/*.php"
---

# 📦 Boas Práticas de Migrations (`Migration Best Practices`)

Diretrizes essenciais para criação, integridade e versionamento do esquema de banco de dados no Laravel.

---

### 1. Gerar Migrations Exclusivamente via Artisan

> **Regra:** Nunca crie arquivos de migration manualmente. Use sempre `php artisan make:migration` para garantir timestamp correto, ordenação cronológica e padrão oficial do framework.

❌ **Incorreto (Arquivo criado manualmente sem timestamp):**
```php
// database/migrations/tabela_posts.php  ← quebra a ordenação cronológica
```

✅ **Correto (Gerado via CLI):**
```bash
php artisan make:migration create_posts_table
php artisan make:migration add_slug_to_posts_table
```

---

### 2. Usar `constrained()` para Chaves Estrangeiras

> **Regra:** Utilize o método fluente `foreignId()->constrained()` para definição automática de foreign keys, convenções de índice e integridade referencial.

✅ **Exemplo Canônico:**
```php
$table->foreignId('user_id')->constrained()->cascadeOnDelete();

// Para chaves com nomenclatura personalizada:
$table->foreignId('autor_id')->constrained('users');
```

---

### 3. Migrations em Produção são Imutáveis

> **Regra:** Uma vez que uma migration foi executada em homologação ou produção, **NUNCA mais edite o arquivo original**. Crie sempre uma nova migration para alterar colunas ou tabelas existentes.

❌ **Incorreto (Alterar migration antiga que já rodou no banco):**
```php
// 2024_01_01_create_posts_table.php — já executada em produção
$table->string('slug')->unique(); // ← Adicionar coluna aqui quebra bancos existentes
```

✅ **Correto (Criar uma nova migration para alteração):**
```bash
php artisan make:migration add_slug_to_posts_table
```
```php
Schema::table('posts', function (Blueprint $table): void {
    $table->string('slug')->unique()->after('title');
});
```

---

### 4. Criar Índices Diretamente na Criação da Tabela

> **Regra:** Defina os índices necessários no momento em que cria a migration. Qualquer coluna utilizada com frequência em cláusulas `WHERE`, `ORDER BY` ou `JOIN` deve possuir índice.

❌ **Incorreto (Tabela sem índices essenciais para busca e ordenação):**
```php
Schema::create('pedidos', function (Blueprint $table): void {
    $table->id();
    $table->foreignId('cliente_id')->constrained();
    $table->string('status');
    $table->timestamps();
});
```

✅ **Correto (Índices explícitos para performance rápida):**
```php
Schema::create('pedidos', function (Blueprint $table): void {
    $table->id();
    $table->foreignId('cliente_id')->constrained()->index();
    $table->string('status')->index();
    $table->timestamp('entregue_em')->nullable()->index();
    $table->timestamps();
});
```

---

### 5. Espelhar Valores Padrão em `$attributes` do Model

> **Regra:** Quando uma coluna tiver um valor padrão (`default`) definido no banco de dados, espelhe esse valor no array `$attributes` do Model para que a instância já possua o valor correto no PHP antes de ser persistida.

```php
// Na Migration:
$table->string('status')->default('pendente');

// Na Model correspondente:
protected $attributes = [
    'status' => 'pendente',
];
```

---

### 6. Métodos `down()` Reversíveis

> **Regra:** Implemente o método `down()` para alterações de esquema reversíveis, permitindo que comandos como `php artisan migrate:rollback` funcionem perfeitamente no ambiente de CI/CD e testes locais. Para migrations destrutivas ou de backfill irreversível, deixe um comentário explícito.

✅ **Exemplo de Rollback Limpo:**
```php
public function down(): void
{
    Schema::table('posts', function (Blueprint $table): void {
        $table->dropColumn('slug');
    });
}
```

---

### 7. Responsabilidade Única por Migration

> **Regra:** Nunca misture alteração de esquema estrutural (**DDL** - `Schema::create/table`) com inserção massiva de dados (**DML** - `DB::table()->insert`). Em caso de falha no meio do processo, o banco pode ficar em estado inconsistente.

❌ **Incorreto (DDL e DML misturados):**
```php
public function up(): void
{
    Schema::create('configuracoes', function (Blueprint $table): void { ... });
    DB::table('configuracoes')->insert(['chave' => 'versao', 'valor' => '1.0']);
}
```

✅ **Correto (Separar criação de tabela do seeding):**
- Use uma **Migration** apenas para o `Schema::create`.
- Use um **Seeder** (`php artisan make:seeder`) para popular os dados iniciais.
