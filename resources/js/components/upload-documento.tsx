import { Upload, FileText } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CardArquivo } from '@/components/card-arquivo';

interface UploadDocumentoProps {
    arquivo: File | null;
    onChange: (arquivo: File | null) => void;
    placeholder?: string;
    subtitulo?: string;
    accept?: string;
    maxSizeMB?: number;
    temErro?: boolean;
    isView?: boolean;
    className?: string;
    id?: string;
}

export function UploadDocumento({
    arquivo,
    onChange,
    placeholder = 'Arraste o comprovante ou clique para buscar',
    subtitulo = 'PDF, Word ou Imagem de até 10MB',
    accept = '.pdf,.doc,.docx,image/*',
    maxSizeMB = 10,
    temErro = false,
    isView = false,
    className = '',
    id,
}: UploadDocumentoProps) {
    const [estaArrastando, setEstaArrastando] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const lidarComArquivo = (file: File) => {
        if (isView) return;

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`O arquivo não pode exceder o tamanho de ${maxSizeMB}MB.`);
            return;
        }

        onChange(file);
        toast.success('Arquivo anexado com sucesso!');
    };

    const lidarComDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (isView) return;
        setEstaArrastando(false);

        if (e.dataTransfer.files?.[0]) {
            lidarComArquivo(e.dataTransfer.files[0]);
        }
    };

    const removerArquivo = () => {
        if (isView) return;
        onChange(null);
        toast.info('Arquivo removido.');
    };

    return (
        <div className={`w-full min-w-0 ${className}`}>
            {!arquivo ? (
                isView ? (
                    <div className="flex h-24 flex-col items-center justify-center rounded-2xl border border-border/40 bg-muted/10 p-4 text-center">
                        <FileText className="mb-2 size-6 text-muted-foreground/40" />
                        <span className="text-xs font-bold text-muted-foreground">Nenhum arquivo anexado</span>
                    </div>
                ) : (
                    <div
                        role="button"
                        tabIndex={0}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (!isView) setEstaArrastando(true);
                        }}
                        onDragLeave={() => setEstaArrastando(false)}
                        onDrop={lidarComDrop}
                        onClick={() => !isView && inputRef.current?.click()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (!isView) inputRef.current?.click();
                            }
                        }}
                        className={`flex h-24 w-full min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200 ${
                            estaArrastando
                                ? 'scale-[0.99] border-primary bg-primary/5 shadow-sm'
                                : temErro
                                  ? 'border-destructive bg-destructive/5 hover:bg-destructive/10'
                                  : 'border-border/80 bg-muted/10 hover:border-primary/40 hover:bg-muted/15'
                        }`}
                    >
                        <input
                            id={id}
                            type="file"
                            ref={inputRef}
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    lidarComArquivo(e.target.files[0]);
                                }
                            }}
                            accept={accept}
                            className="hidden"
                            disabled={isView}
                        />
                        <div
                            className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${temErro ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}
                        >
                            <Upload className="size-4" strokeWidth={2} />
                        </div>
                        <h5
                            className={`mb-0.5 font-sans text-xs font-bold ${temErro ? 'text-destructive' : 'text-neutral-900 dark:text-white'}`}
                        >
                            {placeholder}
                        </h5>
                        <span className="inline-block text-[9px] font-bold tracking-wider text-muted-foreground/50 uppercase">
                            {subtitulo}
                        </span>
                    </div>
                )
            ) : (
                <CardArquivo
                    className="h-24"
                    nome={arquivo.name}
                    tamanhoBytes={arquivo.size}
                    aoRemover={removerArquivo}
                    isView={isView}
                    tituloRemover="Remover arquivo"
                />
            )}
        </div>
    );
}
