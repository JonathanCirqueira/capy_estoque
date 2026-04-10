# 📖 Glossário e Tabela de Status

Este documento serve como a "fonte da verdade" para termos e códigos utilizados no sistema.

---

### 🚦 Status Globais (Exemplo)
| Valor | Label UI | Descrição |
| :--- | :--- | :--- |
| `active` | Ativo | Documento ou usuário operando normalmente. |
| `inactive` | Inativo | Desativado manualmente por um administrador. |
| `pending` | Pendente | Aguardando verificação de e-mail ou aprovação. |

---

### 🔍 Dicionário Técnico (Project Context)

- **Inertia.js:** A "cola" entre o Laravel e o React, permitindo criar apps sem API REST de forma clássica.
- **Wayfinder:** Ferramenta que gera tipos TypeScript para as rotas do Laravel, permitindo usar `wayfinder().route('name')` com segurança.
- **Strict Model:** Um modelo que lança exceção se você tentar acessar um campo que não foi carregado (evita Silent Failures).
- **Action:** Classe que contém uma única lógica de negócio reutilizável.
- **SSR (Server Side Rendering):** Renderização inicial do React feita no servidor para melhor performance e SEO.

---
*(O desenvolvedor deve adicionar aqui os termos específicos do domínio do negócio)*
