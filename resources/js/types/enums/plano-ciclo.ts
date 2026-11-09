export const PlanoCiclo = {
    Mensal: 'mensal',
    Anual: 'anual',
} as const;

export type PlanoCiclo = (typeof PlanoCiclo)[keyof typeof PlanoCiclo];
