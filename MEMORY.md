# 🧠 Project Memory & Lessons Learned (`MEMORY.md`)

> **Regra de Uso da IA**: Consulte este arquivo antes de qualquer tarefa. Sempre que o usuário corrigir um erro ou comportamento, adicione a lição aprendida abaixo no formato ultra-minimalista (1 a 2 linhas). NUNCA repita os erros listados.
> **Política de Tamanho**: Manter este arquivo conciso (máx. 25-30 regras ativas). Consolidar ou promover para as regras principais caso necessário.

---

## 🚫 O que NUNCA Fazer (Lista Negra de Padrões)

### Git & DevOps

- 🚫 **Commits fora dos Agentes & Pushes**: NUNCA executar `git commit` fora do fluxo dos 4 agentes de automação do `CONTEXT.md`. Os 4 agentes realizam git commit automaticamente a cada tarefa concluída (em português: feat, refactor, fix, chore). NUNCA executar `git push`.
- 🚫 **GitLab SSH sem chave pública configurada**: NUNCA usar remote SSH (`git@gitlab.com:...`) quando a chave SSH do ambiente não estiver cadastrada. Utilizar HTTPS com Git Credential Manager.

### Backend (Laravel & PHP)

- 🚫 **Strings Mágicas**: NUNCA usar strings soltas para status, tipos ou perfis. Usar sempre PHP Backed Enums em `app/Enums/` com cast na Model.
- 🚫 **Formatação no Backend**: NUNCA enviar valores monetários formatados, datas em string BR ou textos com máscara. Backend envia apenas dados brutos (centavos, ISO 8601, booleans).
- 🚫 **`cascadeOnDelete` em Cadastros Centrais**: NUNCA colocar deleção em cascata apontando para `users` ou tabelas de negócio vitais. Usar `restrictOnDelete()` ou `nullOnDelete()`.
- 🚫 **Injeção de Actions no `__construct`**: NUNCA injetar Actions no construtor do Controller. Injetar exclusivamente no método da rota que a executa.
- 🚫 **Arquivos de Tradução Ausentes com `APP_LOCALE=pt_BR`**: NUNCA rodar aplicação sem arquivos em `lang/pt_BR/*.php`, evitando que chaves como `auth.failed` vazem cruas na UI.
- 🚫 **Cadastro Público Aberto sem Requisito**: NUNCA manter `Features::registration()` ativo quando o domínio prevê cadastro exclusivo via convite administrativo.
- 🚫 **Final de Arquivo sem Linha em Branco (Pint/PSR-12)**: NUNCA criar arquivos PHP sem quebra de linha final única (`single_blank_line_at_eof`), garantindo que o `vendor/bin/pint --test` passe sem falhas.

### Frontend (React & Inertia)

- 🚫 **Layouts Duplicados no JSX**: NUNCA envolver páginas com `<AppLayout>` ou `<SettingsLayout>` no retorno JSX. O starter kit já os injeta globalmente via `app.tsx`. Use apenas `Component.layout = { breadcrumbs: [...] }` para evitar migalhas de pão e botão de tema duplicados.
- 🚫 **Validação Manual na UI**: NUNCA criar checagens manuais (`if (!campo.trim())`) ou objetos de erro manuais. A validação pertence exclusivamente ao FormRequest via Precognition / Inertia errors.
- 🚫 **`new FormData()` Manual**: NUNCA instanciar `FormData` artesanal com loops de `append`. Enviar objetos de payload puros via Inertia.
- 🚫 **Strings Mágicas na UI**: NUNCA usar strings soltas para filtros e status. Usar Enums e tipos espelhados do TypeScript (`resources/js/types/`).
- 🚫 **`wayfinder:generate` sem `--with-form`**: NUNCA rodar a geração do Wayfinder sem a flag `--with-form`, sob pena de causar `store.form is not a function` nos formulários.
- 🚫 **Containers com `mx-auto` ou `max-w-*` nas Páginas**: NUNCA usar `mx-auto` ou `max-w-7xl`/`5xl`/`6xl` no container raiz da página. Usar largura fluida total (`flex flex-1 flex-col gap-6 p-4 md:p-6`) conforme as skills `frontend-listagem` e `frontend-cadastro` para evitar faixas laterais vazias em widescreen.
- 🚫 **Recriar Componentes na Mão**: NUNCA criar cards de seleção, botões ou inputs artesanais no JSX sem antes verificar componentes existentes no projeto em `resources/js/components/` ou orientados nas skills (ex: `<Selector>`, `<MultiSelect>`, `<Botao>`).
- 🚫 **Tom de Vermelho Destrutivo nos Modais**: Usar sempre a cor de identidade do projeto `#ce3765` para o botão e título de inativação/destrutivo no ConfirmationModal com o padrão de botões 'Voltar' (outline) e 'Inativar' (check com bg-[#ce3765]).
- 🚫 **Filtros com Poucos Itens Quebrados em 2 Linhas**: NUNCA quebrar a barra de busca e combobox em 2 linhas separadas quando houver apenas 1 ou 2 filtros; mantê-los na mesma linha horizontal (`sm:flex-row sm:items-center`) alinhados à busca e ao menu de opções.
- 🚫 **Modais com Cards de Seleção Estreitos Demais**: NUNCA usar `sm:max-w-lg` ou `sm:max-w-2xl` em modais com seletores em 3 colunas (como níveis de acesso), sob risco de truncamento; usar `sm:max-w-3xl` com botões no rodapé distribuídos nas extremidades (`justify-between sm:justify-between`).
- 🚫 **Colunas de Dados com Cores ou Tipografia Desiguais**: NUNCA aplicar `text-muted-foreground` a colunas de dados comuns (como e-mail); padronizar todas as colunas com `text-sm font-normal text-foreground` para consistência e suporte ao tema (claro/escuro).
- 🚫 **Indicador de Seleção no Selector/Nível de Acesso**: NUNCA usar indicador circular ('dot' / 'rounded-full') para seleção de nível de acesso; usar sempre checkbox semi-quadrado ('check' com 'rounded-md') e ativar preenchimento primário no ícone lateral quando selecionado.
- 🚫 **Radix Popover/MultiSelect dentro de Dialog**: NUNCA usar 'modal={true}' ou portal sem container para Popover/MultiSelect dentro de Dialog; usar 'modal={false}', ancorar o Portal no container do Dialog via 'closest("[role=\'dialog\']")' e 'onKeyDown={(e) => e.stopPropagation()}' no input para evitar roubo de foco pelo FocusScope.
- 🚫 **Troca de Senha na Gestão de Usuários**: NUNCA abrir modal com input de texto ou cópia de senha; usar sempre ConfirmationModal padrão confirmando o envio de e-mail com nova senha temporária para o usuário.
- 🚫 **Item 'Início' nas Migalhas de Pão (Breadcrumbs)**: NUNCA incluir '{ title: "Início", href: "/dashboard" }' no array de breadcrumbs das páginas; iniciar diretamente com a seção do módulo atual (ex: 'Usuários' ou 'Reembolsos').

---

## 💡 Lições Aprendidas & Ajustes Recentes

- **Identidade Visual e Branding**: Manter logos em `public/capy_logo_dark.png` e `public/capy_logo_light.png`. Sidebar configurada com gradiente Dark Navy (`bg-linear-to-b from-[#061d43] from-45% to-[#010d22]`) e partículas turquesas (`#36C2D2`).
- **Autenticação Padrão**: Usuário padrão de acesso e seeder é `admin@capy.com` com senha `password`.
- **Validação de Qualidade Obrigatória**: Todo commit ou conclusão de tarefa deve rodar `composer verify` e obter 100% de sucesso (Oxlint, Rector, PHPStan, Pint e Pest).

