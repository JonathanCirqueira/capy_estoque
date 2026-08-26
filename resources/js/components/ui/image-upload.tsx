'use client';

import * as React from 'react';
import { Camera, ZoomIn, ZoomOut, RotateCcw, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface ImageUploadProps {
    value?: File | string | null;
    onChange: (file: File | null, previewUrl?: string | null) => void;
    label?: string;
    required?: boolean;
    placeholder?: string;
    subtitulo?: string;
    pillText?: string;
    accept?: string;
    maxSizeMB?: number;
    error?: boolean | string;
    disabled?: boolean;
    className?: string;
    containerClassName?: string;
    id?: string;
}

export function ImageUpload({
    value = null,
    onChange,
    label = 'FOTO DO PATRIMÔNIO',
    required = false,
    placeholder = 'Arraste a foto da plaquinha ou clique para buscar',
    subtitulo = 'Capture uma foto nítida e bem iluminada da plaqueta física de patrimônio.',
    pillText = 'PNG, JPG, JPEG OU WEBP • ATÉ 5MB',
    accept = 'image/png,image/jpeg,image/jpg,image/webp',
    maxSizeMB = 5,
    error,
    disabled = false,
    className,
    containerClassName,
    id,
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [isZoomOpen, setIsZoomOpen] = React.useState(false);
    const [zoomLevel, setZoomLevel] = React.useState(1);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const defaultId = React.useId();
    const elementId = id || defaultId;

    // Sincroniza a preview interna quando o value muda (File ou string URL)
    React.useEffect(() => {
        if (!value) {
            setPreviewUrl(null);
            return;
        }

        if (typeof value === 'string') {
            setPreviewUrl(value);
            return;
        }

        if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreviewUrl(objectUrl);
            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        }
    }, [value]);

    // Reseta o zoom quando fecha o modal
    React.useEffect(() => {
        if (!isZoomOpen) {
            setZoomLevel(1);
        }
    }, [isZoomOpen]);

    const handleFile = (file: File) => {
        if (disabled) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`A imagem não pode exceder ${maxSizeMB}MB.`);
            return;
        }

        const url = URL.createObjectURL(file);
        onChange(file, url);
        toast.success('Imagem selecionada com sucesso!');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        setIsDragging(false);

        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;

        onChange(null, null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        toast.info('Imagem removida.');
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    return (
        <div className={cn('flex flex-col gap-2 w-full', containerClassName)}>
            {label && (
                <Label
                    htmlFor={elementId}
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                >
                    {label}
                    {required && <span className="text-destructive">*</span>}
                </Label>
            )}

            <input
                id={elementId}
                type="file"
                ref={inputRef}
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        handleFile(e.target.files[0]);
                    }
                }}
                accept={accept}
                className="hidden"
                disabled={disabled}
            />

            {!previewUrl ? (
                // DROPZONE STATE (Sem imagem)
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!disabled) setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                    }}
                    onDrop={handleDrop}
                    onClick={() => !disabled && inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!disabled) inputRef.current?.click();
                        }
                    }}
                    className={cn(
                        'relative flex flex-col items-center justify-center w-full min-h-64 p-8 text-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none',
                        'border-border/70 bg-muted/20 hover:bg-muted/35 hover:border-primary/50 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/60',
                        isDragging && 'border-primary bg-primary/10 scale-[0.99]',
                        error && 'border-destructive bg-destructive/5 hover:bg-destructive/10',
                        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                        className
                    )}
                >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3.5 shadow-2xs">
                        <Camera className="size-6" />
                    </div>

                    <p className="text-sm font-bold text-foreground max-w-md">
                        {placeholder}
                    </p>

                    <p className="text-xs text-muted-foreground/80 mt-1.5 max-w-sm font-normal leading-relaxed">
                        {subtitulo}
                    </p>

                    {pillText && (
                        <div className="mt-5 inline-flex items-center rounded-full bg-background dark:bg-muted/80 px-4 py-1.5 text-[10px] font-extrabold text-muted-foreground border border-border/50 shadow-xs uppercase tracking-wider">
                            {pillText}
                        </div>
                    )}
                </div>
            ) : (
                // PREVIEW STATE (Adaptação inteira da imagem com object-contain)
                <div
                    className={cn(
                        'relative w-full h-80 rounded-2xl overflow-hidden border border-border/60 bg-muted/30 dark:bg-neutral-950/80 shadow-xs group flex items-center justify-center p-3',
                        className
                    )}
                >
                    <img
                        src={previewUrl}
                        alt="Preview da Imagem"
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.01] rounded-xl"
                    />

                    {/* Top-Right Floating Controls Pill */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg z-10">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsZoomOpen(true);
                            }}
                            className="flex size-8 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                            title="Expandir e dar Zoom"
                        >
                            <ZoomIn className="size-4" />
                        </button>

                        <button
                            type="button"
                            onClick={handleRemove}
                            className="flex size-8 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
                            title="Remover imagem"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Bottom overlay with file info hint */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="size-4 text-white/80 shrink-0" />
                            <span className="text-xs font-medium truncate">Imagem adaptada sem cortes</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="text-xs font-bold underline hover:text-primary transition-colors cursor-pointer"
                        >
                            Trocar foto
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Interativo de Zoom da Imagem */}
            <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                <DialogContent className="max-w-6xl w-[92vw] max-h-[90vh] p-0 bg-background border-border text-foreground overflow-hidden rounded-2xl flex flex-col shadow-2xl">
                    <DialogHeader className="p-4 border-b border-border bg-card/60 flex flex-row items-center justify-between space-y-0 shrink-0">
                        <DialogTitle className="text-sm font-bold text-foreground">
                            Visualização da Foto
                        </DialogTitle>

                        {/* Barra de Controles de Zoom */}
                        <div className="flex items-center gap-2 mr-6">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleZoomOut}
                                disabled={zoomLevel <= 1}
                                className="size-8 rounded-lg border-border bg-background hover:bg-muted text-foreground disabled:opacity-30 cursor-pointer"
                                title="Diminuir Zoom"
                            >
                                <ZoomOut className="size-4" />
                            </Button>

                            <span className="text-xs font-mono font-semibold text-muted-foreground min-w-12 text-center">
                                {Math.round(zoomLevel * 100)}%
                            </span>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleZoomIn}
                                disabled={zoomLevel >= 3.5}
                                className="size-8 rounded-lg border-border bg-background hover:bg-muted text-foreground disabled:opacity-30 cursor-pointer"
                                title="Aumentar Zoom"
                            >
                                <ZoomIn className="size-4" />
                            </Button>

                            {zoomLevel > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetZoom}
                                    className="h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1 cursor-pointer"
                                    title="Resetar Zoom"
                                >
                                    <RotateCcw className="size-3" />
                                    Resetar
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    {previewUrl && (
                        <div
                            onWheel={handleWheel}
                            className="relative flex-1 flex items-center justify-center min-h-[65vh] max-h-[80vh] w-full overflow-auto p-6 bg-muted/20 dark:bg-neutral-900/60 cursor-grab active:cursor-grabbing select-none"
                        >
                            <img
                                src={previewUrl}
                                alt="Foto do Patrimônio em alta resolução"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: 'center center',
                                }}
                                className="max-h-[75vh] w-auto object-contain transition-transform duration-200 ease-out rounded-xl shadow-md border border-border/40 bg-card"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {typeof error === 'string' && (
                <span className="text-xs text-destructive mt-0.5">{error}</span>
            )}
        </div>
    );
}
