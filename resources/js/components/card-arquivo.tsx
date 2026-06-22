import React from 'react';
import { FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardArquivoProps {
    nome: string;
    tamanhoBytes: number;
    aoRemover?: () => void;
    tituloRemover?: string;
    isView?: boolean;
    className?: string;
}

const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    if (bytes >= k * k) {
        return (bytes / (k * k)).toFixed(dm) + ' MB';
    }
    if (bytes >= k) {
        return (bytes / k).toFixed(dm) + ' KB';
    }
    return bytes + ' Bytes';
};

export function CardArquivo({
    nome,
    tamanhoBytes,
    aoRemover,
    tituloRemover = 'Remover arquivo',
    isView = false,
    className,
}: CardArquivoProps) {
    return (
        <div
            className={cn(
                'relative flex w-full min-w-0 animate-in items-center justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-2xs transition-all duration-200 fade-in-50 hover:border-border hover:shadow-xs',
                className,
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-3 pr-10">
                {/* Ícone do Arquivo */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    <FileText className="size-5" strokeWidth={2} />
                </div>
                {/* Nome e Tamanho */}
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-xs font-bold text-foreground" title={nome}>
                        {nome}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-muted-foreground/80">
                        {formatarTamanhoArquivo(tamanhoBytes)}
                    </span>
                </div>
            </div>

            {/* Botão de Remoção Premium */}
            {!isView && aoRemover && (
                <button
                    type="button"
                    onClick={aoRemover}
                    className="absolute top-1/2 right-4 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-red-50 text-red-500 transition-all hover:bg-red-100 hover:text-red-600 active:scale-95 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                    title={tituloRemover}
                >
                    <X className="size-4" strokeWidth={2} />
                </button>
            )}
        </div>
    );
}
