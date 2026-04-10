# 💎 Design e Identidade Visual

Recursos visuais e diretrizes para garantir que a interface permaneça consistente e premium.

### 🎨 Identidade Visual
O Starter Kit utiliza uma estética moderna baseada em:
- **Cores:** Paletas harmônicas configuradas via **Tailwind CSS 4**.
- **Tipagem:** Fontes modernas (Sans-serif) priorizando a legibilidade.

### 📦 Componentes Base
Utilizamos as seguintes bibliotecas para manter o padrão visual:
- **Radix UI:** Para componentes acessíveis e sem estilo (Primitives).
- **Lucide React:** Nossa biblioteca principal de ícones.
- **Sonner:** Para notificações (toasts) elegantes.

### 🖋️ Guia de Estilo (Figma)
- [Link para o protótipo no Figma - A ser adicionado pelo desenvolvedor]

### 🖼️ Assets e Imagens
- **Localização:** `/public/assets` ou `/resources/images`.
- **Formato:** Use **WebP** sempre que possível para performance.
- **Otimização:** Ative a compressão automática em pipelines de produção.

### 📏 Espaçamentos e Grids
- Seguimos a escala do Tailwind (4px, 8px, 16px...).
- Evite valores "mágicos" (ex: `px-[13px]`). Use sempre as classes do sistema.
