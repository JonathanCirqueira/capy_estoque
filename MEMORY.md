# 🧠 Project Memory & Lessons Learned (`MEMORY.md`)

> **Regra de Uso da IA**: Consulte este arquivo antes de qualquer tarefa. Sempre que o usuário corrigir um erro ou comportamento, adicione a lição aprendida abaixo no formato ultra-minimalista (1 a 2 linhas). NUNCA repita os erros listados.
> **Política de Tamanho**: Manter este arquivo conciso (máx. 25-30 regras ativas). Consolidar ou promover para as regras principais caso necessário.

---

## 🚫 O que NUNCA Fazer (Lista Negra de Padrões)

### 1. Git & Fluxo de Desenvolvimento

- 🚫 **Commits e Pushes Autônomos**: NUNCA executar `git push`. Commits são realizados exclusivamente pelos agentes por tarefa concluída em português (Conventional Commits: feat, refactor, fix, chore).
- 🚫 **Avançar de Passo sem Pedido Explícito**: NUNCA avançar para etapas seguintes (ex: Passo 3 ou 4) na branch de UI (`feat/*-frontend-ui`) sem ordem expressa do usuário; branches de UI contêm estritamente frontend com dados mockados.

### 2. Backend (Laravel & PHP)

- 🚫 **Strings Mágicas**: NUNCA usar strings soltas para status, tipos ou perfis. Usar SEMPRE PHP Backed Enums em `app/Enums/` com casts explícitos na Model e espelhamento em `resources/js/types/`.
- 🚫 **Formatação de Apresentação no Backend**: NUNCA enviar valores formatados, datas em string BR ou máscaras. O backend envia apenas dados brutos (centavos em inteiro, ISO 8601, booleans).
- 🚫 **Deleção em Cascata em Tabelas Vitais**: NUNCA usar `cascadeOnDelete()` apontando para `users` ou cadastros centrais. Usar `restrictOnDelete()` ou `nullOnDelete()`.
- 🚫 **Injeção de Actions no `__construct`**: NUNCA injetar Actions no construtor do Controller; injetar exclusivamente na assinatura do método da rota ou usar controllers invokables (`__invoke`).

### 3. Frontend: Layout & Navegação Base

- 🚫 **Layouts Duplicados e Containers Restritivos**: NUNCA envolver páginas com `<AppLayout>` no JSX (usar `Component.layout`) e NUNCA limitar com `mx-auto`/`max-w-*` na raiz da página (usar layout fluido `flex flex-1 flex-col gap-6 p-4 md:p-6`).
- 🚫 **Cabeçalhos Artesanais e Migalhas com 'Início'**: NUNCA recriar cabeçalho manual (usar SEMPRE `<PageHeader>`) e NUNCA incluir 'Início' nos breadcrumbs; iniciar diretamente pelo módulo atual.
- 🚫 **Alterações Mobile Quebrando Desktop**: NUNCA aplicar classes globais (como `w-full`) para atender pedidos mobile; manter ações em linha única no desktop (`sm:flex-nowrap sm:shrink-0`) e apenas centralizar/empilhar no mobile.
- 🚫 **Cards Aninhados com Tabelas**: NUNCA envolver tabelas que já possuem bordas e containers próprios dentro de `<Card>` externo, evitando o efeito "card dentro de card".

### 4. Frontend: Componentes de UI & Formulários

- 🚫 **Sobrescrever Layout de Botões com `className`**: NUNCA injetar classes arbitrárias de layout via `className` no `<Button>` ou `<Botao>` (preservar padding e gaps nativos); em modais de confirmação, usar botões nas pontas (`sm:justify-between`) com `<Botao>`.
- 🚫 **Cursor em Botões de Fechamento (X)**: O botão 'X' de fechar em modais e gavetas (`Dialog` e `Sheet`) deve conter SEMPRE `cursor-pointer` explícito.
- 🚫 **Selects / Comboboxes sem Limpeza e Dependentes Soltos**: Iniciar selects sem valores pré-selecionados e com opção 'X' (`clearable`); selects dependentes iniciam desabilitados até a seleção do pai e opções mostram código e nome na mesma linha (`text-xs`).
- 🚫 **Radix Popover / Combobox dentro de Dialog**: Usar sempre `modal={false}` no Popover dentro de Dialog, ancorar Portal no modal e acionar seleção no `onPointerDown` com `e.preventDefault()` e `e.stopPropagation()` no CommandItem.
- 🚫 **Barra de Ações do Rodapé Solta**: Em formulários/revisões, usar container pai `flex-1` e barra `mt-auto sticky bottom-0 z-20 -mx-4 -mb-4 md:-mx-6 md:-mb-6 p-4 md:px-6 bg-background/95 backdrop-blur-sm` (com coluna no mobile para 3+ botões e lado a lado para 2 botões).
- 🚫 **Inconsistência de Labels e Alturas em Despesas de KM**: No modal de despesas para quilometragem, manter 'Taxa de KM Vigente' com Label externo e Input de altura idêntica (h-10) aos demais campos, e usar estritamente 'Descrição da Despesa' para o campo de texto/trajeto.

### 5. Frontend: Listagens, Tabelas & Cards Mobile

- 🚫 **Menu de Três Pontos (Ações)**: NUNCA colocar bordas no botão de 3 pontos (usar `variant="ghost"`), NUNCA incluir ações ad-hoc (usar ação uniforme 'Visualizar'), e em exclusões usar hover destrutivo explícito (`text-destructive hover:bg-destructive/10`).
- 🚫 **Ações Soltas no Rodapé de Cards Mobile**: NUNCA colocar botões explícitos no rodapé de cards mobile em listagens; usar SEMPRE o menu de 3 pontos no cabeçalho do card com DropdownMenu idêntico ao desktop e status no rodapé.
- 🚫 **Barra de Filtros e Busca no Mobile**: Manter busca e botão de 3 pontos na mesma linha no mobile (`grid grid-cols-[1fr_auto]`), combobox na linha inferior e linha horizontal única no desktop (`sm:flex sm:items-center`). Rótulo de exportação é sempre 'Exportar tabela'.
- 🚫 **Tabs de Segmento e Status no Mobile**: Em seletores de abas com 2 opções no mobile, usar `grid grid-cols-2 w-full` (desktop `sm:flex sm:w-auto`), `min-w-0 px-2 py-2 gap-1.5`, textos truncados e badges `shrink-0`.

### 6. Frontend: Módulo de Reembolso & Telas Específicas

- 🚫 **Cards de Métricas do Dashboard**: Usar estritamente 'Aprovados', 'Em Aprovação' e 'Cancelados' nos títulos (sem repetir 'no Mês'), acompanhados pela descrição superior '📅 Métricas consolidadas referentes ao mês atual'; o 3º card é sempre 'Cancelados' (filtrando por Cancelado ao clicar).
- 🚫 **Tabs de Escopo e Roteiro**: Título da página fixo como 'Listagem de Reembolsos'; abas 'Gestor' (1ª) e 'Meus Reembolsos' (2ª) com largura simétrica (`sm:w-48`). Em formulários de roteiro, usar estritamente 'Dados do roteiro' e 'Despesas do roteiro' (`sm:w-56`).
- 🚫 **Rótulos Redundantes de Ação**: Usar estritamente 'Continuar' e 'Cancelar' nos menus e botões de roteiro, eliminando sufixos redundantes como 'Roteiro'.
- 🚫 **Visualização de Detalhes e Fila de Aprovação**: A fila lateral é apenas atalho para detalhes; aprovar/reprovar ocorre exclusivamente nos detalhes (com botão 'Voltar' à esquerda e 'Aprovar'/'Reprovar' à direita). Cards de Rateio e Responsável usam mesma largura (`w-full max-w-lg`).
- 🚫 **Visualização de Comprovantes em Detalhes**: Em tabelas/cards de despesas, exibir apenas ícone de olho (`Eye`, sem texto); na fase de UI, emite apenas `toast.info` avisando que a abertura será habilitada na integração com o backend (sem abrir nova aba ou criar arquivos em `public/anexos`).
- 🚫 **Configurações de Reembolso (Tipos, Aprovadores e Tabs)**: Tipos de roteiro usam o mesmo padrão dos aprovadores (apenas nome e lixeira, com botão '+ Adicionar'); tabs usam 'Parâmetros' e 'Histórico' com larguras idênticas (`sm:w-40`) e sem badges numéricas.
