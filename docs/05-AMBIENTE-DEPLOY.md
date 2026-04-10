# 🌍 Ambiente e Deploy

Guia para configurar o projeto em diferentes ambientes e como o código chega em produção.

## 💻 Ambiente Local (Development)

O projeto utiliza um pipeline simplificado para o desenvolvedor:

1.  **Instalação Inicial:**
    ```bash
    composer setup
    ```
    *(Roda composer install, npm install, gera chaves, migrations e build inicial)*

2.  **Execução Diária:**
    ```bash
    composer dev
    ```
    *(Inicia servidor PHP, Vite e Listener de Fila simultaneamente)*

3.  **Variáveis Principais (.env):**
    - `APP_URL`: Deve refletir o endereço local (ex: `http://localhost:8000`).
    - `DB_CONNECTION`: `sqlite` por padrão para rapidez no kit.

---

## 🚀 Fluxo de Deploy (CI/CD)

O projeto está configurado com **GitLab CI/CD** (ver `.gitlab-ci.yml`).

### Etapas da Pipeline automática:
1.  **Build:** Prepara o ambiente e dependências.
2.  **Lint:** Valida o estilo (Pint e Oxlint).
3.  **Analysis:** Valida tipos (PHPStan L9).
4.  **Test:** Executa os testes (Pest).

### ⚙️ Adicionando Novas Variáveis
Sempre que adicionar uma chave no `.env.example`, você deve:
1.  Informar ao time.
2.  Adicionar em **GitLab > Settings > CI/CD > Variables**.

---

## 🛠 Produção
- **Plataforma Recomendada:** Laravel Cloud ou servidores com suporte a PHP 8.3+.
- **Comando de Build:** `npm run build && php artisan optimize`.
