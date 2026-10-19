---
trigger: glob
globs: app/**/*.php
---

# 🛡️ Boas Práticas de Validação e Formulários (`Validation & Forms Best Practices`)

Diretrizes para validação robusta, desacoplamento de controllers com Form Requests dedicados, prevenção contra vulnerabilidades de _Mass Assignment_ e regras condicionais no Laravel.

---

### 1. Usar Classes de Form Request Dedicadas

> **Regra:** Nunca execute validações inline dentro de controllers. Extraia todas as regras para classes `FormRequest` dedicadas geradas via `php artisan make:request`.

❌ **Incorreto (Validação inline poluindo o controller):**
```php
public function store(Request $request)
{
    $request->validate([
        'title' => 'required|max:255',
        'body'  => 'required',
    ]);
}
```

✅ **Correto (Form Request dedicado com injeção automática):**
```php
public function store(StorePostRequest $request)
{
    Post::create($request->validated());
}
```

---

### 2. Notação em Array vs. String para Regras de Validação

> **Regra:** Prefira sempre a sintaxe de **array** para novas regras de validação. Ela melhora a legibilidade, evita erros com pipes/delimitadores e se integra perfeitamente a objetos e closures da classe `Rule::`. Caso o projeto legado utilize strings, mantenha a consistência, mas priorize arrays em código novo.

✅ **Recomendado (Sintaxe em Array):**
```php
// Preferido para código novo
'email' => ['required', 'email', Rule::unique('users')],
```

⚠️ **Notação em String (Seguir apenas se o projeto já padronizar assim):**
```php
'email' => 'required|email|unique:users',
```

---

### 3. Sempre Usar `$request->validated()`

> **Regra:** Obtenha **exclusivamente** os dados que passaram com sucesso pelas regras de validação. NUNCA utilize `$request->all()` para persistência ou operações em massa, pois isso abre brechas graves de _Mass Assignment_.

❌ **Incorreto (Uso de all() permitindo inserção de campos arbitrários):**
```php
Post::create($request->all());
```

✅ **Correto (Persistência segura apenas com atributos validados):**
```php
Post::create($request->validated());
```

---

### 4. Usar `Rule::when()` para Validação Condicional

> **Regra:** Utilize o método fluente `Rule::when()` para aplicar regras condicionais de forma declarativa e legível, em vez de recorrer a condicionais `if` espalhadas no array de regras.

✅ **Correto:**
```php
'company_name' => [
    Rule::when($this->account_type === 'business', ['required', 'string', 'max:255']),
],
```

---

### 5. Usar o Método `after()` para Validações Customizadas Complexas

> **Regra:** Prefira implementar o método `after()` nativo do FormRequest em vez de sobrescrever `withValidator()` quando precisar executar lógica de validação complexa dependente de múltiplos campos ou consultas externas ao banco.

✅ **Correto:**
```php
public function after(): array
{
    return [
        function (Validator $validator) {
            if ($this->quantity > Product::find($this->product_id)?->stock) {
                $validator->errors()->add('quantity', 'Quantidade solicitada indisponível em estoque.');
            }
        },
    ];
}
```
