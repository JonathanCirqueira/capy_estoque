---
trigger: glob
globs: "resources/**/*.{ts,tsx,js,jsx}"
---

# React Security

> Diretrizes de segurança, prevenção contra XSS, vazamento de credenciais e integridade de dados para aplicações React 19 + TypeScript.

## Prevenção de XSS via `dangerouslySetInnerHTML`

A prop `dangerouslySetInnerHTML` representa um risco crítico de Cross-Site Scripting (XSS). O uso deve ser tratado como exceção rigorosa e auditada.

```tsx
// CRÍTICO: Entrada de usuário não sanitizada diretamente no HTML
<div dangerouslySetInnerHTML={{ __html: userBio }} />

// OPÇÕES SEGURAS:

// 1. Renderizar como texto padrão (React realiza escape automático de entidades)
<div>{userBio}</div>

// 2. Renderizar markdown através de biblioteca com sanitizador embutido
<ReactMarkdown>{userBio}</ReactMarkdown>

// 3. Se HTML for estritamente obrigatório, sanitize com DOMPurify antes de injetar
import DOMPurify from "isomorphic-dompurify";

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBio) }} />
```

### Checklist para `dangerouslySetInnerHTML`:
- A origem do dado é 100% confiável e gerada internamente pelo sistema?
- Se o dado puder sofrer qualquer edição ou influência do usuário, está sanitizado **no ponto exato de uso**?
- A configuração do sanitizador utiliza uma allowlist restritiva de tags e atributos permitidos?

## Esquemas Inseguros de URLs

URLs com protocolo `javascript:` ou `data:` passadas para `href`, `src` ou `action` podem executar scripts maliciosos no contexto do usuário.

```tsx
// VULNERÁVEL: Injeção de link malicioso se user.website = "javascript:alert(document.cookie)"
<a href={user.website}>Visitar site</a>

// CORRETO: Validação explícita de esquema seguro
function getSafeUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      return url;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

<a href={getSafeUrl(user.website)}>Visitar site</a>
```

## `target="_blank"` sem `rel`

Links que abrem em nova aba (`target="_blank"`) sem proteção expõem a aplicação a ataques de `tabnabbing`, permitindo que a nova página redirecione a aba de origem via `window.opener`.

```tsx
// VULNERÁVEL
<a href={externalUrl} target="_blank">Acessar</a>

// CORRETO
<a href={externalUrl} target="_blank" rel="noopener noreferrer">Acessar</a>
```

## Exposição de Segredos via Variáveis de Ambiente

No Vite (utilizado em nosso ambiente Laravel):
- Apenas variáveis prefixadas com `VITE_` são expostas ao bundle JavaScript do cliente através de `import.meta.env.VITE_*`.
- Variáveis sem o prefixo `VITE_` permanecem restritas ao ambiente do servidor.

```ts
// CRÍTICO: Chave secreta exposta no bundle público do navegador!
const stripeSecret = import.meta.env.VITE_STRIPE_SECRET_KEY; // NUNCA faça isso

// CORRETO: Apenas chaves públicas de cliente no frontend
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
```
*Nunca adicione chaves secretas de APIs, senhas ou credenciais de banco de dados com o prefixo `VITE_`.*

## Autenticação e Autorização

- **Não armazene tokens de sessão ou dados sensíveis no `localStorage`**: Qualquer falha de XSS concede acesso total ao storage. Em nossa stack, a autenticação utiliza cookies httpOnly seguros gerenciados pelo Laravel Fortify/Session.
- **Interface não é Barreira de Segurança**: Condições no JSX como `{user.isAdmin && <AdminButton />}` ocultam o botão visualmente, mas **não protegem o recurso**. O backend (Laravel Policies, Gates e FormRequests) deve obrigatoriamente validar as permissões a cada requisição.
- **Proteção CSRF**: O Laravel e o Inertia mantêm proteção CSRF transparente via token `X-XSRF-TOKEN`. Certifique-se de não desabilitar o middleware CSRF em rotas web.

## Prototype Pollution via Object Spread

Evite espalhar objetos arbitrários e não tipados recebidos de APIs ou usuários diretamente no estado da aplicação:

```tsx
// VULNERÁVEL: Atacante pode injetar propriedades como "__proto__"
const payload = await res.json();
setState({ ...state, ...payload });

// CORRETO: Validar e sanitizar campos permitidos via Schema (Zod) ou DTO estrito
const UserUpdateSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
const validatedData = UserUpdateSchema.parse(await res.json());
setState({ ...state, ...validatedData });
```

## Dependências e Bibliotecas de Terceiros

- Execute `npm audit` periodicamente antes de introduzir novos pacotes de componentes de UI.
- Verifique se bibliotecas de terceiros (editores rich text, visualizadores de código) sanitizam adequadamente suas entradas.
- Mantenha sourcemaps desabilitados ou restritos em builds de produção para evitar expor a árvore de código-fonte interna da aplicação.
