# Starter Kits Team Raphael

Um sistema moderno construído com Laravel 13, React 19 e Inertia 3.

## 🚀 Tecnologias

- **Backend:** Laravel 13
- **Frontend:** React 19 (via Inertia.js 3)
- **Estilização:** Tailwind CSS 4
- **Banco de Dados:** SQLite (padrão) / MySQL / PostgreSQL
- **Ferramentas de Dev:** Laravel Wayfinder, Laravel Boost, Laravel Pail, Laravel Pint, Rector, Essentials, Oxlint (JS/TS Lint)
- **CI/CD:** GitLab CI/CD (Pipeline automatizada)
- **Testes:** Pest 4

## 🛠 Pré-requisitos

- **PHP:** 8.3 ou superior
- **Composer:** Versão mais recente
- **Node.js:** Versão LTS mais recente
- **NPM:** Versão mais recente

## 📦 Instalação

Siga estes passos para configurar o projeto localmente:

**Execute o script de configuração:**
Este script instalará as dependências, configurará o ambiente, gerará as chaves e executará as migrações.

```bash
composer setup
```

_Alternativamente, você pode executar os passos manualmente:_

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

> [!IMPORTANT]
> **Configuração do .env**: Certifique-se de que a variável `APP_URL` no seu arquivo `.env` contenha a porta correta (ex: `http://localhost:8000`). Se a URL estiver incorreta, o Vite e as rotas internas podem não funcionar como esperado ao rodar o `composer dev`.

---

## 🚀 Fluxo de Trabalho Recomendado

Para garantir a máxima qualidade e agilidade no desenvolvimento, utilize estes comandos principais:

- **`composer fix`**: **Use enquanto desenvolve.** Este comando executa o Rector (refatoração PHP), o Pint (estilo PHP) e o Oxlint (linting JS/TS). Ele garante que todo o seu projeto esteja moderno e limpo de uma só vez.
- **`composer verify`**: **Use antes de cada Commit/Push.** É o nosso "pré-vôo". Ele valida se a lógica está correta (Rector dry-run), se o frontend está saudável (Oxlint), se não há erros de tipo (PHPStan) e se todos os testes passam (Pest). Se este comando der "verde", seu projeto está impecável!
- **`composer test`**: Executa a suíte completa de testes (Pest) com limpeza de cache e validação de estilo automática.
- **`composer setup`**: Prepara o ambiente completo para um novo desenvolvedor (instala dependências, gera chaves, roda migrations e compila o front).

---

## 💻 Desenvolvimento

Para iniciar o ambiente de desenvolvimento (incluindo Vite, servidor Laravel e o listener de filas):

```bash
composer dev
```

A aplicação estará disponível em `http://localhost:8000`.

---

## 🧪 Testes e Qualidade Detalhada

### Testes Automatizados (Pest 4)

O projeto utiliza o **Pest 4** para garantir a qualidade funcional.

- **Executar todos os testes:** `composer test`
- **Executar um teste específico:** `php artisan test --filter NomeDoTeste`

O comando `composer test` realiza automaticamente a limpeza de cache, verificação de estilo (Lint) e execução dos testes lógicos.

### Análise Estática (PHPStan/Larastan)

Configurado no **Nível 9** (Máximo) para garantir total segurança de tipos.

- **Executar Análise:** `composer phpstan`
- **Dica:** No Nível 9, use `assert($user instanceof User)` para informar ao analisador sobre tipos garantidos em tempo de execução.

### Refatoração Automática (Rector)

Automatiza a modernização do PHP e limpeza de código.

- **Simular Alterações:** `composer rector:check`
- **Aplicar Alterações:** `composer rector` (Ou use o `composer fix` para rodar junto com o Pint).

### Linting Frontend (Oxlint)

O projeto utiliza o **Oxlint** para garantir a qualidade do código JavaScript e TypeScript de forma ultrarápida (execução em milissegundos).

- **Verificar Frontend:** `npm run lint` ou `composer oxlint`
- **Corrigir Automaticamente:** `npm run lint:fix` ou `composer oxlint:fix`

O Oxlint está integrado aos comandos `fix` e `verify` do Composer, garantindo que toda a aplicação seja validada em um único comando.

### Laravel Essentials

Este projeto utiliza o pacote `nunomaduro/essentials` para blindar a aplicação:

- **Strict Models:** Bloqueia Lazy Loading e atributos inexistentes.
- **Datas Imutáveis:** Uso de `CarbonImmutable`.
- **Comandos de Ação:** Crie lógicas de negócio com `php artisan make:action Name`.
- **Testes Blindados:** Bloqueia requisições reais e automatiza mocks de `sleep()`.

---

## 📂 Estrutura do Projeto

- `app/`: Lógica central do backend (Controllers, Models, Providers).
- `database/`: Migrações, factories e seeders.
- `resources/js/`: Componentes React e páginas.
- `routes/`: Definições de rotas Web e API.
- `tests/`: Testes de Funcionalidade (Feature) e Unidade (Unit) usando Pest.

## 📦 Outros Comandos Úteis

- `composer clear`: Limpa todos os caches da aplicação (optimize, config, etc).
- `composer fresh`: Reseta o banco de dados e roda os seeders.
- `composer ide`: Gera arquivos de helper para melhor autocompletar na IDE (VS Code/Storm).

---

## 🔄 Integração Contínua (CI/CD)

Este projeto já vem com uma pipeline do **GitLab CI/CD** configurada no arquivo `.gitlab-ci.yml`. Sempre que você enviar código para o repositório, as seguintes etapas serão executadas automaticamente:

1.  **Build:** Instalação de dependências (PHP e JS) e compilação do frontend (Vite).
2.  **Lint:** Verificação de estilo com Laravel Pint (PHP) e Oxlint (JS/TS).
3.  **Analysis:** Análise estática com PHPStan (Nível 9).
4.  **Test:** Execução da suíte de testes com Pest.

### ⚙️ Configuração no GitLab

Para que a pipeline funcione corretamente, especialmente na etapa de deploy ou caso você adicione integrações externas:

1.  Vá em **Settings > CI/CD > Variables** no seu projeto no GitLab.
2.  Adicione as variáveis do seu arquivo `.env` que são necessárias para a execução (ex: `APP_KEY`, chaves de API, etc.).
3.  **Nota:** Para os testes automatizados, a pipeline utiliza **SQLite em memória**, portanto não é necessário configurar variáveis de banco de dados para a etapa de teste.

> [!IMPORTANT]
> Se você adicionar uma nova variável obrigatória ao `.env.example`, certifique-se de adicioná-la também nas **Variables** do GitLab para não quebrar a pipeline.

---
