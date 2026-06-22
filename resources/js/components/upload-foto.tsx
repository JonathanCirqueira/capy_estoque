import { Camera, X } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';

interface UploadFotoProps {
    foto: File | null;
    fotoPreview: string | null;
    onChange: (arquivo: File | null, previewUrl: string | null) => void;
    temErro?: boolean;
    aspectRatioClassName?: string;
    minHeightClassName?: string;
}

export function UploadFoto({
    foto,
    fotoPreview,
    onChange,
    temErro = false,
    aspectRatioClassName = 'aspect-video',
    minHeightClassName = 'min-h-[200px]',
}: UploadFotoProps) {
    const [estaArrastando, setEstaArrastando] = useState(false);
    const inputFotoRef = useRef<HTMLInputElement>(null);

    const lidarComArquivoFoto = (arquivo: File) => {
        if (!arquivo.type.startsWith('image/')) {
            toast.error('Por favor, selecione um arquivo de imagem (PNG, JPG ou JPEG).');

            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            toast.error('A imagem do comprovante não deve exceder 5MB.');

            return;
        }

        const previewUrl = URL.createObjectURL(arquivo);
        onChange(arquivo, previewUrl);
        toast.success('Foto da plaquinha vinculada com sucesso!');
    };

    const lidarComDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setEstaArrastando(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            lidarComArquivoFoto(e.dataTransfer.files[0]);
        }
    };

    const removerFoto = () => {
        if (fotoPreview) {
            URL.revokeObjectURL(fotoPreview);
        }

        onChange(null, null);
        toast.info('Foto removida.');
    };

    return (
        <div
            className={`relative w-full rounded-2xl border p-2.5 transition-all duration-300 ${
                temErro ? 'border-destructive bg-destructive/5' : 'border-border/80 bg-muted/40'
            }`}
        >
            {!fotoPreview ? (
                <div
                    role="button"
                    tabIndex={0}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setEstaArrastando(true);
                    }}
                    onDragLeave={() => setEstaArrastando(false)}
                    onDrop={lidarComDrop}
                    onClick={() => inputFotoRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            inputFotoRef.current?.click();
                        }
                    }}
                    className={`flex ${aspectRatioClassName} ${minHeightClassName} w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-all duration-300 ${
                        temErro ? 'border-destructive/40' : 'border-border/40'
                    } ${estaArrastando ? 'scale-[0.99] bg-primary/5' : 'hover:bg-muted/10'}`}
                >
                    <input
                        id="foto-plaquinha-input"
                        type="file"
                        ref={inputFotoRef}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                lidarComArquivoFoto(e.target.files[0]);
                            }
                        }}
                        accept="image/*"
                        className="hidden"
                    />

                    <div className="mb-3 flex h-10 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 hover:scale-110">
                        <Camera className="size-5" strokeWidth={2} />
                    </div>

                    <h5 className="mb-1 font-sans text-[11px] leading-tight font-bold text-neutral-900 dark:text-white">
                        Arraste a foto da plaquinha ou clique para buscar
                    </h5>
                    <p className="max-w-[220px] text-[10px] leading-relaxed text-muted-foreground/80">
                        Capture uma foto nítida e bem iluminada da plaqueta física de patrimônio fixada no bem.
                    </p>
                    <span className="mt-2.5 inline-block rounded-md bg-muted px-2 py-0.5 text-[8px] font-bold tracking-wider text-muted-foreground/75 uppercase">
                        PNG, JPG ou JPEG • Até 5MB
                    </span>
                </div>
            ) : (
                /* Pré-visualização Premium com Ambient Blur de Fundo e Imagem Principal centralizada com padding e bordas uniformes */
                <div className="flex flex-col">
                    <div
                        className={`relative ${aspectRatioClassName} ${minHeightClassName} w-full overflow-hidden rounded-xl border border-border/30 bg-card`}
                    >
                        {/* Camada Ambient Blur */}
                        <img
                            src={fotoPreview}
                            alt=""
                            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl select-none"
                        />
                        {/* Imagem Principal */}
                        <img
                            src={fotoPreview}
                            alt="Comprovante de plaquinha de patrimônio"
                            className="relative z-10 h-full w-full object-contain p-2"
                        />

                        {/* Botão de Excluir Flutuante */}
                        <button
                            type="button"
                            onClick={removerFoto}
                            className="absolute top-2.5 right-2.5 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/85"
                            title="Remover foto"
                        >
                            <X className="size-4" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Tarjeta de informações do arquivo abaixo da imagem, estilo Polaroid */}
                    <div className="mt-2.5 flex items-center justify-between px-1 text-[10px] font-semibold text-muted-foreground/95">
                        <span className="max-w-[180px] truncate text-neutral-800 sm:max-w-[240px] dark:text-neutral-200">
                            {foto ? foto.name : 'Imagem comprobatória cadastrada'}
                        </span>
                        {foto && (
                            <span className="shrink-0 font-mono text-[9px] font-bold text-muted-foreground/75">
                                {(foto.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
