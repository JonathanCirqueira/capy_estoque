---
trigger: glob
globs: "**/*.{ts,tsx,js,jsx}"
---

# TypeScript/JavaScript Coding Style

> Diretrizes de tipagem, estilo e convenções para TypeScript e JavaScript em todo o projeto.

## Types and Interfaces

Use types para tornar APIs públicas, modelos compartilhados e props de componentes explícitos, legíveis e reutilizáveis.

### Public APIs

- Adicione tipos explícitos para parâmetros e retornos em funções exportadas, utilitários compartilhados e métodos públicos.
- Deixe o TypeScript inferir tipos de variáveis locais quando forem óbvios.
- Extraia estruturas de objetos repetidas inline em `type` ou `interface` nomeados.

```typescript
// ERRADO: Função exportada sem tipagem explícita
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`;
}

// CORRETO: Tipos explícitos em APIs públicas
interface User {
  firstName: string;
  lastName: string;
}

export function formatUser(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
```

### Interfaces vs. Type Aliases

- Use `interface` para estruturas de objetos que possam ser estendidas ou implementadas.
- Use `type` para unions, intersecções, tuplas, mapped types e utility types (`Pick`, `Omit`, etc.).
- Prefira uniões de literais de string (`'admin' | 'member'`) a `enum` do TypeScript, a menos que um `enum` seja estritamente necessário para interoperabilidade com o backend.

```typescript
interface User {
  id: string;
  email: string;
}

type UserRole = 'admin' | 'member';
type UserWithRole = User & {
  role: UserRole;
};
```

### Evite `any`

- Evite terminantemente `any` no código da aplicação.
- Use `unknown` para entradas externas ou dados não confiáveis e faça a restrição de tipos (*narrowing*) de forma segura.
- Use *Generics* quando o tipo de retorno depender do tipo passado pelo chamador.

```typescript
// ERRADO: any elimina toda a segurança de tipos
function getErrorMessage(error: any) {
  return error.message;
}

// CORRETO: unknown força validação segura
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}
```

### React Props

- Defina props de componentes sempre com `type` ou `interface` nomeado.
- Tipifique callbacks explicitamente (`(id: string) => void`).
- Evite `React.FC` — prefira funções padrão com tipagem direta nos parâmetros: `function UserCard({ user, onSelect }: UserCardProps)`.

```typescript
interface User {
  id: string;
  email: string;
}

interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return <button onClick={() => onSelect(user.id)}>{user.email}</button>;
}
```

### Arquivos JavaScript (.js / .jsx)

- Em arquivos `.js` e `.jsx`, utilize comentários JSDoc quando tipos melhorarem a clareza e a migração para TypeScript não for imediata.
- Mantenha o JSDoc rigorosamente alinhado ao comportamento em runtime.

```javascript
/**
 * @param {{ firstName: string, lastName: string }} user
 * @returns {string}
 */
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`;
}
```

## Imutabilidade

Nunca modifique diretamente objetos ou arrays de entrada. Utilize spread operators ou métodos imutáveis:

```typescript
interface User {
  id: string;
  name: string;
}

// ERRADO: Mutação direta do objeto recebido
function updateUser(user: User, name: string): User {
  user.name = name; // MUTAÇÃO INDESEJADA
  return user;
}

// CORRETO: Atualização imutável
function updateUser(user: Readonly<User>, name: string): User {
  return {
    ...user,
    name,
  };
}
```

## Tratamento de Erros

Utilize `async/await` com blocos `try-catch` e restrinja erros tipados como `unknown`:

```typescript
interface User {
  id: string;
  email: string;
}

declare function riskyOperation(userId: string): Promise<User>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}

async function loadUser(userId: string): Promise<User> {
  try {
    const result = await riskyOperation(userId);
    return result;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}
```

## Validação de Entrada (Schema-Based)

Utilize Zod para validação em runtime de dados externos e infira os tipos TypeScript a partir do próprio schema:

```typescript
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});

export type UserInput = z.infer<typeof userSchema>;

export function parseUserInput(input: unknown): UserInput {
  return userSchema.parse(input);
}
```

## Disciplina com `console.log`

- **Nenhum `console.log` deve permanecer em código de produção.**
- Remova logs de depuração antes de finalizar tarefas ou commits.
- Para alertas e erros reais de aplicação, utilize mecanismos estruturados ou trackers de erro (como Sentry ou loggers da aplicação).
