# Diretrizes do Frontend (React 19 + Inertia v3 + Tailwind v4)

> **Nota:** Este arquivo (`resources/frontend-rules.md`) deve ser lido em **toda tarefa do frontend** para garantir as regras de UI/UX, arquitetura de componentes e padronização do projeto.
> **Ativação Modular de Skills (Economia de Tokens):** Ative as skills adicionais apenas quando o assunto for relevante para a tarefa:
>
> - **`inertia-react-development`**: Para páginas, formulários (`useForm`), `useHttp`, atualizações otimistas e navegação Inertia.
> - **`tailwindcss-development`**: Para estilização, layouts responsivos e classes utilitárias do Tailwind CSS v4.
> - **`tailwind-patterns`**: Para padrões avançados de design tokens e estrutura de componentes.
> - **`wayfinder-development`**: Para importação de rotas e ações tipadas do Wayfinder (`@/routes/` ou `@/actions/`).
> - **`frontend-design` / `web-design-guidelines`**: Para decisões de design, paleta de cores, acessibilidade e componentes complexos.
> - **`webapp-testing`**: Para testes de ponta a ponta (E2E) com Playwright.

---

## 🔗 Links Oficiais das Documentações

- **Inertia.js v3 (React Adapter)**: [inertiajs.com/client-side-setup#react](https://inertiajs.com/client-side-setup#react)
- **React 19 Official Docs**: [react.dev](https://react.dev/)
- **Vite (Laravel Plugin)**: [laravel.com/docs/vite](https://laravel.com/docs/vite)
- **Tailwind CSS v4 Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Laravel Wayfinder**: [github.com/laravel/wayfinder](https://github.com/laravel/wayfinder)

---

## 1. Padrões de Código React 19 & TypeScript

- **Evitar Ternários Encadeados ("Ternários Malucos")**: É estritamente PROIBIDO encadear múltiplos operadores ternários no JSX (`a ? b : c ? d : e`). Utilize objetos de mapeamento constante (`Record<Type, Value>`), funções auxiliares ou retornos precoces (_early returns_).
- **Sem Strings Mágicas & Sem Enums Nativos do TS**: Não utilize `enum` nativo do TypeScript (causa overhead e complica a serialização de APIs). Prefira **String Unions** (`type Status = 'ativo' | 'inativo'`) combinadas com objetos de mapeamento constante (`as const`).
- **Nomenclatura (Portuguese-First)**:
    - **Interface & Conteúdo**: 100% em Português (PT-BR).
    - **Código do Projeto**: Variáveis, estados (`useState`), componentes, handlers e rotas DEVEM ser em Português com `camelCase` (ex: `const [veiculoSelecionado, setVeiculoSelecionado] = useState(null)`).
    - **Exceções em Inglês**: Apenas para APIs do React/Inertia e termos universais da indústria (`loading`, `onClick`, `disabled`, `useForm`, `data`, `props`).
    - **Props do Backend**: Consumir as chaves da API exatamente como vêm do backend (ex: `veiculo.placa_mercosul`).

---

## 2. Formulários, Inertia v3 e Wayfinder

- **Tipagem Estrita no `useForm`**: O hook `useForm` (do Inertia ou Precognition) DEVE SEMPRE receber um tipo genérico exato (ex: `useForm<VeiculoFormData>({ ... })`) para garantir autocomplete e tipagem segura em `form.data` e `form.errors`.
- **Validação com Precognition**: Executar disparo de validação no evento `onBlur` via `form.validate(field)`.
- **Zero Hardcoded URLs**: PROIBIDO usar URLs fixas em strings (ex: `href="/veiculos"`). Use OBRIGATORIAMENTE os objetos tipados do Wayfinder importando de `@/routes/` ou `@/actions/` (ex: `href={veiculosRoutes.index().url}`).
- **Formatação de Dados no Frontend**: O backend envia dados puros e brutos (datas ISO, números sem máscara, booleans). A formatação para exibição na tela (moedas, máscaras, datas) é responsabilidade EXCLUSIVA do React.
- **Fallback Padrão para Dados Nulos**: Utilize `'N/A'` como fallback visual para dados ausentes ou nulos. Exemplo: `{formatarData(veiculo.criado_em) ?? 'N/A'}`.

---

## 3. Design, Componentes & Tailwind CSS v4

- **Tailwind Idiomático**: PROIBIDO o uso de valores arbitrários em colchetes (ex: `w-[300px]`, `p-[18px]`) quando houver classe padrão. Utilize a escala oficial do framework (`w-72`, `p-4`, `rounded-xl`).
- **Fidelidade ao Tema & Purple Ban**: PROIBIDO usar roxo/violeta ou gradientes clichês de IA como cor primária. Derive todas as cores das variáveis CSS do `app.css`.
- **Reaproveitamento de Componentes (DRY)**: Reutilizar componentes base de `resources/js/components/ui/` (`<Input />`, `<Select />`, `<DatePicker />`, `<DataTable />`, `<BaseModal />`). PROIBIDO usar a tag nativa `<input>` diretamente (exceto para inputs de arquivo ocultos `<input type="file" className="hidden" />`).
- **Feedback & Cursor**: Todo elemento clicável (botões, links, abas) DEVE possuir a classe `cursor-pointer`.
- **Empty States & Skeletons**: Nunca exiba telas em branco. Implemente estados vazios informativos e esqueletos animados (_skeletons_) durante o carregamento.

---

## 4. Verificação de Qualidade Obrigatória

- **Execução do `composer verify`**: Ao finalizar qualquer tarefa no frontend ou backend, é OBRIGATÓRIO executar o comando `composer verify` (e validar a compilação do Vite) para garantir que todo o código passou sem erros antes de concluir a entrega.

---

## 🛡️ Checklist de Entrega do Frontend

Antes de finalizar qualquer alteração no frontend, verifique:

1. [ ] **Sem Ternários Múltiplos**: Limpou condicionais complexas usando objetos de mapeamento ou funções?
2. [ ] **Sem Strings Mágicas / Enums TS**: Utilizou String Unions (`'ativo' | 'inativo'`) com mapeamento `as const`?
3. [ ] **Nomenclatura PT-BR**: Estados, funções e componentes criados por você estão em Português com `camelCase`?
4. [ ] **`useForm` Tipado**: O formulário foi declarado com genérico `useForm<FormData>`?
5. [ ] **Wayfinder**: Todas as rotas usam os objetos importados de `@/routes/` ou `@/actions/` sem URLs estáticas?
6. [ ] **Tailwind Idiomático**: Eliminou colchetes de valores arbitrários (`w-[100px]`) e respeitou o Purple Ban?
7. [ ] **Componentes Base**: Usou o `<Input />` e componentes reutilizáveis de `components/ui/` em vez de HTML nativo solto?
8. [ ] **Cursor Pointer & Feedback**: Todos os botões e itens clicáveis possuem `cursor-pointer`? Os estados vazios usam fallback `'N/A'`?
9. [ ] **Verificação Final (Obrigatório)**: Executou o comando `composer verify` para garantir que o código passou em todas as verificações antes de concluir?
