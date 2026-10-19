---
trigger: glob
globs: "{app,database,routes,tests}/**/*.php"
---

# PHP / Laravel Verification Hooks

> Verificações pós-edição, formatação com Pint e execução obrigatória de testes com Pest v4.

## Verificação Pós-Edição (Tool Execution & Linter)

Sempre que arquivos PHP (`.php`) forem criados ou modificados:

1. **Formatação Automática (Laravel Pint)**:
   - Execute o Pint nos arquivos alterados para assegurar conformidade com as regras PSR-12 / PER-CS:
     ```bash
     vendor/bin/pint --dirty --format agent
     ```

2. **Verificação de Testes (Pest v4)**:
   - Toda alteração de lógica de backend deve ser acompanhada e validada por testes automatizados com Pest:
     ```bash
     php artisan test --compact
     ```
   - Para rodar apenas o teste relacionado ao arquivo editado:
     ```bash
     vendor/bin/pest tests/Feature/SpecificTest.php
     ```

3. **Verificação de Rotas e Configurações**:
   - Ao alterar rotas: certifique-se de que não há colisões ou erros de sintaxe via `php artisan route:list`.
   - Ao alterar configurações ou variáveis de ambiente: verifique com `php artisan config:show {key}`.

## Critérios de Conclusão de Tarefa (Stop Checks)

Antes de considerar qualquer alteração no backend PHP como concluída:
- [ ] O código passou sem alertas no `vendor/bin/pint --dirty`.
- [ ] A suíte de testes relevante passou com sucesso no Pest (`php artisan test`).
- [ ] Nenhum método temporário de depuração (`dd()`, `dump()`, `ray()`, `var_dump()`) foi deixado no código.
- [ ] O comando foi executado com a flag `--no-interaction` para evitar travamentos em CLI interativa.
