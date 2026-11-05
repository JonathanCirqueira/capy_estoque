export const UserStatus = {
    Pendente: 'pendente',
    Ativo: 'ativo',
    Inativo: 'inativo',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
