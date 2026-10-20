# Diretrizes do Backend (Regras do Projeto)

> **Nota:** Este arquivo (`app/backend-rules.md`) deve ser lido em toda tarefa backend para garantir as regras de negócio, arquitetura e padronização do projeto.

### Ativação Modular de Skills (Economia de Tokens)
Ative as skills adicionais apenas quando o assunto for relevante para a tarefa:
- **`laravel-best-practices`**: Para escrita de controllers, Eloquent, migrations e regras gerais do Laravel.
- **`fortify-development`**: Apenas quando trabalhar com autenticação, login, 2FA, senhas e perfis.
- **`pest-testing`**: Apenas quando criar, refatorar ou corrigir testes automatizados Pest.
- **`wayfinder-development`**: Apenas ao conectar controllers/rotas do backend com componentes React/Inertia.
- **`debug-using-debugbar`**: Apenas quando investigar N+1, queries lentas ou depurar erros.

---

### 🔗 Links Oficiais das Documentações
- **Laravel Official Docs:** [laravel.com/docs](https://laravel.com/docs)
- **Laravel Boost (MCP / AI Context):** [github.com/laravel/boost](https://github.com/laravel/boost)
- **Laravel Fortify:** [laravel.com/docs/fortify](https://laravel.com/docs/fortify)
- **Pest PHP v4 (Testing Framework):** [pestphp.com/docs](https://pestphp.com/docs)
- **Laravel Wayfinder:** [github.com/laravel/wayfinder](https://github.com/laravel/wayfinder)

---

### 1. Padronização de Idioma (A Regra da Fronteira - PT-BR)
- **Customizações do Projeto (Português Obrigatório):** Toda estrutura nova ou customizada (Tabelas, Colunas, Models, Controllers, Actions, Enums, Métodos, Variáveis, Chaves Estrangeiras, Mensagens de Validação e Erros) DEVE ser escrita em Português (ex: `Veiculo`, `cor`, `servico_id`, `CriarUsuarioAction`).
- **Exceção 1 (Nativos do Laravel):** Estruturas nativas do framework (tabela `users`, colunas `email`, `password`, `remember_token`, etc.) permanecem em inglês.
- **Exceção 2 (Termos Técnicos):** Termos técnicos sem tradução direta (ex: `slug`) podem ser mantidos em inglês.
- **Fronteira de Saída:** Tudo que o usuário ou o frontend consome DEVE estar em Português.
- **Chaves Estrangeiras:** Devem seguir o padrão `tabela_singular_id` em português (ex: `servico_id`, `perfil_id`).
- **Localização de Rotas:** Utilizar `Route::resourceVerbs()` no `AppServiceProvider` para traduzir verbos de rotas resource (`create` -> `criar`, `edit` -> `editar`).

---

### 2. Segregação Absoluta de Responsabilidades (Pure Laravel)
- **FormRequest (Validação & Sanitização):** Responsabilidade EXCLUSIVA de validar, autorizar e sanitizar dados de entrada no `prepareForValidation()`. PROIBIDO validar dados no Controller ou na Action.
- **Controller (Orquestração HTTP):** Responsabilidade EXCLUSIVA de receber o Request tipado, invocar a Action com dados/Enums limpos e retornar a resposta (Inertia/Redirect). PROIBIDO regra de negócio ou validações no Controller.
- **Action Class (Regra de Negócio):** Responsabilidade EXCLUSIVA de executar a mutação/processamento do sistema. Recebe objetos/Enums tipados, executa a regra e retorna a Model/coleção resultante ou lança Exception. PROIBIDO criar Actions duplicadas (usar lógica de upsert).
- **Zero Strings Mágicas (Enums Tipados Obrigatórios):** É ESTRITAMENTE PROIBIDO o uso de strings mágicas para representar status, perfis, tipos ou estados do sistema (ex: `'pendente'`, `'ativo'`, `'ADMINISTRADOR'`) diretamente em Actions, Controllers, Models ou Migrations. Toda e qualquer variação de estado ou categoria finita DEVE possuir um Backed Enum tipado correspondente em `app/Enums/` (baseado em `.agents/templates/backend/cadastro.md`), utilizando sempre a constante do Enum (ex: `StatusUsuario::Pendente`) e cast associado na Model.
- **Model (Domínio e Esquema):** Responsável por relacionamentos, mutators/casts (incluindo casts para Enums) e escopos de busca.

---

### 3. Uso de Objetos e Coleções (collect) vs Arrays Brutos
- **Prioridade para Objetos e Instâncias:** Mantenha os dados como objetos/instâncias de Models e Coleções (`collect()`) ao longo de todo o processamento no PHP. Acesse atributos via sintaxe de objeto (`$veiculo->cor`) em vez de sintaxe de array (`$veiculo['cor']`).
- **Evitar Conversão Precoce em Arrays:** É PROIBIDO converter Models/Coleções para arrays puros (`->toArray()`) durante o processamento intermediário ou dentro das Actions. Deixe a conversão para array/JSON exclusivamente para o momento de renderização da resposta do Inertia/API.
- **Uso de Coleções Fluent:** Prefira encadear métodos de Coleções do Laravel (`collect($dados)->map(...)->filter(...)`) em vez de loops `foreach` ou funções nativas legadas de array do PHP.

---

### 4. Controladores por Responsabilidade (Single Responsibility)
- **Single Action Controllers (Invokable):** Ações isoladas fora do CRUD padrão (ex: `ExportarCsvController`, `GerarRelatorioController`, `BuscarVeiculosDisponiveisController`) DEVEM usar o método mágico `__invoke`.
- **Controllers CRUD:** Limitados estritamente às 7 ações padrão de recursos. Não misturar lógicas de relatórios ou ações em massa nos controladores de recursos.
- **Preparação de Dados:** Defina os dados em variáveis locais antes de passar para a resposta (ex: `$veiculos = Veiculo::...; return Inertia::render(...)`). Proibido variáveis de uso único que só servem de repasse.

---

### 5. Validação e Formatação (Sem Validações Redundantes)
- **Confiança no Form Request:** Toda validação deve ocorrer no FormRequest. Se o Request já validou o campo como obrigatório e do tipo correto, é PROIBIDO fazer checagens redundantes de `!== null` ou `is_string` nos Controllers/Actions.
- **Preparação de Dados (prepareForValidation):** Sanitização, limpeza de máscaras (CPF, placa, moeda) ou caixa alta devem ser feitas EXCLUSIVAMENTE no método `prepareForValidation()` do Request usando os Helpers Globais (`app/Support/helpers.php`) ou API fluente de strings. O frontend envia dados brutos e o backend limpa e valida.
- **Acesso Tipado ao Request:** Recuperar dados do Request no Controller usando os métodos tipados nativos: `$request->string()`, `$request->integer()`, `$request->boolean()`, `$request->enum()`. Proibido `$request->all()` desestruturado.
- **Uso de Laravel Precognition:** Utilizar Precognition para validações em tempo real no frontend sem duplicar regras de validação.

---

### 6. Fronteira Backend / Frontend (Retorno Bruto & Wayfinder)
- **Retorno Bruto de Models:** Para alimentar telas Inertia/React, retornar a estrutura pura da Model (`$model->toArray()`) carregando relações via `load()`, anexando atributos virtuais via `append()` e ocultando campos sensíveis via `makeHidden()`. Proibido montar arrays aninhados manuais no PHP.
- **Formatação no Frontend:** O Backend envia apenas dados brutos e puros (números, booleans, strings ISO de datas, valores de Enums). A formatação para exibição na tela (moeda, datas formatadas, textos de Enums) é responsabilidade EXCLUSIVA do Frontend.
- **Zero Hardcoded URLs:** No frontend, usar OBRIGATORIAMENTE rotas geradas pelo Wayfinder (`@/actions/` ou `@/routes/`). Proibido strings fixas de URL.

---

### 7. Verificação de Qualidade Obrigatória
- **Execução do `composer verify`:** Ao finalizar qualquer tarefa backend ou alteração de código, é OBRIGATÓRIO executar o comando `composer verify` para rodar a formatação, análise estática e suíte de testes do projeto antes de considerar a entrega concluída.

---

### 🛡️ Checklist de Entrega do Backend
Antes de finalizar qualquer alteração backend, verifique:
- [ ] **Idioma:** Tabelas, colunas, models, controllers e ações customizadas estão em Português?
- [ ] **Segregação de Responsabilidades:** Request valida e autoriza?
- [ ] **Controller:** Apenas orquestra o fluxo HTTP?
- [ ] **Action:** Executa a regra de negócio e retorna a Model/coleção?
- [ ] **Objetos e Coleções (collect):** Dados são manipulados como objetos/instâncias e coleções em vez de arrays brutos?
- [ ] **Responsabilidade do Controller:** Ações fora do CRUD padrão estão em Controllers Invokable (`__invoke`)?
- [ ] **Sem Redundância de Validação:** O Controller/Action confia na validação do Form Request sem checagens nulas manuais?
- [ ] **Zero Strings Mágicas:** Status, perfis, tipos e categorias usam Enums tipados de `app/Enums/` (ex: `StatusUsuario::Pendente`) em vez de strings soltas no código?
- [ ] **Acesso Tipado ao Request:** Está usando `$request->string()`, `$request->enum()`, `$request->boolean()`?
- [ ] **Limpeza de Dados:** A sanitização ocorre no `prepareForValidation()` com Helpers Globais?
- [ ] **Dados Brutos no Inertia:** O Backend está retornando dados brutos (`$model->toArray()`) sem arrays customizados manuais?
- [ ] **Verificação Final (Obrigatório):** Executou o comando `composer verify` para garantir que o código passou em todos os testes, análise estática e padrões de estilo antes de concluir?
