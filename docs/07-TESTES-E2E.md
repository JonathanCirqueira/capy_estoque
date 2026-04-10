# 🧪 Testes E2E e Qualidade

Nossa estratégia para garantir que o sistema não quebre após novas implementações.

### 🧪 Testes de Backend (Pest 4)

Focamos em Testes de Funcionalidade (Feature Tests) que simulam o comportamento do usuário final.

- **Localização:** `/tests/Feature`
- **Execução:** `composer test` ou `php artisan test`.

### 📊 Cobertura e Qualidade

Para garantir o "Green" no `composer verify`:

1.  **Sem Erros de Tipo:** PHPStan deve estar limpo.
2.  **Lint Passando:** Pint (PHP) e Oxlint (JS) sem pendências.
3.  **Testes Passando:** Nenhum teste falhando.

### 💡 Dicas para Testes

- Use **Factories** para criar dados de teste.
- Evite testes que dependem de APIs externas (use Mocks).
- Mantenha os testes independentes uns dos outros.
