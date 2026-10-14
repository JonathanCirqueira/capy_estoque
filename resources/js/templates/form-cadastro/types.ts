import React from 'react';

export type FormMode = 'create' | 'edit' | 'view';

export interface FormOptionItem {
    value: string;
    label: string;
}

export interface ModalCadastroProps<T = any> {
    aberto: boolean;
    onAbertoAlterado: (aberto: boolean) => void;
    onConfirmar?: (itemSalvo?: T) => void;
    item?: T | null;
    modo?: FormMode;
    isEdit?: boolean;
    opcoes?: Record<string, FormOptionItem[]>;
}

export interface PageCadastroProps<T = any> {
    id?: string | number | null;
    mode?: FormMode;
    isEdit?: boolean;
    item?: T | null;
    opcoesIniciais?: Record<string, FormOptionItem[]>;
}

export interface FormTabStep {
    id: string;
    label: string;
    icon?: React.ReactNode;
    descricao?: string;
}

// -----------------------------------------------------------------------------
// DADOS MOCK / TIPAGEM PARA EXEMPLO SIMPLES (<= 8 CAMPOS -> MODAL)
// -----------------------------------------------------------------------------
export interface ExemploCadastroSimples {
    id?: string | number;
    nome: string;
    email: string;
    cargo_id: string;
    departamento_id: string;
    telefone?: string;
    status: 'ativo' | 'inativo' | 'pendente';
    observacoes?: string;
}

// -----------------------------------------------------------------------------
// DADOS MOCK / TIPAGEM PARA EXEMPLO COMPLEXO (> 8 CAMPOS -> PÁGINA COM ABAS)
// -----------------------------------------------------------------------------
export interface ExemploCadastroComplexo {
    id?: string | number;
    // Etapa 1: Dados Gerais
    codigo: string;
    nome: string;
    categoria_id: string;
    departamento_id: string;
    responsavel_id: string;
    status: 'ativo' | 'inativo' | 'pendente';
    // Etapa 2: Especificações Técnicas e Fiscais
    numero_serie?: string;
    numero_nota_fiscal?: string;
    data_aquisicao?: string;
    valor_aquisicao?: string;
    centro_custo_id?: string;
    fornecedor_id?: string;
    // Etapa 3: Localização e Anexos
    localizacao_fisica?: string;
    garantia_meses?: string;
    observacoes?: string;
    anexo_documento?: File | null;
}
