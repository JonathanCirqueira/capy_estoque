---
name: cadastro-listagem-completo
description: Orquestrador Fullstack completo (Frontend + Backend) para geração de novos módulos com listagem reativa, cadastro e edição (Modal <= 8 campos ou Página > 8 campos), inativação lógica segura (nunca deletar do banco), menu na sidebar e rotas tipadas do Wayfinder.
allowed-tools: Read, Write, Edit
version: 1.0
priority: HIGH
---

# Orquestrador Fullstack: Cadastro e Listagem Completo

> **MANDATÓRIO PARA CRIAÇÃO DE NOVOS MÓDULOS DE PONTA A PONTA:**
> Esta skill orquestra e unifica o desenvolvimento fullstack de novos recursos e módulos no sistema. Ela ativa e reutiliza diretamente as quatro skills especialistas do Starter Kit sem duplicar código ou regras:
> - `/backend-listagem` (`.agents/skills/backend-listagem/SKILL.md`)
> - `/backend-cadastro` (`.agents/skills/backend-cadastro/SKILL.md`)
> - `/frontend-listagem` (`.agents/skills/frontend-listagem/SKILL.md`)
> - `/frontend-cadastro` (`.agents/skills/frontend-cadastro/SKILL.md`)

---

## ⚡ Regras de Ouro Inegociáveis

### 1. 🛡️ Remoção Lógica Obrigatória (NUNCA Deletar do Banco)
- **É TERMINANTEMENTE PROIBIDO executar `DELETE` físico ou `$model->delete()` definitivo no banco de dados para registros de negócio.**
- A remoção de itens deve **SEMPRE** ser implementada como uma **Inativação Lógica**:
  - **Padrão Primário (Recomendado):** Alterar o status do registro para `Status::Inativo` através de uma `Inativar[Entidade]Action`.
  - **Padrão Secundário (Histórico/Auditoria):** Utilizar o trait nativo `SoftDeletes` do Laravel (`deleted_at`), garantindo que o registro permaneça preservado no banco de dados.
- O método `destroy` do Controller aciona a inativação e retorna feedback claro via toast/redirect: `"[Entidade] inativada com sucesso!"`.

### 2. 🎯 O Divisor de Águas de UI: Regra dos 8 Campos
Antes de iniciar qualquer código de frontend, conte a quantidade de campos do formulário de cadastro/edição:
- **Até 8 Campos (`<= 8`):** O formulário **DEVE SER UM MODAL (`Dialog`)** responsivo (tela cheia no mobile, centralizado no desktop).
- **Mais de 8 Campos (`> 8`):** O formulário **DEVE SER UMA PÁGINA COMPLETA CONTÍNUA** com seções temáticas e rodapé sticky fora do card.

### 3. 🚫 Zero Strings Mágicas (Backend & Frontend)
- Todo status, nível, perfil ou categoria deve ser um **PHP Backed Enum** em `app/Enums/`.
- Todo Enum do backend DEVE ser **espelhado 1:1 em TypeScript** em `resources/js/pages/[modulo]/types.ts`.
- **Proibido** unions literais ou strings cruas soltas na UI e no backend.

### 4. ⚡ Laravel Precognition Obrigatório
- Validação em tempo real campo a campo via `onBlur={() => form.validate('campo')}` consumindo o FormRequest.
- **Proibido** criar validações manuais como `const validarCampos = () => ...` no cliente.

### 5. 🚫 Zero `prepareForValidation()` Redundante
- O framework já aplica globalmente `TrimStrings` e `ConvertEmptyStringsToNull`.
- FormRequests focam exclusivamente em declarar regras de validação. Defaults pertencem ao Controller ou à Action.

### 6. 🔄 Paridade Estrita de Nomenclatura (Frontend ↔ Backend)
- O frontend envia e consome as propriedades exatamente no mesmo nome esperado pelo backend (`snake_case` padrão das colunas).

### 7. 🔘 Componente de Botão Canônico (`Botao`)
- **PROIBIDO:** Usar botões comuns com tamanhos arbitrários ou agrupar botões à direita com `justify-end gap-2` ou ícone `X Cancelar`.
- **MANDATÓRIO:** Todo botão de ação no modal ou na página DEVE utilizar o componente canônico `@/components/botao` (`import { Botao } from '@/components/botao'`).
- **No Modal (`Dialog`):** O rodapé canônico utiliza `justify-between` com borda superior e fundo sutil:
  ```tsx
  <DialogFooter className="flex w-full shrink-0 flex-row items-center justify-between border-t border-border/40 bg-muted/20 p-4 sm:justify-between sm:p-6">
      <DialogClose asChild>
          <Botao type="button" variant="outline" icon={<ArrowLeft className="size-4" />}>
              Voltar
          </Botao>
      </DialogClose>
      <Botao type="submit" loading={processing} icon={<Check className="size-4" strokeWidth={2.5} />}>
          {isEdit ? 'Salvar Alterações' : 'Salvar'}
      </Botao>
  </DialogFooter>
  ```

### 8. 🔽 Select Padrão do Sistema: Sempre `Combobox` (PROIBIDO Radix Select)
- **MANDATÓRIO:** Todos os dropdowns e seletores de opções (Status, Categorias, Foreign Keys, etc.) DEVEM utilizar o componente `<Combobox>` (`import { Combobox } from '@/components/ui/combobox'`).
- **TERMINANTEMENTE PROIBIDO:** Utilizar `@/components/ui/select` (Radix `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`) para campos de formulários ou entidades. Ele é reservado exclusivamente para micro-controles de sistema como a paginação.
- **Campo de Status:** Mapear as opções do Enum TypeScript espelhado:
  ```tsx
  const statusOptions = [
      { value: StatusEntidade.Ativo, label: 'Ativo' },
      { value: StatusEntidade.Pendente, label: 'Pendente' },
      { value: StatusEntidade.Inativo, label: 'Inativo' },
  ];

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
  ```

### 9. 🚫 Prevenção de Mensagens de Validação Duplicadas
- O componente `<Input>` de `@/components/ui/input` possui renderização interna de mensagem quando `typeof error === 'string'`.
- Se passarmos `error={errors.campo}` para o `<Input>` E também colocarmos `<InputError message={errors.campo} />`, a mensagem será exibida **DUAS VEZES** na tela.
- **REGRA CANÔNICA OBRIGATÓRIA:**
  - Passe SEMPRE um valor booleano para a prop `error` dos componentes: `error={Boolean(errors.campo)}`. Isso aplica a borda vermelha e foco de erro no input sem gerar texto duplicado.
  - Deixe a exibição textual da mensagem de erro **exclusivamente a cargo do `<InputError message={errors.campo} />`**.
  - **PROIBIDO:** Passar string de erro para `error={errors.campo}` quando `<InputError message={errors.campo} />` estiver presente no JSX.

---

## 🏗️ Matriz de Responsabilidades do Módulo

Ao rodar esta skill para um novo módulo, os seguintes artefatos são criados e integrados:

```
[ Backend ]
├── app/Enums/[Status/Tipo]Enum.php               # Enums tipados do domínio
├── routes/web.php                                # Rotas index, store, update, destroy (inativar)
├── app/Http/Requests/Listar[Entidades]Request.php # Validação de query string e abas
├── app/Http/Requests/Salvar[Entidade]Request.php  # Validação com Precognition e unicidade defensiva
├── app/Actions/Filtrar[Entidades]Action.php       # Query builder anti-N+1 e escopo de abas
├── app/Actions/Criar[Entidade]Action.php          # Persistência transacional (DB::transaction)
├── app/Actions/Atualizar[Entidade]Action.php      # Atualização transacional
├── app/Actions/Inativar[Entidade]Action.php        # Inativação segura (status Inativo / soft delete)
├── app/Policies/[Entidade]Policy.php              # Autorização RBAC
└── app/Http/Controllers/[Entidade]Controller.php  # Thin Controller CRUD completo

[ Frontend ]
├── resources/js/pages/[modulo]/types.ts           # Tipos e espelhamento 1:1 dos Enums
├── resources/js/pages/[modulo]/index.tsx          # Página com PageHeader, StatusTabs, filtros e paginação
├── resources/js/pages/[modulo]/tabela-[entidade].tsx # Tabela desktop + Cards mobile
├── resources/js/pages/[modulo]/[modal-ou-pagina]  # Modal (<=8) ou Página (>8) de Cadastro/Edição
└── resources/js/components/app-sidebar.tsx        # Inclusão automática no menu lateral
```

---

## 📋 Passo a Passo de Execução

### Fase 1: Análise e Schema First
1. **Identificar o Domínio:**
   - Inspecionar a Model existente ou criar a Model/Migration (se não existir, omitindo o método `down()`).
   - Listar todos os campos e contar: `total <= 8` (Modal) ou `total > 8` (Página Completa).
2. **Definir os Enums:**
   - Garantir enum de status contendo pelo menos `Ativo` e `Inativo` (mais outros casos como `Pendente`, `Esgotado`, etc., conforme o domínio).

---

### Fase 2: Backend (Listagem + CRUD + Inativação)
Seguir rigorosamente as instruções detalhadas em:
- [backend-listagem](file:///.agents/skills/backend-listagem/SKILL.md)
- [backend-cadastro](file:///.agents/skills/backend-cadastro/SKILL.md)

1. **Rotas (`routes/web.php`):**
   ```php
   Route::middleware(['auth', 'verified'])->group(function () {
       Route::get('/[modulo]', [[Entidade]Controller::class, 'index'])->name('[modulo].index');
       Route::post('/[modulo]', [[Entidade]Controller::class, 'store'])->name('[modulo].store');
       Route::put('/[modulo]/{[entidade]}', [[Entidade]Controller::class, 'update'])->name('[modulo].update');
       Route::delete('/[modulo]/{[entidade]}', [[Entidade]Controller::class, 'destroy'])->name('[modulo].destroy'); // Inativação
   });
   ```

2. **FormRequests:**
   - `Listar[Entidades]Request`: regras para `aba`, `termo`, `ordem_campo`, `ordem_direcao`, `por_pagina`.
   - `Salvar[Entidade]Request`: regras completas para store e update, usando `Rule::unique(...)->ignore($id)` defensivo e `Rule::enum(...)`.

3. **Actions:**
   - `Filtrar[Entidades]Action`: busca textual `when()`, eager loading `with()` para relacionamentos reais, método `aplicarFiltroAba()`.
   - `Criar[Entidade]Action`: `DB::transaction()` retornando a Model criada.
   - `Atualizar[Entidade]Action`: `DB::transaction()` atualizando campos e retornando `$model->refresh()`.
   - `Inativar[Entidade]Action`:
     ```php
     final readonly class Inativar[Entidade]Action
     {
         public function execute([Entidade] $[entidade]): [Entidade]
         {
             return DB::transaction(static function () use ($[entidade]): [Entidade] {
                 $[entidade]->update([
                     'status' => Status[Entidade]::Inativo,
                 ]);

                 return $[entidade]->refresh();
             });
         }
     }
     ```

4. **Thin Controller (`[Entidade]Controller.php`):**
   - Injeta as 4 actions no construtor.
   - `index`: executa query base, calcula contadores com `clone $queryBase`, pagina com `withQueryString()` e renderiza via `Inertia::render`.
   - `store`: `Gate::authorize('create', ...)`, invoca `CriarAction`, redireciona com mensagem de sucesso.
   - `update`: `Gate::authorize('update', ...)`, invoca `AtualizarAction`, redireciona com mensagem de sucesso.
   - `destroy`: `Gate::authorize('delete', ...)`, invoca `InativarAction`, redireciona com mensagem de inativação.

---

### Fase 3: Frontend (Listagem + Cadastro + Edição)
Seguir rigorosamente as instruções detalhadas em:
- [frontend-listagem](file:///.agents/skills/frontend-listagem/SKILL.md)
- [frontend-cadastro](file:///.agents/skills/frontend-cadastro/SKILL.md)

1. **Tipos (`types.ts`):**
   - Espelhar os Enums do backend.
   - Definir interfaces `[Entidade]` e `[Entidade]FormData`.
2. **Listagem (`index.tsx` e `tabela-[entidade].tsx`):**
   - `<PageHeader>` com título, descrição e botão "Cadastrar".
   - Card único com `<StatusTabs>` encostado nas bordas.
   - Linha de filtros com input de busca (lupa obrigatória via `leftIcon={<Search className="size-4" />}`) e menu de 3 pontinhos para Exportar.
   - Tabela desktop com colunas em uppercase e badges com cores do tema.
   - Cards mobile estruturados sem ícones de domínio específicos.
   - Menu de ações de cada linha com "Editar" e "Inativar".
   - `<Paginacao>` canônica alinhada de borda a borda.
3. **Formulário de Cadastro/Edição:**
   - **Caso `<= 8` campos:** Criar `components/modal-cadastro-[entidade].tsx` com `<DialogContent>` responsivo, inputs com `error={Boolean(errors.campo)}` + `<InputError message={errors.campo} />` (para evitar duplicações), selects com `<Combobox>` (nunca Radix Select) e `<DialogFooter>` usando `<Botao>` oficial com `justify-between`.
   - **Caso `> 8` campos:** Criar `cadastrar.tsx` com seções temáticas (10px uppercase), card envolvendo apenas campos, inputs com `error={Boolean(errors.campo)}` + `<InputError />`, selects com `<Combobox>` e rodapé sticky com `<Botao>` fora do card.
   - `handleSubmit`: bifurca entre `post` (criação) e `put` (edição).
   - `handleInativar`: dispara `router.delete` com confirmação amigável e toast de sucesso.
4. **Sidebar (`resources/js/components/app-sidebar.tsx`):**
   - Adicionar o item em `mainNavItems` com rota e ícone semântico do `lucide-react`.

---

### Fase 4: Sincronização e Verificação
1. **Regenerar rotas Wayfinder com variantes de formulário:**
   ```bash
   php artisan wayfinder:generate --with-form
   ```
2. **Executar pipeline de verificação obrigatório:**
   ```bash
   composer verify
   ```
   (Garante Oxlint, Rector, PHPStan Level Max, Pint e Pest 100% verdes).

---

## 💡 Modelo de Prompt para Acionar esta Skill

Para automatizar a geração de qualquer novo recurso no projeto, utilize a seguinte estrutura de prompt:

```markdown
/cadastro-listagem-completo

Gere o módulo completo de "[Nome do Módulo]" (Frontend + Backend):
- Entidade: [Nome da Model / Entidade]
- Campos:
  - [campo_1] ([tipo], [obrigatório/opcional], [regras de unicidade])
  - [campo_2] ([tipo], [obrigatório/opcional])
  - status (Enum: Ativo, Inativo, etc.)
- Regras de Domínio:
  - Listagem com abas de status (Todos, Ativos, Inativos)
  - Formulário: [informar se possui requisitos especiais ou deixar a regra dos 8 campos decidir]
  - Remoção: apenas inativar logicamente (nunca deletar do banco)
  - Menu na sidebar com ícone apropriado
```

---

## 🔍 REGRA DE AUDITORIA E VERIFICAÇÃO FINAL OBRIGATÓRIA (Fase de Conclusão)

> ⚠️ **MANDATÓRIO ANTES DE CONCLUIR QUALQUER TAREFA DESTE ORQUESTRADOR:**
> Ao finalizar a implementação de um novo módulo de ponta a ponta, é ESTRITAMENTE OBRIGATÓRIO executar uma auditoria completa cruzando o código contra os templates canônicos, as diretrizes de backend e as regras de frontend:

### 1. Auditoria do Backend contra Templates e Diretrizes (`app/backend-rules.md` e `laravel-best-practices`)
- [ ] **A Regra da Fronteira (PT-BR):** Todas as tabelas, colunas, models, controllers, actions, enums e métodos estão em Português.
- [ ] **Remoção Lógica (Nunca Deletar do Banco):** Ação de exclusão implementada como inativação lógica (`Inativar[Entidade]Action` ou `SoftDeletes`). Proibido `$model->delete()` físico definitivo.
- [ ] **Zero Strings Mágicas:** Status, perfis e categorias usam PHP Backed Enums em `app/Enums/` com casts na Model.
- [ ] **Thin Controller (< 10 linhas):** Métodos de controller atuam apenas como orquestradores HTTP com `Gate::authorize()` e delegação a Actions.
- [ ] **Actions Transacionais:** Imutáveis (`final readonly class`), mutações em `DB::transaction()`, sem conversões redundantes de enum.
- [ ] **FormRequest Limpo:** Regras completas de validação, `Rule::enum()`, ID ignorado em regras unique na edição. Sem método `authorize()` redundante e sem `prepareForValidation()` para trim/null.
- [ ] **Prevenção de N+1 e Contadores de Abas:** `with()` com relações Eloquent reais e contadores calculados via `(clone $queryBase)->count()`.
- [ ] **Raw Data Only:** Backend retorna dados puros (centavos, ISO dates, booleans), delegando formatação ao frontend.
- [ ] **Conformidade com os Blueprints:** Código segue `.agents/templates/backend/cadastro.md` e `.agents/templates/backend/listagem.md`.

### 2. Auditoria do Frontend contra Templates e Regras de UI
- [ ] **Divisor dos 8 Campos Respeitado:**
  - `<= 8` campos: Implementado em **Modal (`Dialog`)**, com `<DialogFooter>` fixo (`justify-between`), botão Voltar e Salvar.
  - `> 8` campos: Implementado em **Página Completa Contínua** (sem steppers), com seções temáticas (10px uppercase), card envolvendo apenas campos e rodapé sticky posicionado **FORA DO CARD**.
- [ ] **Zero Strings Mágicas no React:** Enums TypeScript espelhados 1:1 com os Enums do backend em `types.ts`.
- [ ] **Laravel Precognition Obrigatório:** Validação em tempo real no `onBlur` com `clearErrors` no `onChange`. Proibido funções manuais de validação (`validarCampos`).
- [ ] **Nomenclatura Paritária:** Chaves do formulário em `snake_case` idênticas às colunas e FormRequest.
- [ ] **Componentes Canônicos do Sistema:**
  - `<Botao>` oficial com texto fixo ("Salvar") e prop `loading={processing}`.
  - `<Combobox>` exclusivo para todos os campos de seleção (Radix Select é proibido).
  - `<PageHeader>` oficial importado de `@/components/page-header`.
  - Card container único na listagem com `<StatusTabs>` encostado no topo sem padding externo.
  - Tabela desktop com colunas UPPERCASE e cards mobile sem ícones de domínio inventados.
  - `<Paginacao>` canônica alinhada de borda a borda.
- [ ] **Navegação e Rotas:**
  - Inclusão imediata no menu lateral `AppSidebar` (`resources/js/components/app-sidebar.tsx`) com ícone apropriado.
  - Uso estrito de rotas tipadas do Wayfinder (`@/actions` ou `@/routes`). Proibido URLs hardcoded.
  - Anti-duplicação de layout (breadcrumbs em `MinhaPagina.layout`).
- [ ] **Conformidade com os Blueprints:** Código segue `.agents/templates/frontend/cadastro.md` e `.agents/templates/frontend/listagem.md`.

### 3. Pipeline de Execução e Verificação Obrigatória
Antes de entregar a resposta final ao usuário, execute sequencialmente:
```bash
# 1. Regenerar rotas tipadas do Wayfinder com suporte a formulários
php artisan wayfinder:generate --with-form

# 2. Formatar código PHP modificado
vendor/bin/pint --dirty --format agent

# 3. Checagem estática de tipos TypeScript
npm run types:check

# 4. Executar a suíte completa de verificação (Oxlint, Rector, PHPStan max e Pest Tests)
composer verify
```
⚠️ Se houver qualquer falha ou apontamento nos comandos acima, corrija imediatamente antes de considerar o módulo finalizado.
