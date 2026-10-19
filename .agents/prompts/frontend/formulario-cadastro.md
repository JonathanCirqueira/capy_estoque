# 📋 Prompts de Cadastro (Copiar e Colar)

> 💡 **Critério Rápido:**
> - **Até 8 campos (`<= 8`):** Use a **Opção 1 (Modal)**.
> - **Mais de 8 campos (`> 8`):** Use a **Opção 2 (Página Completa)**.

---

## ⚡ Opção 1: Cadastro via MODAL (até 8 campos)

Copie e envie o prompt abaixo para cadastros rápidos ou convites:

```markdown
/form Usuario

Use a skill @[skills/frontend-formulario-cadastro] para gerar o componente de cadastro em Modal com base no template canônico e nos componentes do sistema:

- **Entidade:** Usuário / Convite de Usuário
- **Tipo de Cadastro:** Modal (até 8 campos)
- **Página de Origem (Onde fica o botão de cadastrar):** resources/js/pages/usuarios/index.tsx
- **Destino do Componente Modal:** resources/js/pages/usuarios/components/modal-cadastro-usuario.tsx
- **Título do Modal:** Convidar Usuário
- **Descrição:** Envie um convite de acesso para um novo colaborador.
- **Ícone do Cabeçalho:** MailPlus (<MailPlus className="size-5" />)

- **Estrutura de Seções e Campos (organizados em 2 seções visuais):**
  - **Seção 1: INFORMAÇÕES DO USUÁRIO** (Ícone: <User className="size-4" />)
    1. Nome Completo (Input text, obrigatório, placeholder: "Digite o nome completo...")
    2. E-mail do Colaborador (Input email, obrigatório, placeholder: "Ex: email@jhe.com.br")
    3. Serviços Disponíveis (Componente MultiSelect de @/components/ui/multi-select, obrigatório, com tags e opção de "Todos os Serviços", ícone <Building2 className="size-4" />) -> Opções: [COHAB, Sede JHE, Habisocial, Habinova II]
  - **Seção 2: NÍVEL DE ACESSO** (Ícone: <Shield className="size-4" />)
    4. Nível de Acesso (Componente Selector em cards de @/components/ui/selector, seleção única em grid de 3 cards):
       - Card 1: ADMINISTRADOR (ícone <Shield className="size-5" />, subtítulo: "Acesso irrestrito")
       - Card 2: COMPRADOR (ícone <Briefcase className="size-5" />, subtítulo: "Acesso financeiro")
       - Card 3: USUÁRIO PADRÃO (ícone <User className="size-5" />, subtítulo: "Acesso padrão")

- **Rodapé Fixo (Um botão em cada ponta):**
  - Botão Voltar (esquerda): <Botao variant="outline" className="gap-2"><ArrowLeft className="size-4" /> Voltar</Botao>
  - Botão Enviar (direita): <Botao type="submit" className="gap-2"><Check className="size-4" strokeWidth={2.5} /> Enviar</Botao>

- **Integração com a Página de Origem:**
  - Atualizar a ação do PageHeader em `resources/js/pages/usuarios/index.tsx` para abrir o modal via `onClick={() => { setUsuarioEdicao(null); setModalAberto(true); }}`.
  - Conectar a ação `onEditar` na tabela e cards da listagem para abrir o modal com o usuário em edição (`onClick={() => { setUsuarioEdicao(usuario); setModalAberto(true); }}`).
  - Recarregar a listagem via `router.reload({ only: ['usuarios'] })` após o cadastro ou edição com sucesso.
```

---

## ⚡ Opção 2: Cadastro via PÁGINA COMPLETA (mais de 8 campos)

Copie e envie o prompt abaixo para cadastros extensos ou corporativos em etapa única:

```markdown
/form Usuario

Use a skill @[skills/frontend-formulario-cadastro] para gerar a página de cadastro completa em etapa única com base no template canônico:

- **Entidade:** Usuário / Colaborador
- **Tipo de Cadastro:** Página Completa (Formulário Contínuo / Etapa Única)
- **Página de Origem (Onde fica o botão de cadastrar):** resources/js/pages/gestao-usuarios/index.tsx
- **Destino da Nova Página:** resources/js/pages/gestao-usuarios/cadastrar.tsx
- **Rota:** /gestao-usuarios/cadastrar
- **Título da Página:** Cadastrar Usuário
- **Descrição:** Adicione novos usuários preenchendo os dados pessoais, corporativos e de acesso em uma única página.

- **Campos do Formulário (Total: 9 campos em etapa única contínua):**
  - **Seção 1: DADOS PESSOAIS E CONTATO** (Ícone: <User className="size-4" />)
    1. Nome Completo (Input text, obrigatório)
    2. CPF (Input text com máscara, obrigatório)
    3. E-mail Pessoal (Input email, opcional)
  - **Seção 2: INFORMAÇÕES CORPORATIVAS** (Ícone: <Briefcase className="size-4" />)
    4. Matrícula (Input text, obrigatório)
    5. Departamento (Combobox, obrigatório) -> [TI, Administrativo, Operações, RH, Comercial]
    6. Cargo / Função (Combobox, obrigatório)
    7. Data de Admissão (Input date, obrigatório)
  - **Seção 3: ACESSO E SEGURANÇA** (Ícone: <Shield className="size-4" />)
    8. Perfil de Acesso (Combobox, obrigatório) -> [Administrador, Gestor, Operador, Leitor]
    9. Senha Provisória (Input password, obrigatório)

- **Rodapé Fixo (Fora do card do formulário, sem borda separadora):**
  - Botão Voltar (esquerda): <Botao variant="outline" href="/gestao-usuarios" className="gap-2"><ArrowLeft className="size-4" /> Voltar</Botao>
  - Botão Salvar (direita): <Botao type="submit" className="gap-2"><Check className="size-4" strokeWidth={2.5} /> Salvar</Botao>

- **Integração com a Página de Origem e Rotas:**
  - Atualizar a ação do PageHeader em `resources/js/pages/gestao-usuarios/index.tsx` com `href="/gestao-usuarios/cadastrar"`.
  - Conectar a ação `onEditar` na tabela e cards da listagem para direcionar diretamente para a página com o id do registro: `router.visit('/gestao-usuarios/cadastrar?id=' + usuario.id)`.
  - Configurar rota em `routes/web.php`.
  - Botão de voltar no rodapé da página cadastrar deve apontar de volta para `/gestao-usuarios`.
```
