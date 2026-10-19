---
trigger: glob
globs: "{app,database,routes,tests}/**/*.php"
---

# PHP / Laravel Coding Style

> Diretrizes de estilo de código, convenções de tipagem e padrões PSR-12 / PER-CS para PHP 8.3 e Laravel 13.

## Padrões Fundamentais de Linguagem

- **Strict Types**: Em classes de domínio e novos arquivos críticos, declare `declare(strict_types=1);` no topo do arquivo.
- **Estruturas de Controle**: Sempre use chaves `{}` em qualquer estrutura de controle (`if`, `else`, `foreach`, `while`), mesmo que o bloco possua apenas uma única linha.
- **Tipagem Explícita**: Todo método e função deve possuir declaração explícita de tipos nos parâmetros e no tipo de retorno (`void`, `array`, `string`, `Response`, etc.).

```php
// ERRADO: Sem chaves e sem tipagem estrita
if ($user->is_active)
    return $user->email;

// CORRETO: Tipagem completa e chaves obrigatórias
public function getUserEmail(User $user): ?string
{
    if ($user->is_active) {
        return $user->email;
    }

    return null;
}
```

## Constructor Property Promotion (PHP 8.3)

Sempre utilize a promoção de propriedades no construtor para injeção de dependências e inicialização de atributos:

```php
// CORRETO: Constructor promotion conciso e tipado
namespace App\Services;

use App\Contracts\PaymentGatewayContract;

class CheckoutService
{
    public function __construct(
        public readonly PaymentGatewayContract $paymentGateway,
        public readonly string $webhookSecret,
    ) {}
}
```

## Nomenclatura e Convenções

- **Classes, Enums e Interfaces**: `PascalCase` (`CreateUserAction`, `OrderStatus`, `UserRepositoryContract`).
- **Métodos e Funções**: `camelCase` (`findActiveUsers`, `calculateDiscount`).
- **Variáveis e Propriedades**: `camelCase` descritivo (`isRegisteredForDiscounts`, `orderItems`).
- **Colunas do Banco de Dados**: `snake_case` (`user_id`, `created_at`, `billing_address`).
- **Enums**: Chaves em `TitleCase` com valores primitivos associados (backed enums):
  ```php
  namespace App\Enums;

  enum OrderStatus: string
  {
      case Pending = 'pending';
      case Processing = 'processing';
      case Completed = 'completed';
      case Cancelled = 'cancelled';
  }
  ```

## Criação e Estruturação de Models

- Sempre gere Models com suas respectivas migrations, factories e seeders associados:
  ```bash
  php artisan make:model Order -mfs
  ```
- Defina tipos de cast nativos em `$casts`:
  ```php
  protected function casts(): array
  {
      return [
          'status' => OrderStatus::class,
          'is_paid' => 'boolean',
          'amount' => 'decimal:2',
      ];
  }
  ```

## Formatação Automática com Laravel Pint

Todo código PHP deve seguir rigorosamente as regras de estilo do **Laravel Pint**. Execute sempre após editar:
```bash
vendor/bin/pint --dirty --format agent
```
