import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PaginacaoProps {
    paginaAtual?: number;
    totalPaginas?: number;
    onPaginaAlterada?: (pagina: number) => void;
    aoMudarPagina?: (pagina: number) => void;
    mostrarDe?: number;
    mostrarA?: number;
    mostrarTotal?: number;
    totalItens?: number;
    tipoEntidade?: string;
    itensPorPagina?: number;
    opcoesItensPorPagina?: number[];
    onItensPorPaginaAlterado?: (itens: number) => void;
    aoMudarItensPorPagina?: (itens: number) => void;
}

export function Paginacao({
    paginaAtual = 1,
    totalPaginas,
    onPaginaAlterada,
    aoMudarPagina,
    mostrarDe,
    mostrarA,
    mostrarTotal,
    totalItens,
    tipoEntidade = 'registros',
    itensPorPagina = 10,
    opcoesItensPorPagina = [10, 15, 20, 25, 50],
    onItensPorPaginaAlterado,
    aoMudarItensPorPagina,
}: PaginacaoProps) {
    // Normalização de Handlers e Dados
    const handlePagina = onPaginaAlterada ?? aoMudarPagina ?? (() => {});
    const handleItensPorPagina = onItensPorPaginaAlterado ?? aoMudarItensPorPagina;

    const totalRegistros = mostrarTotal ?? totalItens ?? 0;
    const totalPaginasCalculado = totalPaginas ?? Math.max(1, Math.ceil(totalRegistros / itensPorPagina));

    const de = mostrarDe ?? (totalRegistros > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0);
    const ate = mostrarA ?? Math.min(paginaAtual * itensPorPagina, totalRegistros);

    // Helper para gerar números de página (truncados com reticências para > 5 páginas)
    const obterPaginasExibidas = () => {
        const paginas: (number | string)[] = [];

        if (totalPaginasCalculado <= 1) {
            return [1];
        }

        if (totalPaginasCalculado <= 5) {
            return Array.from({ length: totalPaginasCalculado }, (_, i) => i + 1);
        }

        // Sempre exibe a primeira página
        paginas.push(1);

        const inicio = Math.max(2, paginaAtual - 1);
        const fim = Math.min(totalPaginasCalculado - 1, paginaAtual + 1);

        if (inicio > 2) {
            paginas.push('left-dots');
        }

        for (let i = inicio; i <= fim; i++) {
            paginas.push(i);
        }

        if (fim < totalPaginasCalculado - 1) {
            paginas.push('right-dots');
        }

        // Sempre exibe a última página
        paginas.push(totalPaginasCalculado);

        return paginas;
    };

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 bg-muted/5 p-5 sm:flex-row">
            {/* Esquerda: Contador de registros e Seletor por Página */}
            <div className="flex flex-wrap items-center gap-2.5 text-center sm:text-left">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/75 uppercase">
                    Mostrando {de} de {ate} de {totalRegistros} {tipoEntidade}
                </span>

                {itensPorPagina && handleItensPorPagina && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground/40">•</span>
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                            Exibir
                        </span>
                        <Select
                            value={String(itensPorPagina)}
                            onValueChange={(val) => handleItensPorPagina(Number(val))}
                        >
                            <SelectTrigger
                                size="sm"
                                className="h-7 w-16 cursor-pointer rounded-lg border-border/70 bg-background px-2.5 text-xs font-semibold shadow-2xs dark:bg-card"
                            >
                                <SelectValue placeholder={String(itensPorPagina)} />
                            </SelectTrigger>
                            <SelectContent
                                side="top"
                                align="center"
                                className="w-16 min-w-16 rounded-xl border border-border/60 p-1 shadow-lg"
                            >
                                {opcoesItensPorPagina.map((opcao) => (
                                    <SelectItem
                                        key={opcao}
                                        value={String(opcao)}
                                        className="cursor-pointer px-2 py-1 text-xs"
                                    >
                                        {opcao}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                            por página
                        </span>
                    </div>
                )}
            </div>

            {/* Direita: Controles de Página */}
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-center sm:gap-4">
                {/* Botão Anterior */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePagina(Math.max(paginaAtual - 1, 1))}
                    disabled={paginaAtual <= 1}
                    className="flex h-8 items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase select-none hover:bg-muted/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                    <ChevronLeft className="size-3.5" strokeWidth={2.5} />
                    <span>Anterior</span>
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
                                onClick={() => handlePagina(numeroPagina)}
                                className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90'
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
                    onClick={() => handlePagina(Math.min(paginaAtual + 1, totalPaginasCalculado))}
                    disabled={paginaAtual >= totalPaginasCalculado}
                    className="flex h-8 items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase select-none hover:bg-muted/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                    <span>Próxima</span>
                    <ChevronRight className="size-3.5" strokeWidth={2.5} />
                </Button>
            </div>
        </div>
    );
}
