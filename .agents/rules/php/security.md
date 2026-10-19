---
trigger: glob
globs: "{app,database,routes,tests}/**/*.php"
---

# PHP / Laravel Security Best Practices

> Diretrizes de segurança, autorização, prevenção contra SQL Injection, Mass Assignment e IDOR no backend Laravel.

## Prevenção contra SQL Injection

Nunca concatene variáveis ou entradas de usuário diretamente em consultas SQL cruas (`DB::raw`, `whereRaw`, `selectRaw`):

```php
// CRÍTICO: Vulnerável a SQL Injection
$users = DB::select("SELECT * FROM users WHERE email = '$email'");
User::whereRaw("name LIKE '%{$search}%'")->get();

// CORRETO: Parâmetros vinculados (Bindings)
$users = DB::select('SELECT * FROM users WHERE email = ?', [$email]);
User::whereRaw('name LIKE ?', ["%{$search}%"])->get();
```

## Proteção contra Mass Assignment

- Defina explicitamente os campos permitidos na propriedade `$fillable` da Model.
- **NUNCA use `$request->all()` para persistência**. Utilize rigorosamente `$request->validated()` a partir de um FormRequest.

```php
// CRÍTICO: Atacante pode enviar 'is_admin' => true no payload
User::create($request->all());

// CORRETO: Apenas dados validados e declarados no FormRequest
User::create($request->validated());
```

## Autorização Estrita e Prevenção de IDOR

Vulnerabilidades de IDOR (*Insecure Direct Object Reference*) ocorrem quando o sistema permite acesso a registros apenas informando seu ID sem checar a titularidade ou permissão.

1. **Policies e Gates Obrigatórios**:
   - Para toda ação de consulta sensível, edição ou exclusão, valide a autorização via Policy:
     ```php
     $this->authorize('update', $order);
     ```
   - Ou utilize o método `authorize()` do próprio `FormRequest`:
     ```php
     public function authorize(): bool
     {
         return $this->user()->can('update', $this->route('order'));
     }
     ```

2. **Scoped Bindings**:
   - Para recursos aninhados, force a validação de parentesco na rota:
     ```php
     Route::get('/tenants/{tenant}/users/{user}', [TenantUserController::class, 'show'])
         ->scopeBindings();
     ```

## Tratamento de Senhas e Dados Sensíveis

- Sempre utilize o cast `'password' => 'hashed'` no modelo ou `Hash::make($password)`.
- Oculte campos confidenciais da serialização via propriedade `$hidden`:
  ```php
  protected $hidden = [
      'password',
      'remember_token',
      'two_factor_secret',
      'two_factor_recovery_codes',
  ];
  ```

## Prevenção de Race Conditions

Para operações críticas de saldo, estoque ou limites:
- Use transações com bloqueio pessimista: `DB::transaction(fn() => Account::where('id', $id)->lockForUpdate()->first())`.
- Ou bloqueios atômicos via cache: `Cache::lock("user:{$userId}:checkout", 10)->block(3, function () { ... })`.
