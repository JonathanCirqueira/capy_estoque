---
name: frontend-listagem
description: Padronização e geração de páginas e tabelas de listagem completas no Starter Kit com React 19, Inertia.js v3, Tailwind CSS v4, StatusTabs, busca, grid de filtros dinâmico, ordenação, exportação e cards mobile agnósticos.
allowed-tools: Read, Write, Edit
version: 1.2
priority: HIGH
---

# Tabela de Listagem - Padrão de Engenharia de Listagens

> **MANDATÓRIO PARA TELAS DE LISTAGEM:**
> Toda nova tela de listagem, consulta ou gestão tabular **DEVE** seguir estritamente o blueprint canônico em `.agents/templates/frontend/listagem.md`.

---

## 🎯 Arquivos de Referência do Blueprint

Antes de gerar ou alterar qualquer listagem, inspecione:

1. **Blueprint Canônico de Listagem:** `.agents/templates/frontend/listagem.md`
2. **Cabeçalho Compartilhado:** `resources/js/components/page-header.tsx`
3. **Cabeçalho Ordenável:** `resources/js/components/ui/sortable-table-head.tsx`

---

## 📐 Anatomia Canônica da Página

```
[ 1. PageHeader: Título + Descrição + Ação/Botão à direita (fora do card)               ]
[ 2. Card Container Único (bg-card border-border/50 rounded-2xl md:rounded-3xl overflow-hidden): ]
  ├── Topo: StatusTabs (sem padding externo, fundo sutil bg-muted/30, encostando nas bordas do card)
  └── Área Interna de Conteúdo (p-4 md:p-6):
      ├── Linha 1 de Filtros: Input de Busca (flex-1) + Botão 3 Pontinhos "Exportar" (ghost sem borda)
  ├── Linha 2 de Filtros: Grid Dinâmico de Comboboxes (ocupa 100% da largura)
  ├── Tabela Desktop (md:block): Colunas Ordenáveis (UPPERCASE) + Status + Ações (Editar)
  ├── Cards Mobile (md:hidden): Cards estruturados limpos, sem ícones de domínio
  ├── Estado Vazio: Ícone FolderOpen + Mensagem contextual
  └── Paginação: Componente Paginacao (itens por página + controles de página)
```

---

## 📋 Regras de Implementação Obrigatórias

### 1. Cabeçalho Padronizado (`PageHeader`)
- Importar de `@/components/page-header`.
- **PROIBIDO:** Criar divs manuais com flexbox para o título e botão.
- Usar as propriedades `title`, `description` e `action` (com `label` e `onClick` ou `href`):
  ```tsx
  <PageHeader
      title="Gestão de Usuários"
      description="Controle os usuários, cargos e departamentos com acesso ao sistema."
      action={{
          label: 'Cadastrar',
          onClick: handleCadastrar,
      }}
  />
  ```

### 2. Card Container Único e `StatusTabs`
- Todo o conteúdo de filtros, listagem e paginação fica dentro de um único container com cantos arredondados e corte de overflow:
  `<div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs md:rounded-3xl">`
- O `StatusTabs` fica obrigatoriamente **DENTRO** deste card, diretamente no topo, **sem padding externo** ao seu redor, encostando nas bordas superior e laterais do card.
- O componente `StatusTabs` possui fundo sutil cinza claro (`bg-muted/30`) e borda inferior (`border-b border-border/40`), garantindo o contraste exato com o fundo do card.
- **ÁREA DE FILTROS COM PADDING EXCLUSIVO:**
  - Apenas o bloco de filtros possui padding: `<div className="flex flex-col gap-3.5 p-4 md:p-6">`.
  - Este container abriga a linha superior (busca + 3 pontinhos) e a linha inferior (grid de comboboxes).
- **TABELA E PAGINAÇÃO BORDA A BORDA (SEM PADDING EXTERNO):**
  - **PROIBIDO** envolver a tabela ou a paginação em containers com padding (`p-4`, `p-6` ou `gap-4`). A tabela e a paginação são filhas diretas do card container principal.
  - A tabela desktop (`<Table>`) e os cards mobile (`<div className="flex flex-col gap-3 px-4 pb-4 md:hidden">`) estendem-se de borda a borda (100% da largura). O efeito de hover das linhas da tabela e as bordas divisórias tocam as extremidades laterais do card container.
  - A paginação (`<Paginacao>`) fica no rodapé do card, também de borda a borda, com sua própria borda superior (`border-t border-border/40 bg-muted/5 p-5`).
- Nunca renderizar o `StatusTabs` solto fora do card ou envolvido por paddings que criem margens brancas ao redor das abas.
- **CORES CANÔNICAS DAS ABAS (`color`):**
  - **MANDATÓRIO:** Cada aba no array `statusTabs` DEVE receber a propriedade `color` (ou `colorTheme`) correspondente ao seu papel temático:
    - `todos` (ou neutro): `color: 'primary'`
    - Ativo / Sucesso / Disponível: `color: 'success'`
    - Pendente / Atenção / Em Revisão / Baixo Estoque: `color: 'warning'`
    - Inativo / Destrutivo / Cancelado / Esgotado: `color: 'destructive'`
    - Em Análise / Informativo: `color: 'info'`
  - **PROIBIDO:** Deixar abas de status sem o `color` temático informado no prompt, pois isso causaria abas cinzas desvinculadas das cores dos badges da tabela.
- Propriedades obrigatórias: `tabs` (com `id`, `label`, `count`, `color`), `activeTab` e `onChange`:
  ```tsx
  const statusTabs: StatusTabItem[] = useMemo(() => [
      { id: 'todos', label: 'Todos', count: contadoresStatus.todos, color: 'primary' },
      { id: 'ativo', label: 'Ativos', count: contadoresStatus.ativo, color: 'success' },
      { id: 'pendente', label: 'Pendentes', count: contadoresStatus.pendente, color: 'warning' },
      { id: 'inativo', label: 'Inativos', count: contadoresStatus.inativo, color: 'destructive' },
  ], [contadoresStatus]);

  <StatusTabs
      tabs={statusTabs}
      activeTab={abaStatus}
      onChange={(tab) => {
          setAbaStatus(tab);
          setPaginaAtual(1);
      }}
  />
  ```

### 3. Filtros Superiores (Busca com Lupa + Exportar)
- **Input de Pesquisa OBRIGATORIAMENTE com Ícone de Lupa (`Search`):**
  - **MANDATÓRIO:** O campo de busca DEVE sempre conter o ícone de lupa (`Search` de `lucide-react`) visível no canto esquerdo.
  - **Como implementar:** Passar a prop nativa `leftIcon={<Search className="size-4 text-muted-foreground" />}` diretamente para o `<Input>` importado de `@/components/ui/input`.
  - **PROIBIDO:** NÃO envolver o `<Input>` em uma `div relative` com `<Search className="absolute ...">` externo. O `<Input>` possui fundo opaco (`bg-background`) e renderiza seu próprio container interno, o que cobre e esconde o ícone posicionado externamente.
  - O `<Input>` com `leftIcon` já calcula automaticamente o espaçamento interno ideal (`pl-10`) e posiciona a lupa com `z-10 pointer-events-none`.
  - **Código canônico obrigatório:**
    ```tsx
    <div className="flex-1">
        <Input
            type="search"
            placeholder="Filtrar por nome ou e-mail..."
            value={termoPesquisa}
            onChange={(e) => {
                setTermoPesquisa(e.target.value);
                setPaginaAtual(1);
            }}
            leftIcon={<Search className="size-4 text-muted-foreground" />}
            className="h-10 rounded-xl border-input bg-background dark:bg-card text-sm shadow-2xs"
        />
    </div>
    ```
- **Menu de Opções (3 pontinhos ao lado da busca):**
  - Botão trigger com visual limpo **sem borda e sem sombra**: `variant="ghost" size="icon"` com `className="h-9 w-9 shrink-0 cursor-pointer rounded-xl border-0 shadow-none text-muted-foreground hover:bg-muted/60 hover:text-foreground"`.
  - Ícone de 3 pontinhos horizontais (`MoreHorizontal`).
  - Label do grupo no DropdownMenu: `OPÇÕES`.
  - **Apenas uma ação:** `Exportar` (com ícone `Download`).
  - **PROIBIDO:** Não adicionar botão de limpar filtros nem no menu nem fora dele.
  - **PROIBIDO:** Não colocar bordas (border de outline) no botão dos 3 pontinhos. Deve ser apenas o ícone limpo.

### 4. Grid de Filtros Secundários
- Organizar os Comboboxes/Selects em CSS Grid ocupando 100% da largura:
  - 1 filtro: `grid-cols-1`
  - 2 filtros: `grid-cols-1 sm:grid-cols-2`
  - 3 filtros: `grid-cols-1 sm:grid-cols-3`
  - 4 filtros: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Todo combobox deve ter `clearable`, `placeholder`, `searchPlaceholder` e resetar a página para `1` ao mudar o valor.

### 5. Tabela Desktop (`md:block`)
- **Cabeçalho Ordenável:** Usar `SortableTableHead` de `@/components/ui/sortable-table-head`.
- **Rótulos em MAIÚSCULO vs Paridade de Campos:** Todos os títulos de colunas no `<TableHeader>` devem ser em maiúsculo (ex: `label="NOME COMPLETO"`). **Contudo**, o identificador do campo e a chave de ordenação **DEVEM ser exatamente o nome canônico do backend** (`coluna="nome"` e `item.nome`, **NUNCA** `nomeCompleto`).
- **PROIBIDO Coluna `#`:** Não incluir coluna de índice numérico.
- **Linha do Cabeçalho:** `<TableRow className="border-b border-border/50 bg-muted/10 hover:bg-muted/10">`
- **Linha de Dados:** `<TableRow className="group/row border-b border-border/40 transition-colors duration-200 hover:bg-muted/20">`
- **Alinhamento e Paddings das Células (Borda a Borda com Alinhamento Perfeito aos Filtros):**
  - **Primeira Coluna (Head e Cell):** `pl-5 pr-3 py-3 md:pl-6 xl:pl-6` (alinha perfeitamente com a margem do campo de busca).
  - **Colunas Intermediárias (Head e Cell):** `px-3 py-3`
  - **Coluna de Status:** `<SortableTableHead className="w-24 px-3 py-3 text-center xl:w-28" />` e `<TableCell className="w-24 px-3 py-3 text-center whitespace-nowrap xl:w-28" />`
  - **Coluna AÇÕES (Head e Cell):**
    - Head: `<TableHead className="w-12 pl-3 pr-5 py-3 text-right font-display text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase md:pr-6 xl:w-16 xl:pr-6">AÇÕES</TableHead>`
    - Cell: `<TableCell className="w-12 pl-3 pr-5 py-3 text-right whitespace-nowrap md:pr-6 xl:w-16 xl:pr-6">`
    - Menu de 3 pontinhos contendo **apenas "Editar"** (`Pencil`), disparando `onEditar(item)`.
- **Tipografia Uniforme:** Todas as células de dados usam tamanho `text-sm font-normal`.
- **REGRA DE NEGRITO:** **PROIBIDO negrito em qualquer coluna de dados**, exceto **EXCLUSIVAMENTE no Badge de Status** (`font-bold text-[10px] uppercase`).

### 6. Cards Mobile (`md:hidden`)
- Container: `<div className="flex flex-col gap-3 px-4 pb-4 md:hidden">` (sem padding superior adicional para não dobrar o espaço após os filtros).
- Visível apenas em telas menores (`md:hidden`).
- Topo com identificador/código + Badge de status + 3 pontinhos com `Editar`.
- Metadados em grid (`bg-muted/40 p-3 rounded-xl border border-border/30 grid grid-cols-2 gap-2.5`):
  - Rótulo neutro: `text-[10px] font-semibold uppercase tracking-wider text-muted-foreground`
  - Valor: `mt-0.5 truncate text-sm font-normal text-foreground`
- **PROIBIDO ÍCONES DE DOMÍNIO:** Não adicionar ícones específicos de entidade (prédios, maletas, pessoas) no corpo dos cards mobile. O padrão visual deve ser 100% neutro e estruturado em pares rótulo/valor.

### 7. Tokens Canônicos de Cores de Status
> ⚠️ **NUNCA crie cores de status manuais** (como `dark:border-amber-800` ou `dark:bg-amber-950`). Use sempre as classes do tema do starter kit (`/15` para fundo e `/30` para borda):

| Tipo de Status | Exemplos | Propriedade `color` na StatusTab | Classes Canônicas do Badge da Tabela |
| :--- | :--- | :--- | :--- |
| **Neutro / Geral** | `todos` | `'primary'` | `bg-muted text-muted-foreground border-border/40` |
| **Sucesso** | `ativo`, `aprovado`, `disponivel` | `'success'` | `bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-200` |
| **Atenção** | `pendente`, `baixo_estoque`, `revisao` | `'warning'` | `bg-warning/15 text-amber-900 border-warning/30 dark:text-amber-200` |
| **Destrutivo** | `inativo`, `cancelado`, `esgotado` | `'destructive'` (ou `'error'`) | `bg-destructive/15 text-destructive border-destructive/30 dark:bg-destructive/15 dark:text-destructive dark:border-destructive/30` |
| **Informativo** | `em_analise`, `processando`, `rascunho` | `'info'` | `bg-info/15 text-info-foreground border-info/30 dark:text-info` |

### 8. Paginação Canônica (`Paginacao`)
- Utilizar sempre o componente canônico `@/components/paginacao`.
- A paginação fica como filha direta do card container, alinhada de borda a borda no rodapé com `border-t border-border/40 bg-muted/5 p-5`.
- **Cálculo obrigatório na página:**
  ```tsx
  const totalItens = itensFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
  const inicioIndice = (paginaAtual - 1) * itensPorPagina;
  const fimIndice = Math.min(inicioIndice + itensPorPagina, totalItens);
  const itensPaginados = itensFiltrados.slice(inicioIndice, fimIndice);
  ```
- **Invocação completa de propriedades:**
  ```tsx
  <Paginacao
      paginaAtual={paginaAtual}
      totalPaginas={totalPaginas}
      onPaginaAlterada={setPaginaAtual}
      mostrarDe={totalItens > 0 ? inicioIndice + 1 : 0}
      mostrarA={fimIndice}
      mostrarTotal={totalItens}
      tipoEntidade="[entidade_plural]"
      itensPorPagina={itensPorPagina}
      onItensPorPaginaAlterado={(novosItens) => {
          setItensPorPagina(novosItens);
          setPaginaAtual(1);
      }}
  />
  ```
- **Visual Canônico Exato:**
  - **Esquerda:** `MOSTRANDO X DE Y DE Z [ENTIDADE] • EXIBIR [ 10 v ] POR PÁGINA` em maiúsculo, tipografia `text-[10px] font-bold tracking-widest text-muted-foreground/75`.
  - **Direita:** `< ANTERIOR` em texto neutro discreto, botão da página ativa em círculo azul escuro `rounded-full bg-primary text-primary-foreground font-bold size-8`, botões inativos `rounded-full text-foreground`, e `PRÓXIMA >`.

### 9. Anti-Duplicação de Layout (Inertia v3)
- **PROIBIDO:** Nunca importar ou envolver o JSX da página com `<AppLayout>` ou `<AppSidebarLayout>`.
- O layout já é aplicado globalmente pelo Inertia em `app.tsx`. Envolver novamente causa duplicação de header, sidebar toggle, breadcrumbs e botão de tema.
- A página deve retornar diretamente um Fragment `<>` com `<Head title="..." />` e a `div` com `flex flex-1 flex-col gap-6 p-4 md:p-6`.
- Breadcrumbs são definidos exclusivamente no final do arquivo:
  ```tsx
  MinhaPagina.layout = {
      breadcrumbs: [
          {
              title: 'Título da Página',
              href: '/rota',
          },
      ],
  };
  ```

### 10. Integração Obrigatória com a Sidebar (`AppSidebar`) e Rotas
- **MANDATÓRIO:** Toda nova listagem gerada **DEVE** ser automaticamente adicionada ao menu de navegação lateral (`AppSidebar`) e às rotas (`routes/web.php`):
  1. **Rota:** Declarar em `routes/web.php` dentro do grupo autenticado:
     ```php
     Route::inertia('[entidade_plural]', '[entidade_plural]/index')->name('[entidade_plural].index');
     ```
  2. **Sidebar:** Adicionar o item no array `mainNavItems` em `resources/js/components/app-sidebar.tsx`:
     - Título conforme o nome solicitado no prompt (ex: `Usuários`).
     - Rota correspondente (ex: `href: '/usuarios'` ou route Wayfinder).
     - Ícone do `lucide-react` semanticamente compatível (ex: `Users`, `Boxes`, `FileText`, `Truck`, etc.).

---

## 🚀 Fluxo de Geração

Ao criar uma nova listagem a partir de um prompt:
1. **Tipos (`types.ts`):** Definir interface com os campos e tipagem de filtros e ordenação.
2. **Tabela (`tabela-[entidade].tsx`):** Clonar `table-template.tsx`, ajustar colunas em UPPERCASE, status badge e cards mobile sem ícones.
3. **Página (`index.tsx`):** Clonar `page-template.tsx`, usar `<PageHeader>`, posicionar `<StatusTabs>` dentro do card e montar grid de Comboboxes.
4. **Rotas e Navegação (MANDATÓRIO):**
   - Adicionar a rota em `routes/web.php`.
   - Registrar imediatamente o link no `AppSidebar` (`resources/js/components/app-sidebar.tsx`) com o nome e ícone apropriados.
5. **Validação:** Rodar `npm run build` e verificar integridade.
