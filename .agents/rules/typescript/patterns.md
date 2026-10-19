---
trigger: glob
globs: "**/*.{ts,tsx,js,jsx}"
---

# TypeScript/JavaScript Patterns

> Padrões arquiteturais, contratos de dados, custom hooks genéricos e abstrações de serviços em TypeScript.

## Formato Padrão de Resposta de API (`ApiResponse<T>`)

Quando houver comunicação direta via API REST / endpoints JSON, padronize a resposta com contratos genéricos fortemente tipados:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}
```

## Padrão para Custom Hooks Genéricos

Custom hooks utilitários devem ser parametrizados com tipos genéricos (`<T>`) para garantir reuso sem perda de inferência:

```typescript
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

## Padrão de Repositório / Serviços de Cliente

Para abstrair chamadas de dados ou operações de persistência externa:

```typescript
export interface Repository<T, CreateDto = Partial<T>, UpdateDto = Partial<T>, Filters = Record<string, unknown>> {
  findAll(filters?: Filters): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
}
```

## Integração com Laravel Wayfinder & Inertia

No ecossistema do Starter Kit, as rotas e ações do backend Laravel são geradas tipadas pelo Wayfinder:

```typescript
// Importe ações ou rotas diretamente de @/actions ou @/routes
import storeUserAction from "@/actions/App/Http/Controllers/UserController";
import { dashboard } from "@/routes";

// Wayfinder provê URL tipada e métodos HTTP correspondentes:
const targetUrl = storeUserAction.url();
const dashboardUrl = dashboard.url();
```
*Sempre utilize os métodos tipados do Wayfinder em vez de strings literais fixas para URLs de rotas.*
