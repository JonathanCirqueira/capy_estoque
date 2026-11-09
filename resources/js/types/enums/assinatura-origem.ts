export const AssinaturaOrigem = {
    Manual: 'manual',
    Stripe: 'stripe',
} as const;

export type AssinaturaOrigem = (typeof AssinaturaOrigem)[keyof typeof AssinaturaOrigem];
