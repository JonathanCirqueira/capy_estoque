---
name: frontend-cadastro
description: Padronização e geração de formulários e telas de cadastro no Starter Kit com React 19, Inertia.js v3, Tailwind CSS v4, espelhamento de Enums em TypeScript, com decisão arquitetural automática entre Modal (até 8 campos) e Página Completa (mais de 8 campos).
allowed-tools: Read, Write, Edit
version: 1.2
priority: HIGH
---

# Formulário de Cadastro - Padrão Canônico de Engenharia

> **MANDATÓRIO PARA CRIAÇÃO E EDIÇÃO DE ENTIDADES:**
> Todo novo formulário de cadastro, criação ou edição no sistema **DEVE** seguir estritamente o blueprint canônico em `.agents/templates/frontend/cadastro.md`.

---

## 🎯 Regra de Ouro Arquitetural: O Divisor de Águas (8 Campos)

Antes de gerar qualquer tela ou componente de cadastro, conte a quantidade total de campos do formulário:

| Quantidade de Campos | Abordagem Obrigatória | Blueprint Canônico | Como Acionar na Listagem |
| :--- | :--- | :--- | :--- |
| **Até 8 Campos (`<= 8`)** | **MODAL (`Dialog`)** | `.agents/templates/frontend/cadastro.md` (Skeleton 1) | `<PageHeader action={{ label: 'Cadastrar', onClick: () => setModalAberto(true) }} />` |
| **Mais de 8 Campos (`> 8`)** | **PÁGINA COMPLETA CONTÍNUA** | `.agents/templates/frontend/cadastro.md` (Skeleton 2) | `<PageHeader action={{ label: 'Cadastrar', href: '/[entidade]/cadastrar' }} />` |

---

## 📁 Arquivo de Referência do Blueprint

1. **Blueprint Canônico de Cadastro Frontend:** `.agents/templates/frontend/cadastro.md`
2. **Cabeçalho Compartilhado:** `resources/js/components/page-header.tsx`
3. **Botão Padronizado:** `resources/js/components/botao.tsx`

---

## 📐 Anatomia Canônica das Duas Modalidades

### Modal de Cadastro (`<= 8` campos)
```
[ Dialog: Tela Cheia no Mobile (fixed inset-0) | Centralizado no Desktop (sm:max-w-3xl sm:rounded-2xl) ]
  ├── Header (border-b p-4): Ícone com badge arredondado (size-10 bg-primary/10 text-primary) + Título + Descrição
  ├── Body com Scroll (p-4):
  │     └── Grid Responsivo (grid grid-cols-1 sm:grid-cols-2 gap-4) com Labels + Inputs/Comboboxes + Mensagens de Erro
  └── Footer Fixo (DialogFooter, border-t bg-muted/20 p-4 shrink-0 flex items-center justify-between):
        ├── Botão "Voltar" (<Botao variant="outline" icon={<ArrowLeft className="size-4" />}>Voltar</Botao> com DialogClose)
        └── Botão "Salvar" ou "Enviar" (<Botao type="submit" loading={isSaving} icon={<Check className="size-4" strokeWidth={2.5} />}>Salvar</Botao> - texto fixo, apenas ícone gira)
```

### Página Completa de Cadastro (`> 8` campos)
```
[ PageHeader: Título da Página + Descrição Contextual (SEM botão voltar no título; usar showAction={false}) ]
[ Card Container Principal (bg-card border-border/50 rounded-2xl md:rounded-3xl p-4 md:p-6): ]
  └── Formulário Único e Contínuo (sem divisão por etapas/steppers):
        ├── Seção 1: [Ícone + Título 10px uppercase tracking-wider] + Grid de Campos
        ├── Seção 2: [Ícone + Título 10px uppercase tracking-wider] + Grid de Campos
        └── Seção N: ...
[ Rodapé Sticky Fixo FORA DO CARD (sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 flex items-center justify-between SEM border-t): ]
  ├── Esquerda: Botão "Voltar" (<Botao variant="outline" icon={<ChevronLeft className="size-4" />} onClick={handleVoltar}>Voltar</Botao>)
  └── Direita: Botão "Salvar" ou "Enviar" (<Botao type="submit" loading={isSaving} icon={<Check className="size-4" strokeWidth={2.5} />}>Salvar</Botao> - texto fixo, apenas ícone gira)
```

---

## 📋 Regras de Implementação Obrigatórias

### 1. Responsividade e Dimensionamento do Modal (`Dialog`)
- **PROIBIDO:** Modais pequenos ou com overflow quebrado em dispositivos móveis.
- O container do `DialogContent` **DEVE** utilizar as classes canônicas de tela cheia no mobile e modal centralizado no desktop:
  ```tsx
  <DialogContent className="fixed inset-0 top-0 left-0 z-50 flex h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border/60 sm:shadow-2xl">
  ```
- O corpo do formulário dentro do modal deve ter scroll vertical independente e padding estrito de 16px:
  `<div className="flex-1 overflow-y-auto p-4">`

### 2. Cabeçalho Padronizado e Ausência de Botão Voltar no Título da Página Completa
- **Na Página Completa de Cadastro:**
  O `PageHeader` exibe **apenas o título e a descrição**. **NÃO DEVE TER BOTÃO VOLTAR NO TÍTULO**. O botão voltar fica unicamente no rodapé fixo da página.
  ```tsx
  <PageHeader
      title="Cadastrar Novo Patrimônio"
      description="Preencha as informações detalhadas no formulário abaixo."
      showAction={false}
  />
  ```
- No modal, utilize o ícone de cabeçalho envolvido por um container arredondado:
  ```tsx
  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <UserCheck className="size-5" />
  </div>
  ```

### 3. Formulário Único e Contínuo na Página Completa (Sem Etapas/Steppers)
- Quando o cadastro tiver mais de 8 campos, renderize **todos os campos em uma única tela contínua**, agrupados apenas visualmente por seções temáticas (ex: Identificação, Acesso, Gestão).
- **PROIBIDO:** Dividir o formulário em etapas/steppers/abas com validação prévia de abas. O formulário é único e o usuário navega de cima para baixo com rolagem natural.

### 4. Gerenciamento com Inertia `useForm` e Validação de Erros
- Importar `useForm` de `@inertiajs/react`.
- Inicializar com os valores padrão ou valores do `item` em caso de edição.
- **Limpeza de Erro em Tempo Real:** Ao digitar no campo (`onChange`), limpe imediatamente o erro daquele campo:
  ```tsx
  onChange={(e) => {
      setData('nome', e.target.value);
      if (errors.nome) clearErrors('nome');
  }}
  ```
- **Exibição Canônica de Erros & Prevenção de Mensagens Duplicadas:**
  - O componente `<Input>` de `@/components/ui/input` renderiza internamente uma tag `<span className="text-xs text-destructive">{error}</span>` quando `typeof error === 'string'`.
  - Se passarmos a string do erro para o `<Input>` e também renderizarmos `<InputError message={errors.campo} />` (ou parágrafo com a mensagem), a mensagem será exibida **DUAS VEZES** na UI.
  - **PADRÃO OBRIGATÓRIO:**
    - Passe **exclusivamente um valor booleano** para a prop `error` dos componentes de input e select: `error={Boolean(errors.campo)}`. Isso aplica as classes de borda vermelha e foco sem emitir texto duplicado.
    - Utilize o componente oficial `<InputError message={errors.campo} />` logo abaixo do campo para exibir a mensagem vinda do Precognition / FormRequest:
      ```tsx
      <Input
          id="nome"
          value={data.nome}
          onChange={(e) => {
              setData('nome', e.target.value);
              if (errors.nome) clearErrors('nome');
          }}
          onBlur={() => validate('nome')}
          error={Boolean(errors.nome)}
          placeholder="Ex: Carlos Silva"
      />
      <InputError message={errors.nome} />
      ```

### 4.1 Envio Diferenciado no `handleSubmit`: Criação (`POST`) vs Edição (`PUT`)
- **REGRA DE OURO - ZERO FALSOS POSITIVOS DE UNICIDADE:**
  - No formulário de cadastro, determine se o formulário está criando ou editando:
    ```tsx
    const isEdit = Boolean(item?.id);
    const { data, setData, post, put, processing, errors, setError, clearErrors, reset } = useForm<...>(...);
    ```
  - **No `handleSubmit`:**
    - Quando for **edição** (`isEdit` é true): utilize **`put('/[modulo]/' + item.id, { ... })`** (ou `put(route('[modulo].update', item.id))` / `put(moduloRoutes.update.url(item.id))`).
    - Quando for **criação** (`isEdit` é false): utilize **`post('/[modulo]', { ... })`** (ou `post(route('[modulo].store'))` / `post(moduloRoutes.store.url())`).
  - **Por que isso é crítico?**
    - Ao enviar via `PUT /[modulo]/{id}`, o Laravel injeta o registro na rota. O FormRequest do backend obtém esse ID e aplica `Rule::unique('tabela', 'coluna')->ignore($id)`.
    - Isso impede o erro crítico onde o usuário edita um item mantendo o mesmo e-mail, código ou CPF e o backend rejeita com "Este e-mail já está cadastrado no sistema."

### 4.2 Conexão Minimalista com Endpoints (Wayfinder) e Paridade Estrita de Campos (Anti-Redundância)
- **PADRONIZAÇÃO ESTRITA DE NOMES (FRONTEND = BACKEND):**
  - Os nomes das propriedades no `data` do `useForm` **DEVEM ser exatamente os mesmos esperados pelo FormRequest do backend** (ex: sempre `nome`, **NUNCA** `nomeCompleto` ou nomes duplos).
  - É **TERMINANTEMENTE PROIBIDO** manter chaves redundantes no `useForm` (como `nome` e `nomeCompleto` no mesmo formulário).
  - Rótulos visuais de UI (Labels e cabeçalhos de tabela) podem ser descritivos (ex: `"NOME COMPLETO"`), mas o identificador de dados e estado deve ser estritamente `nome`.
- **PADRÃO CANÔNICO E MINIMALISTA DE ENVIO (WAYFINDER + PRECOGNITION + ONERROR):**
  - **PROIBIDO `validarCampos` MANUAL:** Não crie funções manuais de validação no cliente. A validação ocorre campo a campo via Laravel Precognition (`onBlur={() => form.validate('campo')}`) e no submit através do FormRequest.
  ```tsx
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const url = isEdit && item?.id
          ? itemRoutes.update.url(Number(item.id))
          : itemRoutes.store.url();

      (isEdit ? put : post)(url, {
          preserveScroll: true,
          onSuccess: () => {
              toast.success(isEdit ? '[Entidade] atualizada com sucesso!' : '[Entidade] cadastrada com sucesso!');
              onConfirmar?.(data);
              router.reload({ only: ['[entidades]'] });
              onAbertoAlterado(false);
              reset();
          },
          onError: (errs) => {
              const primeiraMensagem = Object.values(errs)[0];
              toast.error(primeiraMensagem || 'Ocorreu um erro ao salvar o registro.');
          },
      });
  };
  ```

### 4.3 Espelhamento Obrigatório de Enums em TypeScript (Zero Strings Mágicas & Validação Pré-Envio)
- **REGRA DE OURO - ZERO STRINGS MÁGICAS NO FRONTEND:**
  - Sempre inspecione os Enums do backend em `app/Enums/` associados à entidade (ex: `StatusUsuario`, `NivelAcesso`, `StatusPatrimonio`).
  - Para cada Enum no backend PHP, declare o `enum` correspondente em TypeScript no arquivo `types.ts` do módulo com o mesmo nome, cases e valores:
    ```typescript
    export enum NivelAcesso {
        Administrador = 'ADMINISTRADOR',
        Comprador = 'COMPRADOR',
        UsuarioPadrao = 'USUARIO_PADRAO',
    }
    ```
  - **PROIBIDO:** Usar unions literais soltas (`'ADMINISTRADOR' | 'COMPRADOR' | 'USUARIO_PADRAO'`) ou strings cruas em arquivos de componente.
  - **Em Opções e Seletores (Selector / Combobox / MultiSelect):** Utilize os membros do Enum como `id` ou `value`:
    ```typescript
    const OPCOES_NIVEL_ACESSO: SelectorOption<NivelAcesso>[] = [
        {
            id: NivelAcesso.Administrador,
            title: 'ADMINISTRADOR',
            description: 'Acesso irrestrito',
            icon: Shield,
        },
        {
            id: NivelAcesso.Comprador,
            title: 'COMPRADOR',
            description: 'Acesso financeiro',
            icon: Briefcase,
        },
        {
            id: NivelAcesso.UsuarioPadrao,
            title: 'USUÁRIO PADRÃO',
            description: 'Acesso padrão',
            icon: User,
        },
    ];
    ```
  - **Em Funções Auxiliares de Mapeamento:**
    Funções de mapeamento ou resolução de perfil devem ter retorno tipado com o Enum TypeScript:
    ```typescript
    function resolverNivelAcesso(perfil?: string): NivelAcesso {
        if (!perfil) return NivelAcesso.UsuarioPadrao;
        const perfilLower = perfil.toLowerCase();
        if (perfilLower.includes('admin')) return NivelAcesso.Administrador;
        if (perfilLower.includes('gestor') || perfilLower.includes('comprador')) return NivelAcesso.Comprador;
        return NivelAcesso.UsuarioPadrao;
    }
    ```
  - **Validação em Tempo Real com Laravel Precognition (PROIBIDO `validarCampos` manual):**
    Não crie validações manuais de Enums nem funções de `validarCampos`. O `useForm` com Precognition e o `Rule::enum()` do FormRequest cuidam da validação no backend e em tempo real no frontend:
    ```typescript
    onBlur={() => validate('nivel_acesso')}
    ```
  - **No `useForm`:** O campo deve ser tipado com o Enum (`nivel_acesso: NivelAcesso`), garantindo sincronia total com o backend e sem risco de inconsistências ou typos.

### 4.4 Selects e Dropdowns Canônicos: Sempre `Combobox` (PROIBIDO Radix Select)
- **REGRA INEGOCIÁVEL:** Todos os campos de seleção do formulário (Status, Foreign Keys, Categorias, Tipos, etc.) **DEVEM** utilizar o componente `<Combobox>` (`import { Combobox } from '@/components/ui/combobox'`).
- **TERMINANTEMENTE PROIBIDO:** Usar `@/components/ui/select` (Radix `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`) para campos de formulário de entidades. Ele não possui busca, não segue a identidade visual dos formulários e quebra o padrão canônico do Starter Kit.
- **Estrutura Canônica com Precognition e Tratamento de Erro:**
  ```tsx
  <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor="status" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          STATUS <span className="text-destructive">*</span>
      </Label>
      <Combobox
          options={statusOptions}
          value={data.status}
          onChange={(val) => {
              setData('status', val as StatusEntidade);
              if (errors.status) clearErrors('status');
              validate('status');
          }}
          placeholder="Selecione o status..."
          searchPlaceholder="Buscar status..."
          error={Boolean(errors.status)}
      />
      <InputError message={errors.status} />
  </div>
  ```

### 5. Skeleton Loaders para Opções Assíncronas
- Quando os selects dependerem de dados do backend:
  - Exibir componentes `<Skeleton className="h-10 w-full rounded-xl" />` enquanto as opções estiverem sendo carregadas.

### 6. Notificações com Sonner Toast e Contrato de Erros do Backend
- Importar `toast` de `sonner`.
- **Tratamento de Erros da API / Backend (`onError`):**
  - **PROIBIDO:** Exibir mensagens de erro genéricas e estáticas como `toast.error('Ocorreu um erro')` quando a validação do backend falhar (ex: unicidade de e-mail, código duplicado).
  - Sempre capturar e exibir a primeira mensagem retornada pelo backend:
    ```tsx
    onError: (errs) => {
        const primeiraMensagem = Object.values(errs)[0];
        if (primeiraMensagem) {
            toast.error(primeiraMensagem);
        } else {
            toast.error('Ocorreu um erro ao salvar o registro.');
        }
    }
    ```
- Sucesso de cadastro: `toast.success('[Entidade] cadastrada com sucesso!')`.
- Sucesso de edição: `toast.success('[Entidade] atualizada com sucesso!')`.

### 7. Rodapé Fixo / Sticky e Componente `Botao` do Sistema
- **PROIBIDO:** Usar botões comuns com tamanhos arbitrários. Sempre importar e utilizar o componente canônico:
  ```tsx
  import { Botao } from '@/components/botao';
  ```
- **Padrão Obrigatório de Loading:**
  - O texto do botão **SEMPRE SE MANTÉM FIXO** (ex: `Salvar` ou `Enviar`). **PROIBIDO** trocar o texto para `Carregando...`, `Salvando...` ou `Enviando...`.
  - O componente `Botao` gerencia o loading nativamente através das propriedades `loading` e `icon`. Quando `loading={true}`, apenas o ícone roda em animação (`Loader2 animate-spin`), mantendo o rótulo idêntico:
    ```tsx
    <Botao
        type="submit"
        loading={isSaving || processing}
        icon={<Check className="size-4" strokeWidth={2.5} />}
    >
        Salvar
    </Botao>
    ```
- **Ações Padronizadas:**
  - **Esquerda:** `<Botao variant="outline" icon={<ArrowLeft className="size-4" />}>Voltar</Botao>` (no modal) ou `<Botao variant="outline" icon={<ChevronLeft className="size-4" />} onClick={handleVoltar}>Voltar</Botao>` (na página).
  - **Direita:** `<Botao type="submit" loading={isSaving || processing} icon={<Check className="size-4" strokeWidth={2.5} />}>Salvar</Botao>`.
- **No Modal:** `<DialogFooter className="flex w-full shrink-0 flex-row items-center justify-between sm:justify-between border-t border-border/40 bg-muted/20 p-4">`.
- **Na Página Completa (REGRA CRÍTICA - BOTÕES FORA DO CARD):**
  - **PROIBIDO:** Colocar os botões de ação dentro do card (`bg-card`, borda arredondada). Isso cria uma moldura fechada ao redor dos botões que polui visualmente.
  - O card com borda (`rounded-2xl border border-border/50 bg-card p-4 md:p-6 md:rounded-3xl space-y-8`) envolve **APENAS** as seções e os campos de formulário.
  - O rodapé com os botões `Voltar` (à esquerda) e `Salvar`/`Enviar` (à direita) fica posicionado **FORA DO CARD**, fixado no final da página (`sticky bottom-0 z-20`) e **SEM borda divisória** superior (`border-t`), mantendo o visual limpo:
  ```tsx
  {/* CARD PRINCIPAL (APENAS CAMPOS) */}
  <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs md:p-6 md:rounded-3xl space-y-8">
      {/* Seções e campos aqui */}
  </div>

  {/* RODAPÉ FORA DO CARD (FINAL DA PÁGINA, SEM BORDA DIVISÓRIA) */}
  <div className="sticky bottom-0 z-20 -mx-4 -mb-4 flex items-center justify-between bg-background/95 p-4 backdrop-blur-sm md:-mx-6 md:-mb-6 md:px-6">
      <Botao type="button" variant="outline" icon={<ChevronLeft className="size-4" />} onClick={handleVoltar}>
          Voltar
      </Botao>
      <Botao type="submit" loading={isSaving || processing} icon={<Check className="size-4" strokeWidth={2.5} />}>
          Salvar
      </Botao>
  </div>
  ```

### 8. Anti-Duplicação de Layout (Inertia v3)
- **PROIBIDO:** Não envolver o JSX da página com `<AppLayout>` ou `<AppSidebarLayout>`.
- O layout já é aplicado globalmente pelo Inertia em `app.tsx`.
- Definir breadcrumbs no final do arquivo via propriedade estática `.layout`:
  ```tsx
  MinhaPaginaCadastro.layout = {
      breadcrumbs: [
          { title: 'Gestão de Patrimônios', href: '/gestao-patrimonios' },
          { title: 'Cadastrar', href: '' },
      ],
  };
  ```

### 9. Componente de Seleção Múltipla (`MultiSelect`)
- Sempre que houver seleção de múltiplos itens, utilize o componente padronizado `@/components/ui/multi-select`:
  ```tsx
  import { MultiSelect } from '@/components/ui/multi-select';
  ```
- O ícone `<Briefcase className="size-3 text-muted-foreground dark:text-zinc-300 shrink-0" />` é fixo como padrão interno no componente. Não é necessário passar a prop `icon` manualmente.
- Suporte a `nullWhenAll={true}` emitindo `null` quando "Todos os Serviços" for marcado.

### 10. Padrão Visual e Tipografia Canônica (10px Uppercase)
- **Títulos de Seção / Agrupadores:**
  Ícone sutil (`size-6 rounded-lg bg-muted/60 border border-border/40`) acompanhado de texto em **10px bold uppercase com tracking-wider**:
  ```tsx
  <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
      <div className="flex size-6 items-center justify-center rounded-lg border border-border/40 bg-muted/60 text-muted-foreground">
          <User className="size-3.5" />
      </div>
      <span>INFORMAÇÕES DO USUÁRIO</span>
  </div>
  ```
- **Rótulos (Labels) dos Campos de Formulário:**
  TODOS os labels de formulário devem seguir estritamente o padrão canônico:
  ```tsx
  <Label htmlFor="campo" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
      NOME COMPLETO <span className="text-destructive">*</span>
  </Label>
  ```

### 11. Conexão Obrigatória da Ação "Editar" na Listagem (Tabela e Mobile Cards)
> **MANDATÓRIO AO GERAR OU CONECTAR O CADASTRO:**
> Nunca deixe a função `handleEditar` na listagem como um mero `toast.info('Acione a skill...')`. Conecte-a imediatamente:
>
> 1. **No caso de Modal (`<= 8` campos):**
>    - Criar estado para o registro em edição: `const [registroEdicao, setRegistroEdicao] = useState<T | null>(null);`
>    - Conectar a função:
>      ```tsx
>      const handleEditar = (item: Entidade) => {
>          setRegistroEdicao(item);
>          setModalAberto(true);
>      };
>      ```
>    - Ao fechar o modal ou confirmar com sucesso: limpar `setRegistroEdicao(null)`.
>
> 2. **No caso de Página Completa (`> 8` campos):**
>    - Conectar a função para direcionar diretamente para a página de cadastro/edição:
>      ```tsx
>      const handleEditar = (item: Entidade) => {
>          router.visit(`/[modulo]/cadastrar?id=${item.id}`);
>      };
>      ```
>    - A página completa de cadastro deve aceitar o parâmetro ou prop de edição, preencher o formulário e ajustar o título conforme o contexto (`isEditing ? 'Editar Entidade' : 'Cadastrar Entidade'`).

### 12. Feedback de Notificações Toast (Cores e Contraste)
- Todas as notificações acionadas via `toast.error()`, `toast.success()`, etc. utilizam o componente `@/components/ui/sonner`.
- O texto superior do toast deve seguir estritamente o tema com alto contraste e legibilidade: no Light Mode o texto de erro deve ser escuro/saturado (`text-destructive`), e no Dark Mode deve usar a variante apropriada (`dark:text-error`), evitando que fique texto branco sobre fundo claro ou desbotado.

---

## 🔌 Como Integrar com a Página de Listagem (`frontend-listagem`)

### Caso 1: Cadastro via Modal (`<= 8` campos)
No arquivo `resources/js/pages/[modulo]/index.tsx`:
```tsx
const [modalAberto, setModalAberto] = useState(false);
const [itemEdicao, setItemEdicao] = useState<Entidade | null>(null);

// Conexão do botão Cadastrar
<PageHeader
    title="Gestão de Usuários"
    description="Controle os usuários, cargos e departamentos."
    action={{
        label: 'Cadastrar',
        onClick: () => {
            setItemEdicao(null);
            setModalAberto(true);
        },
    }}
/>

// Conexão da ação Editar (tabela e cards)
const handleEditar = (item: Entidade) => {
    setItemEdicao(item);
    setModalAberto(true);
};
```

### Caso 2: Cadastro em Página Completa (`> 8` campos)
No arquivo `resources/js/pages/[modulo]/index.tsx`:
```tsx
// Conexão do botão Cadastrar
<PageHeader
    title="Gestão de Usuários"
    description="Controle os usuários da empresa."
    action={{
        label: 'Cadastrar',
        href: '/gestao-usuarios/cadastrar',
    }}
/>

// Conexão da ação Editar (tabela e cards)
const handleEditar = (item: Entidade) => {
    router.visit(`/gestao-usuarios/cadastrar?id=${item.id}`);
};
```
Na rota `routes/web.php`:
```php
Route::inertia('gestao-usuarios/cadastrar', 'gestao-usuarios/cadastrar')->name('gestao-usuarios.cadastrar');
```
