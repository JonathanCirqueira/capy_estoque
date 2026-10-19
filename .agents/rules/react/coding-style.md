---
trigger: glob
globs: "resources/**/*.{ts,tsx,js,jsx}"
---

# React Coding Style

> Diretrizes de estilo e convenções de código para React 19 + TypeScript no ecossistema do projeto (Inertia.js v3, Tailwind CSS v4).

## File Extensions

- `.tsx` para qualquer arquivo que contenha JSX, mesmo que seja um snippet de uma linha.
- `.ts` para lógica pura, custom hooks sem JSX, definições de tipo e utilitários.
- `.test.tsx` / `.test.ts` espelhando o arquivo de origem correspondente.
- Use `.jsx` apenas se o projeto deliberadamente evitar TypeScript (no nosso stack, TypeScript é o padrão obrigatório).

## Naming

- **Componentes**: `PascalCase` tanto para o símbolo quanto para o nome do arquivo (`UserCard.tsx`, exportando `UserCard`).
- **Custom hooks**: `useCamelCase` para o símbolo (`useDebounce`), nome de arquivo em kebab-case ou camelCase seguindo a convenção do projeto (`use-debounce.ts`).
- **Context**: Símbolo `<Domain>Context`, componente `<Domain>Provider`, hook de consumo `use<Domain>`.
- **Event handlers**: `handleClick`, `handleSubmit` internamente no componente; a prop que recebe o handler deve ser `onClick`, `onSubmit`.
- **Props booleanas**: Use prefixos claros: `isLoading`, `hasError`, `canSubmit` — nunca apenas `loading` ou `error` soltos para booleans.

## Component Shape

```tsx
type Props = {
  user: User;
  onSelect: (id: string) => void;
};

export function UserCard({ user, onSelect }: Props) {
  return (
    <button type="button" onClick={() => onSelect(user.id)}>
      {user.name}
    </button>
  );
}
```

- Prefira `type Props = { ... }` para formatos de props fechados do componente.
- Use `interface` apenas quando o tipo de props for estendido via declaration merging ou exposto como ponto de extensão público.
- Sempre desestruture props na lista de parâmetros da função — evite acessar `props.user` repetidamente no corpo do componente.
- Deixe o tipo de retorno implícito através da inferência do JSX (`function Foo(): ReactNode` apenas quando retornos condicionais causarem ambiguidade ao TypeScript).

## JSX

- Auto-fechamento de tags sem filhos: `<img />`, `<UserCard user={u} />`.
- Use fragments `<>...</>` em vez de wrappers `<div>` desnecessários quando nenhum elemento no DOM for requerido.
- Renderização condicional:
  - `{condition && <Foo />}` para booleans (cuidado com `0 && <Foo />` ou strings vazias — use `Boolean(condition)` ou `condition ? <Foo /> : null`).
  - Ternário para alternativa (if/else).
  - Early return para guard clauses no topo do componente.
- Nunca coloque lógica complexa multilinhas inline no JSX — extraia para uma constante antes do `return` ou para uma função auxiliar.

```tsx
// Preferível:
const greeting = user.isAdmin ? "Welcome, admin" : `Hello ${user.name}`;
return <h1>{greeting}</h1>;

// Evitar:
return <h1>{user.isAdmin ? "Welcome, admin" : `Hello ${user.name}`}</h1>;
```

## Imports

- React imports primeiro: `import { useState } from "react"`.
- Bibliotecas de terceiros (Inertia, Lucide, etc.).
- Imports absolutos do projeto (`@/components/...`, `@/actions/...`, `@/routes/...`, `@/types/...`).
- Imports relativos (`./UserItem`).
- Type-only imports explícitos: `import type { ReactNode } from "react"` — nunca misture tipos e valores no mesmo import quando o TypeScript ou ESLint `consistent-type-imports` estiver ativo.

## Hooks Discipline

- Custom hooks sempre devem iniciar com o prefixo `use`.
- Agrupe todas as chamadas de hooks no topo do componente, antes de qualquer retorno condicional ou lógica de controle.
- Não crie hooks ad-hoc desnecessários para apenas uma linha de wrapper simples — use a chamada inline se não houver reuso ou composição.

## State

- **Local primeiro** (`useState`): eleve o estado (`lift state up`) apenas quando compartilhado com irmãos/pais.
- **Props de página (Inertia)**: dados persistidos ou providos pelo backend devem vir através das props do Inertia (`usePage().props` ou props da página).
- **Context**: para dados transversais lidos por muitos componentes (tema, configurações de UI) — não utilize Context para estados com alta frequência de atualização.
- **Stores externas** (Zustand/Jotai): quando o estado precisar persistir entre trocas de página ou navegação sem recarregar o servidor.
- **Nunca duplique estado derivado**: se um dado pode ser calculado a partir de props ou outro estado, calcule-o durante a renderização.

## Class Components

- Estritamente proibidos em novos códigos.
- A única exceção válida no React é a criação de `ErrorBoundary` de nível superior (caso não esteja usando uma lib utilitária como `react-error-boundary`).

## Layout de Arquivos e Componentes

Para componentes complexos com sub-arquivos:
```
components/UserCard/
  UserCard.tsx
  UserCard.test.tsx
  index.ts              # re-export do componente
```

Para componentes menores, folhas de UI ou componentes de apresentação rápida, arquivos únicos (`components/UserCard.tsx`) utilizando Tailwind CSS v4 são a convenção preferencial.
