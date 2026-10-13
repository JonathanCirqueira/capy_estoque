import React from 'react';

export type StatusGenerico = 'ativo' | 'inativo' | 'pendente' | 'arquivado' | string;

export interface StatusConfigItem {
    label: string;
    className: string;
}

export interface ColunaTabela<T> {
    id: string;
    campo?: keyof T | string;
    titulo: string;
    ordenavel?: boolean;
    className?: string;
    headerClassName?: string;
    render?: (item: T) => React.ReactNode;
}

export interface FiltroComboboxItem {
    value: string;
    label: string;
}

export interface FiltroGridConfig {
    id: string;
    label: string;
    placeholder: string;
    searchPlaceholder?: string;
    items: FiltroComboboxItem[];
    value?: string;
    onValueChange: (val?: string) => void;
}

export interface ItemTemplateExemplo {
    id: string | number;
    codigo: string;
    titulo: string;
    subtitulo?: string;
    categoria: string;
    departamento: string;
    referencia?: string;
    status: StatusGenerico;
    atualizadoEm: string;
}
