---
trigger: glob
globs: "resources/**/*.{ts,tsx,js,jsx}"
---

# React Hooks

> Práticas essenciais, disciplina e armadilhas comuns para hooks do React (`useState`, `useEffect`, `useMemo`, `useCallback`, hooks customizados e novidades do React 19).

## Rules of Hooks

1. Chame hooks **apenas no nível superior** de um componente de função ou de outro hook customizado.
2. **Nunca** chame hooks dentro de loops, condições (`if`), funções aninhadas ou após `return` antecipado.
3. Garanta que sejam chamados sempre na **mesma ordem** a cada renderização.
4. Use apenas dentro de componentes React ou funções iniciadas com o prefixo `use`.

```tsx
// ERRADO: hook condicional
function UserProfile({ isLoaded }: { isLoaded: boolean }) {
  if (!isLoaded) return null;
  const [profile, setProfile] = useState<Profile | null>(null); // Violação das regras de hooks!
  return <div>{profile?.name}</div>;
}

// CORRETO: hook incondicional no topo, condição dentro ou no render
function UserProfile({ isLoaded }: { isLoaded: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  if (!isLoaded) return null;
  return <div>{profile?.name}</div>;
}
```

## `useEffect` — Quando NÃO Usar

O `useEffect` existe para sincronização com sistemas externos (APIs do navegador, subscriptions, bibliotecas de terceiros). Ele **NÃO** deve ser usado para:

- **Estado derivado**: calcule diretamente durante a renderização.
- **Transformação de dados para renderização**: calcule durante a renderização.
- **Resetar estado quando uma prop muda**: use a prop `key` no componente pai ou derive o valor.
- **Notificar pais sobre alterações de estado**: chame o callback diretamente no manipulador de eventos (`onChange`, `onClick`).
- **Inicializar singletons da aplicação**: execute no escopo do módulo ou na inicialização inicial do app (`app.tsx`).

```tsx
// ERRADO: useEffect para sincronizar estado derivado
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// CORRETO: calcular durante o render
const fullName = `${first} ${last}`;
```

## Dependency Arrays

- Sempre inclua todos os valores reativos utilizados dentro do efeito ou callback.
- Mantenha `react-hooks/exhaustive-deps` ativo — nunca desabilite o lint sem uma justificativa explícita e documentada.
- Se a lista de dependências ficar muito extensa, o efeito provavelmente tem responsabilidades demais — divida-o em efeitos menores e focados.
- Envolva funções em `useCallback` apenas quando a função for passada como dependência de outro hook ou para um componente filho envelopado com `React.memo`.

## Cleanup

Toda subscrição, timer, listener de evento ou requisição em trânsito dentro de um `useEffect` deve retornar sua respectiva função de limpeza (`cleanup`):

```tsx
// Limpeza de requisição / AbortController
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then((res) => res.json())
    .then(setData)
    .catch((err) => {
      if (err.name !== "AbortError") handleError(err);
    });

  return () => controller.abort();
}, [url]);

// Limpeza de intervalos e listeners
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);
```
*A ausência de cleanup provoca race conditions, memory leaks e updates em componentes desmontados.*

## `useMemo` e `useCallback` — Quando Realmente Valem a Pena

Postura padrão: **não memoize prematuramente**. Use `useMemo` / `useCallback` somente quando:
1. O valor/função for passado para um componente filho envelopado com `React.memo` cuja estabilidade referencial é mandatória.
2. O valor/função for dependência de outro hook (`useEffect`, `useMemo`, `useCallback`).
3. O cálculo for comprovadamente pesado em termos computacionais (meça antes de supor).

Memoização excessiva sem necessidade apenas polui o código, gasta memória adicional e pode ser mais lenta do que a própria recomputação.

## Custom Hooks

Extraia a lógica para um custom hook quando:
- A mesma sequência reativa (estados + efeitos + valores derivados) se repetir em 2 ou mais componentes.
- A lógica possuir um propósito claro e isolado (`useDebounce`, `useOnClickOutside`, `useLocalStorage`).
- Houver necessidade de testar a lógica comportamental de forma independente.

NÃO extraia quando:
- For utilizado em um único lugar sem perspectiva de reuso ou complexidade justificável.
- For apenas um alias de uma linha para `useState` ou `useRef`.

```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

## `useState` Patterns

- **Inicialização sob demanda (Lazy Initial State)**: Para valores iniciais computacionalmente caros, passe uma função pura: `useState(() => expensiveCalculation(prop))`.
- **Atualizador funcional**: Quando o próximo estado depender do anterior, use a forma de callback `setCount(prev => prev + 1)` — nunca `setCount(count + 1)` em contextos assíncronos ou com batching.
- **Agrupamento de estados**: Agrupe propriedades em um único objeto de estado apenas se elas sempre mudarem juntas; caso contrário, mantenha estados separados.
- Para máquinas de estado ou transições interdependentes com mais de 3 variáveis relacionadas, utilize `useReducer`.

## `useRef` Patterns

- Use referências DOM para manipulações imperativas que a árvore React não controla diretamente (foco, scroll, canvas, integração com bibliotecas externas).
- Use como container mutável para dados que não disparam re-renderizações (IDs de timer, valores anteriores, flags de controle).
- **Nunca leia ou altere `ref.current` durante a fase de renderização** — apenas em efeitos ou event handlers.

## `useSyncExternalStore`

Para sincronizar com stores externas fora do ciclo de vida React (APIs do navegador, eventos customizados, WebSockets, stores externas):

```tsx
const isOnline = useSyncExternalStore(
  (callback) => {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
      window.removeEventListener("online", callback);
      window.removeEventListener("offline", callback);
    };
  },
  () => navigator.onLine,
  () => true // snapshot no servidor / SSR
);
```

## React 19 Additions

- **`use()`**: Permite desembrulhar Promises e Contextos diretamente inline; é o único hook que pode ser chamado condicionalmente após guards.
- **`useActionState`**: Gerencia o estado de ações assíncronas e formulários (substitui e unifica o antigo `useFormState`).
- **`useFormStatus`**: Expõe o estado de submissão do formulário pai (`pending`, `data`, `method`, `action`) sem necessidade de prop drilling.
- **`useOptimistic`**: Permite renderizar atualizações otimistas na interface imediatamente enquanto uma ação no servidor é processada.
- **`useTransition`**: Marca transições de estado como não urgentes, mantendo a interface interativa durante navegações e updates de lista.
- **`ref` como prop normal**: Componentes de função recebem `ref` diretamente como prop sem necessidade de `forwardRef`.

## Armadilha do Stale Closure

Handlers assíncronos (`setTimeout`, `Promise`, event listeners) capturam valores do escopo da renderização em que foram criados. Soluções:
1. Usar a forma de atualização funcional do `setState` (`setCount(c => c + 1)`).
2. Manter dependências atualizadas no array do `useEffect`.
3. Sincronizar o valor volátil com um `useRef` para leitura sempre fresca em callbacks assíncronos.
