---
trigger: glob
globs: app/**/*.php
---

# ✉️ Boas Práticas de Envio de E-mails (`Mail Best Practices`)

Diretrizes arquiteturais para envio de e-mails transacionais assíncronos, prevenção de condições de corrida (_race conditions_) e boas práticas de testes no Laravel.

---

### 1. Implementar `ShouldQueue` Diretamente na Classe Mailable

> **Regra:** Toda classe Mailable transacional deve implementar a interface `ShouldQueue`. Isso torna o envio assíncrono padrão da classe, garantindo que mesmo ao chamar `Mail::to()->send()` o e-mail vá automaticamente para a fila de mensageria (Redis / Database), sem prender a requisição do usuário.

❌ **Incorreto (Disparo síncrono trava a resposta HTTP da página):**

```php
final class ConviteUsuarioMail extends Mailable
{
    // Sem ShouldQueue -> O usuário espera o SMTP responder para a página carregar
}
```

✅ **Correto (Assíncrono por padrão):**

```php
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;

final class ConviteUsuarioMail extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;
}
```

---

### 2. Usar `$this->afterCommit()` no Construtor para Prevenir Race Conditions

> **Regra:** Quando um e-mail é despachado dentro de uma transação de banco (`DB::transaction()`), um worker de fila rápido pode tentar processá-lo antes do `COMMIT` ser gravado no banco de dados. Chame `$this->afterCommit()` no construtor do Mailable para garantir que a mensagem só entre na fila após o commit bem-sucedido.

❌ **Incorreto (Risco de ModelNotFoundException ou dados desatualizados na fila):**

```php
public function __construct(public readonly User $destinatario)
{
    // Se despachado em DB::transaction, a fila pode puxar antes do commit
}
```

✅ **Correto (Garante integridade transacional antes do envio):**

```php
public function __construct(
    public readonly User $destinatario,
    public readonly array $dadosExtras = [],
) {
    $this->afterCommit();
}
```

---

### 3. Usar `assertQueued()` em Vez de `assertSent()` para Mailables na Fila

> **Regra:** O método `Mail::assertSent()` verifica apenas e-mails enviados de forma síncrona. Mailables que implementam `ShouldQueue` passam silenciosamente ou falham de forma inconsistente no `assertSent()`. Use SEMPRE `Mail::assertQueued()` para mailables assíncronos.

❌ **Incorreto (Falso positivo/falso negativo para mailables com ShouldQueue):**

```php
Mail::assertSent(ConviteUsuarioMail::class);
```

✅ **Correto (Testa fielmente o enfileiramento):**

```php
Mail::assertQueued(ConviteUsuarioMail::class, function (ConviteUsuarioMail $mail): bool {
    return $mail->hasTo('usuario@empresa.com.br');
});
```

---

### 4. Utilizar Markdown para E-mails Transacionais

> **Regra:** Prefira sempre templates Blade em formato Markdown (`x-mail::message`, `x-mail::button`, `x-mail::panel`). O Laravel gera automaticamente as versões HTML responsiva e Plain Text (texto puro), além de permitir customização global de tema.

✅ **Estrutura no Mailable:**

```php
public function content(): Content
{
    return new Content(
        markdown: 'emails.convite-usuario',
        with: [
            'destinatario' => $this->destinatario,
            'urlAcesso' => route('login'),
        ],
    );
}
```

✅ **Estrutura no Template Blade (`resources/views/emails/convite-usuario.blade.php`):**

```blade
<x-mail::message>
# Olá, {{ $destinatario->name }}!

Você foi convidado para acessar a plataforma **{{ config('app.name') }}**.

<x-mail::button :url="$urlAcesso" color="primary">
Acessar Plataforma
</x-mail::button>

Atenciosamente,
**Equipe {{ config('app.name') }}**
</x-mail::message>
```

---

### 5. Separar Testes de Conteúdo dos Testes de Disparo

> **Regra:** Nunca misture o teste do HTML do e-mail com o teste da Action ou Controller que o envia. Misturar essas responsabilidades torna os testes frágeis e difíceis de manter.

- **Teste de Disparo (Feature / Integration):** Focado no Controller/Action. Usa `Mail::fake()` e `Mail::assertQueued()`.
- **Teste de Conteúdo (Unit):** Instancia o Mailable diretamente e usa métodos como `assertSeeInHtml()`.

✅ **Exemplo de Teste de Conteúdo Isolado:**

```php
test('renderiza corretamente o conteudo do email de convite', function (): void {
    $usuario = User::factory()->make([
        'name' => 'Carlos Silva',
        'email' => 'carlos@empresa.com.br',
    ]);

    $mailable = new ConviteUsuarioMail($usuario, ['senha' => 'temporaria123']);

    $mailable->assertSeeInHtml('Carlos Silva');
    $mailable->assertSeeInHtml('temporaria123');
});
```
