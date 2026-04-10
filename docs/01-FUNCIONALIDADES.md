# 🚀 Funcionalidades e Regras de Negócio

Este documento descreve o comportamento esperado das principais funcionalidades do projeto.

---

## Módulo: Dashboard

### 🎯 Objetivo
Fornecer uma visão geral do sistema após a autenticação, centralizando as métricas e acessos rápidos.

### 👥 Perfis de Acesso (Roles)
- **Guest:** Não tem acesso ao dashboard (redirecionado para Login).
- **User/Admin:** Acesso total à visualização do painel.

### 🛠️ Regras de Negócio
- [x] O usuário deve estar autenticado para acessar a rota `/dashboard`.
- [ ] O dashboard deve carregar dados via Inertia Props.

### 🖥️ Estados da Interface (UI States)
| Estado | Comportamento |
| :--- | :--- |
| **Loading** | Exibir Skeleton animado nos cards de informação. |
| **Empty** | Mostrar mensagem amigável caso não existam dados para exibição. |
| **Error** | Toast de erro (Sonner) informando falha na conexão. |

---

## Módulo: Configurações (Settings)

### 🎯 Objetivo
Permitir que o usuário gerencie seu perfil e preferências do sistema.

### 🛠️ Regras de Negócio
- [ ] Edição de perfil (via Fortify).
- [ ] Troca de senha e segurança.

---
*(Repite a estrutura acima para cada novo módulo criado no sistema)*
