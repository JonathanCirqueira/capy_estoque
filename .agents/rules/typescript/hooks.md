---
trigger: glob
globs: "**/*.{ts,tsx,js,jsx}"
---

# TypeScript/JavaScript Verification Hooks

> Diretrizes de verificação contínua, formatação e auditoria de código TypeScript/JavaScript.

## Verificação Pós-Edição (Tool Execution & Linter)

Sempre que arquivos TypeScript (`.ts`, `.tsx`) ou JavaScript (`.js`, `.jsx`) forem criados ou modificados:

1. **Checagem de Tipos (TypeScript Check)**:
   - Garanta que não existam erros de compilação ou incompatibilidade de tipos (`npx tsc --noEmit`).
   - Todos os tipos devem ser resolvidos com sucesso sem necessidade de supressões (`@ts-ignore` é terminantemente desencorajado; se inevitável, use `@ts-expect-error` com justificativa explícita).

2. **Formatação e Linter**:
   - Mantenha a formatação consistente via Prettier e ESLint.
   - Respeite o arquivo de configuração existente do projeto (`eslint.config.js`).

3. **Auditoria de `console.log`**:
   - Antes de concluir qualquer tarefa ou entrega, faça uma varredura nos arquivos alterados para remover logs residuais de depuração (`console.log`, `console.dir`, `console.table`).
   - Apenas logs deliberados de erro (`console.error` em capturas críticas de exceção) são tolerados caso não haja um logger externo configurado.

## Critérios de Conclusão de Tarefa (Stop Checks)

Antes de considerar qualquer alteração em TypeScript/JavaScript como concluída:
- [ ] O código compila sem erros de tipagem (`tsc`).
- [ ] O bundle do Vite constrói com sucesso sem referências quebradas (`npm run build`).
- [ ] Nenhum `console.log` temporário esquecido no código.
- [ ] As rotas e ações geradas via Wayfinder estão devidamente sincronizadas caso rotas do Laravel tenham sido alteradas.
