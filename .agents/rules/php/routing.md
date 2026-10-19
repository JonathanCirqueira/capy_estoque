---
trigger: glob
globs: "{app,routes}/**/*.php"
---

# 🗺️ Boas Práticas de Rotas e Controllers (`Routing & Controllers Best Practices`)

Diretrizes essenciais para definição de rotas limpas, segurança via _Scoped Bindings_, Controllers enxutos (_Thin Controllers_) e injeção automática de Form Requests no Laravel.

---

### 1. Usar Implicit Route Model Binding

> **Regra:** Deixe o Laravel resolver as instâncias dos Models automaticamente a partir dos parâmetros de rota em vez de buscar manualmente com `findOrFail()`.

❌ **Incorreto (Busca manual por ID no controller):**
```php
public function show(int $id)
{
    $post = Post::findOrFail($id);

    return view('posts.show', ['post' => $post]);
}
```

✅ **Correto (Model injetado implicitamente pela rota):**
```php
public function show(Post $post)
{
    return view('posts.show', ['post' => $post]);
}
```

---

### 2. Usar Scoped Bindings para Recursos Aninhados

> **Regra:** Ao trabalhar com rotas aninhadas (`/pai/{pai}/filho/{filho}`), utilize `->scopeBindings()` para garantir que o recurso filho obrigatoriamente pertença ao modelo pai, prevenindo vazamento de dados de outros usuários/entidades (_Insecure Direct Object Reference - IDOR_).

✅ **Correto:**
```php
Route::get('/users/{user}/posts/{post}', function (User $user, Post $post) {
    // $post é automaticamente escopado ao $user informado
})->scopeBindings();
```

---

### 3. Usar Resource Controllers para Endpoints RESTful

> **Regra:** Padronize endpoints RESTful utilizando `Route::resource()` para interfaces completas ou `Route::apiResource()` para APIs, mantendo as ações do controller padronizadas (`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`).

✅ **Correto:**
```php
// Para rotas web tradicionais ou Inertia
Route::resource('posts', PostController::class);

// Para rotas de API sem métodos 'create' e 'edit'
Route::apiResource('api/posts', Api\PostController::class);
```

---

### 4. Manter Controllers Enxutos (`Keep Controllers Thin`)

> **Regra:** Métodos de controller devem ter preferencialmente menos de 10 linhas. Isole uploads, criação de entidades compostas, sincronizações de tabelas pivô e disparo de eventos dentro de **Action Classes** dedicadas.

❌ **Incorreto (Controller acumulando regras de upload, banco e eventos):**
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'body'  => ['required', 'string'],
        'tags'  => ['array'],
    ]);

    if ($request->hasFile('image')) {
        $request->file('image')->move(public_path('images'));
    }

    $post = Post::create($validated);
    $post->tags()->sync($validated['tags'] ?? []);

    event(new PostCreated($post));

    return redirect()->route('posts.show', $post);
}
```

✅ **Correto (Controller apenas orquestra FormRequest e Action):**
```php
public function store(StorePostRequest $request, CreatePostAction $create): RedirectResponse
{
    $post = $create->execute($request->validated());

    return redirect()->route('posts.show', $post);
}
```

---

### 5. Tipar Form Requests nos Métodos do Controller

> **Regra:** Nunca use a classe genérica `Request` para validação de formulários dentro do método. Ao tipar um `FormRequest` específico (ex: `StorePostRequest`), a autorização e validação ocorrem automaticamente antes mesmo da execução do método do controller.

❌ **Incorreto (Validação manual inline poluindo o método):**
```php
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'body'  => ['required', 'string'],
    ]);

    Post::create($validated);

    return redirect()->route('posts.index');
}
```

✅ **Correto (FormRequest tipado executa validação e autorização automaticamente):**
```php
public function store(StorePostRequest $request): RedirectResponse
{
    Post::create($request->validated());

    return redirect()->route('posts.index');
}
```
