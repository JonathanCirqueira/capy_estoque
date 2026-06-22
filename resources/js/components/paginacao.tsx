import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginacaoProps {
    paginaAtual: number;
    totalPaginas: number;
    onPaginaAlterada: (pagina: number) => void;
    mostrarDe: number;
    mostrarA: number;
    mostrarTotal: number;
    tipoEntidade?: string;
}

export function Paginacao({
    paginaAtual,
    totalPaginas,
    onPaginaAlterada,
    mostrarDe,
    mostrarA,
    mostrarTotal,
    tipoEntidade = 'patrimônios',
}: PaginacaoProps) {
    if (totalPaginas <= 1) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 border-t border-border/40 bg-muted/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-center text-[10px] font-bold tracking-widest text-muted-foreground/75 uppercase sm:text-left">
                    Mostrando {mostrarDe} de {mostrarA} de {mostrarTotal} {tipoEntidade}
                </span>
            </div>
        );
    }

    // Helper to get pages to show (truncates with ellipsis for sets > 5 pages)
    const obterPaginasExibidas = () => {
        const paginas: (number | string)[] = [];

        if (totalPaginas <= 5) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        }

        // Always show page 1
        paginas.push(1);

        const inicio = Math.max(2, paginaAtual - 1);
        const fim = Math.min(totalPaginas - 1, paginaAtual + 1);

        if (inicio > 2) {
            paginas.push('left-dots');
        }

        for (let i = inicio; i <= fim; i++) {
            paginas.push(i);
        }

        if (fim < totalPaginas - 1) {
            paginas.push('right-dots');
        }

        // Always show last page
        paginas.push(totalPaginas);

        return paginas;
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 border-t border-border/40 bg-muted/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Esquerda: Contador de registros */}
            <span className="text-center text-[10px] font-bold tracking-widest text-muted-foreground/75 uppercase sm:text-left">
                Mostrando {mostrarDe} de {mostrarA} de {mostrarTotal} {tipoEntidade}
            </span>

            {/* Direita: Controles de Página */}
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-center sm:gap-4">
                {/* Botão Anterior */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPaginaAlterada(Math.max(paginaAtual - 1, 1))}
                    disabled={paginaAtual === 1}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border-0 bg-transparent p-0 text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase select-none hover:text-foreground disabled:pointer-events-none disabled:opacity-30 sm:w-auto sm:gap-1.5 sm:px-3"
                >
                    <ChevronLeft className="size-4" strokeWidth={2.5} />
                    <span className="hidden sm:inline">Anterior</span>
                </Button>

                {/* Indicadores Numéricos */}
                <div className="flex items-center gap-1.5 text-sm font-medium">
                    {obterPaginasExibidas().map((pagina) => {
                        if (pagina === 'left-dots' || pagina === 'right-dots') {
                            return (
                                <span
                                    key={pagina}
                                    className="px-1 text-xs font-bold text-muted-foreground/50 select-none"
                                >
                                    ...
                                </span>
                            );
                        }

                        const numeroPagina = pagina as number;
                        const isActive = paginaAtual === numeroPagina;

                        return (
                            <Button
                                key={numeroPagina}
                                variant="ghost"
                                size="sm"
                                onClick={() => onPaginaAlterada(numeroPagina)}
                                className={`h-9 w-9 shrink-0 cursor-pointer rounded-[12px] text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'
                                        : 'bg-transparent text-neutral-800 hover:bg-muted dark:text-neutral-200'
                                }`}
                            >
                                {numeroPagina}
                            </Button>
                        );
                    })}
                </div>

                {/* Botão Próxima */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPaginaAlterada(Math.min(paginaAtual + 1, totalPaginas))}
                    disabled={paginaAtual === totalPaginas}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border-0 bg-transparent p-0 text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase select-none hover:text-foreground disabled:pointer-events-none disabled:opacity-30 sm:w-auto sm:gap-1.5 sm:px-3"
                >
                    <span className="hidden sm:inline">Próxima</span>
                    <ChevronRight className="size-4" strokeWidth={2.5} />
                </Button>
            </div>
        </div>
    );
}
