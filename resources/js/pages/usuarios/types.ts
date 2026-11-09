import type { AssinaturaOrigem } from '@/types/enums/assinatura-origem';
import type { AssinaturaStatus } from '@/types/enums/assinatura-status';
import type { PlanoCiclo } from '@/types/enums/plano-ciclo';
import type { UserRole } from '@/types/enums/user-role';
import type { UserStatus } from '@/types/enums/user-status';

export interface PlanoResumo {
    id: number;
    nome: string;
    ciclo: PlanoCiclo;
    preco_centavos: number;
}

export interface UsuarioListItem {
    id: number;
    name: string;
    email: string;
    empresa?: string | null;
    telefone?: string | null;
    cpf_cnpj?: string | null;
    role: UserRole;
    status: UserStatus;
    created_at: string;
    plano_id?: number | null;
    plano?: PlanoResumo | null;
    assinatura_status?: AssinaturaStatus | null;
    assinatura_origem?: AssinaturaOrigem | null;
    data_inicio?: string | null;
    data_vencimento?: string | null;
    cancel_at_period_end?: boolean;
}

export interface UsuariosPageProps {
    usuarios: {
        data: UsuarioListItem[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page: number;
    };
    contadores: {
        todos: number;
        ativo: number;
        pendente: number;
        inativo: number;
    };
    filtros: {
        busca?: string;
        aba?: string;
        role?: string;
        assinatura?: string;
        ordem_campo?: string;
        ordem_direcao?: 'asc' | 'desc';
        page?: number;
        per_page?: number;
    };
}

export interface ConvidarUsuarioFormData {
    name: string;
    email: string;
    empresa: string;
    telefone: string;
    cpf_cnpj: string;
    role: UserRole;
}

export interface EditarUsuarioFormData {
    name: string;
    email: string;
    empresa: string;
    telefone: string;
    cpf_cnpj: string;
    role: UserRole;
}
