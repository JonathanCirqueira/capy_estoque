# 🎨 Guia de Estilo e Padrões

Para manter a consistência, seguimos as regras abaixo:

### 📝 PHP (Backend)

- **Estilo:** Seguimos o padrão do Laravel via **Laravel Pint**.
- **Análise Estática:** **PHPStan Nível 9** (obrigatório).
- **Refatoração:** **Rector** é utilizado para manter o PHP moderno (v8.3+).
- **Tipagem:** Uso obrigatório de `strict_types=1` e tipagem completa em métodos.

### ⚛️ React/TS (Frontend)

- **Componentes:** ` shadcn/ui` (ex: `ButtonSubmit.tsx`).
- **Hooks:** Prefixados com `use` (ex: `useUser.ts`).
- **Lint:** **Oxlint** para velocidade máxima e **ESLint** para regras complexas.
- **Formatação:** **Prettier** (integrado com Tailwind CSS for sorting classes).

### 🌿 Git e Commits

Seguimos o padrão **Conventional Commits**:

- `feat:` Nova funcionalidade.
- `fix:` Correção de bug.
- `chore:` Manutenção de build/libs.
- `docs:` Alteração apenas em documentação.
- `refactor:` Mudança de código que não corrige bug nem adiciona funcionalidade.

### 🧪 Testes

- **Backend:** **Pest 4** (Feature e Unit). Cobertura mínima desejada: **80%**.

### ⚓ Hooks de Git (Husky)

O projeto utiliza **Husky** para rodar verificações automáticas no `pre-commit`:

- Roda linting e formatação apenas nos arquivos modificados (lint-staged).
