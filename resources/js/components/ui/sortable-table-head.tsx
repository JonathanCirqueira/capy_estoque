import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';

export interface SortableHeaderProps {
    label: string;
    coluna: string;
    colunaAtiva?: string;
    direcaoAtiva?: 'asc' | 'desc';
    onSort?: (coluna: string) => void;
    className?: string;
    alignCenter?: boolean;
}

export function SortableTableHead({
    label,
    coluna,
    colunaAtiva,
    direcaoAtiva = 'asc',
    onSort,
    className = 'px-2 py-3 xl:px-2.5',
    alignCenter = false,
}: SortableHeaderProps) {
    const estaAtivo = colunaAtiva === coluna;
    const Icone = estaAtivo ? (direcaoAtiva === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

    return (
        <TableHead className={className}>
            <button
                type="button"
                onClick={() => onSort?.(coluna)}
                className={`inline-flex cursor-pointer items-center gap-1.5 font-display text-[11px] font-bold tracking-wider whitespace-nowrap text-muted-foreground/80 uppercase hover:text-foreground focus:outline-hidden ${
                    alignCenter ? 'w-full justify-center' : ''
                }`}
            >
                <span className="whitespace-nowrap">{label}</span>
                <Icone
                    className={`size-3.5 shrink-0 transition-colors ${
                        estaAtivo ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                />
            </button>
        </TableHead>
    );
}
