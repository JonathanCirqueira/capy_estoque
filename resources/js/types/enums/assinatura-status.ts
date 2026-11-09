export const AssinaturaStatus = {
    Active: 'active',
    PastDue: 'past_due',
    Canceled: 'canceled',
    Trialing: 'trialing',
    Incomplete: 'incomplete',
} as const;

export type AssinaturaStatus = (typeof AssinaturaStatus)[keyof typeof AssinaturaStatus];
