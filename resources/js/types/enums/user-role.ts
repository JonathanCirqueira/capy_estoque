export const UserRole = {
    Admin: 'admin',
    UsuarioPadrao: 'usuario_padrao',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
