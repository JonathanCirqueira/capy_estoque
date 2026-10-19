---
trigger: glob
globs: "resources/**/*.{ts,tsx,js,jsx}"
---

# React Patterns

> Padrões de arquitetura, estruturação de componentes, formulários e fluxo de dados para React 19 no ecossistema Inertia.js v3 e TypeScript.

## Container / Presentational Split

- **Container Components**: Responsáveis pela busca e orquestração de dados, mutações e regras de fluxo. Não se preocupam com estilos complexos ou detalhes de renderização visual.
- **Presentational Components**: Componentes puros que recebem dados e callbacks exclusivamente via `props`. Fáceis de testar em isolamento e reutilizar.

```tsx
// Container — orquestra estado e mutações
export function UserListContainer({ initialUsers }: { initialUsers: User[] }) {
  const [filter, setFilter] = useState("");
  const filteredUsers = useMemo(
    () => initialUsers.filter((u) => u.name.toLowerCase().includes(filter.toLowerCase())),
    [initialUsers, filter]
  );

  return <UserTable users={filteredUsers} filter={filter} onFilterChange={setFilter} />;
}

// Presentational — apenas renderiza UI e dispara eventos
export function UserTable({ users, filter, onFilterChange }: UserTableProps) {
  return (
    <div>
      <input value={filter} onChange={(e) => onFilterChange(e.target.value)} />
      <ul>{users.map((user) => <li key={user.id}>{user.name}</li>)}</ul>
    </div>
  );
}
```

## Árvore de Decisão de Localização de Estado

1. **Usado por um único componente?** → `useState` interno.
2. **Usado por componentes irmãos ou pai + filhos próximos?** → Eleve o estado (`lift state up`) para o ancestral comum mais próximo e passe via props.
3. **Dados fornecidos pelo backend / rotas do Laravel?** → Receba via props da página Inertia (`Inertia::render()`) com tipagem estrita do Wayfinder.
4. **Estado global compartilhado por ramos distantes com baixa frequência de alteração (tema, auth básica, locale)?** → React Context.
5. **Atualizações de altíssima frequência ou persistência global entre páginas sem recarregar o servidor?** → Store externa (Zustand).

*Nunca utilize Context para estados que sofram mutações contínuas e frequentes, pois todos os consumidores serão re-renderizados a cada alteração.*

## Suspense + Error Boundaries

Sempre combine `Suspense` com um `ErrorBoundary` envolvendo o bloco correspondente. Isso garante tratamento elegante tanto do estado de carregamento quanto de falhas:

```tsx
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

<ErrorBoundary fallback={<ErrorAlert message="Não foi possível carregar os dados" />}>
  <Suspense fallback={<TableSkeleton />}>
    <AsyncDataTable />
  </Suspense>
</ErrorBoundary>
```

- Posicione os limites de `Suspense` e `ErrorBoundary` próximos ao conteúdo que depende dos dados, permitindo carregamento progressivo e evitando que uma falha isolada quebre a página inteira.

## Formulários

### 1. Formulários no Ecossistema Inertia.js (Padrão Principal)
Para formulários conectados ao backend Laravel, prefira o hook `useForm` do Inertia ou integração com Wayfinder:

```tsx
import { useForm } from "@inertiajs/react";
import storeUserAction from "@/actions/App/Http/Controllers/UserController";

export function CreateUserForm() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(storeUserAction.url(), {
      onSuccess: () => reset(),
    });
  };

  return (
    <form onSubmit={submit}>
      <input value={data.name} onChange={(e) => setData("name", e.target.value)} />
      {errors.name && <span className="text-red-500">{errors.name}</span>}
      <button type="submit" disabled={processing}>Salvar</button>
    </form>
  );
}
```

### 2. Não-controlados (React 19 Form Actions)
Para formulários simples ou quando a submissão via `FormData` nativa for suficiente:
```tsx
export function QuickSearchForm({ onSearch }: { onSearch: (query: string) => void }) {
  const handleSubmit = (formData: FormData) => {
    const query = String(formData.get("q") ?? "");
    onSearch(query);
  };

  return (
    <form action={handleSubmit}>
      <input name="q" placeholder="Buscar..." required />
      <button type="submit">Buscar</button>
    </form>
  );
}
```

### 3. Controlados
Utilize inputs estritamente controlados (`value` + `onChange`) quando o valor digitado formatar máscaras em tempo real ou habilitar dinamicamente outros elementos da interface.

## Listas e Keys

- A prop `key` deve ser estável e exclusiva entre os irmãos da lista (ex: `user.id`).
- **Nunca use o índice do array (`index`) como `key`** em listas que sofram ordenação, filtragem, inserção ou remoção. O uso de índice faz com que o estado interno dos componentes filhos se conecte ao elemento errado na reorganização do DOM.

## Composição sobre Herança

- Utilize a prop `children` para composição por slots.
- Use props com funções de renderização (`renderItem={(item) => <CustomCard data={item} />}`) quando a personalização de apresentação for necessária.
- Divida componentes grandes em partes compostas:

```tsx
// Exemplo de Compound Components (Tabs)
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Visão Geral</Tabs.Trigger>
    <Tabs.Trigger value="settings">Configurações</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview"><OverviewPanel /></Tabs.Content>
  <Tabs.Content value="settings"><SettingsPanel /></Tabs.Content>
</Tabs>
```

## Portais (`createPortal`)

Utilize `createPortal` para elementos flutuantes (Modais, Dialogs, Tooltips, Toasts, Dropdowns) que precisam escapar de contextos de empilhamento com `overflow: hidden` ou restrições de `z-index`. Renderize para um elemento estável no DOM montado no root da aplicação.

## Refs no React 19

No React 19, componentes de função aceitam a prop `ref` diretamente como qualquer outra prop — o uso de `forwardRef` não é mais necessário em novos códigos:

```tsx
type InputProps = React.ComponentProps<"input"> & {
  label: string;
  ref?: React.Ref<HTMLInputElement>;
};

export function TextInput({ label, ref, ...props }: InputProps) {
  return (
    <label>
      <span>{label}</span>
      <input ref={ref} {...props} />
    </label>
  );
}
```
