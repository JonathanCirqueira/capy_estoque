---
trigger: glob
globs: "**/*.{ts,tsx,js,jsx}"
---

# TypeScript/JavaScript Security

> Diretrizes de segurança, proteção de credenciais, tipagem estrita e validação de runtime em TypeScript/JavaScript.

## Gerenciamento Seguro de Segredos e Variáveis de Ambiente

**NUNCA insira chaves secretas, credenciais de banco ou tokens de API diretamente no código-fonte.**

```typescript
// CRÍTICO: Chave secreta inserida diretamente no código
const apiKey = "sk-proj-1234567890abcdef";

// CORRETO: Leitura via variável de ambiente com falha rápida caso ausente

// No ambiente Node / Scripts:
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("Variável de ambiente API_KEY não configurada.");
}

// No ambiente Vite (Frontend):
// Apenas variáveis com prefixo VITE_ são públicas no bundle do cliente!
const publicApiKey = import.meta.env.VITE_PUBLIC_API_KEY;
if (!publicApiKey) {
  throw new Error("Variável VITE_PUBLIC_API_KEY não configurada.");
}
```

*Atenção: Qualquer valor acessado via `import.meta.env.VITE_*` torna-se visível publicamente no navegador do cliente.*

## Tipagem Estrita como Barreira de Segurança

- **Evite Type Assertions forçadas (`as unknown as TargetType`)**: Type casting burla a verificação do compilador e mascara falhas graves de runtime.
- **Validação em Runtime na Fronteira do Sistema**: O compilador TypeScript opera apenas em tempo de desenvolvimento/compilação. Dados vindos de APIs externas, formulários ou WebSockets devem ser validados em runtime usando schemas estritos (ex: Zod):

```typescript
import { z } from "zod";

const ExternalPayloadSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
});

export function processExternalData(raw: unknown) {
  // Validação segura com runtime check
  const data = ExternalPayloadSchema.parse(raw);
  return data;
}
```

## Prevenção contra Execução Dinâmica de Código

- O uso de `eval()`, `new Function()` ou `setTimeout` passando strings é estritamente proibido.
- Evite `window.postMessage` sem validação explícita de `event.origin`.

## Suporte de Agente

- Utilize o agente `security-auditor` ou as regras de segurança dedicadas para auditorias completas de vulnerabilidades em dependências (`npm audit`) e fluxo de dados.
