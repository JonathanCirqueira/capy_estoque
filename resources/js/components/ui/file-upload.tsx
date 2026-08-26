'use client';

import * as React from 'react';
import { Upload, FileText, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
    file: File | null;
    onChange: (file: File | null, previewUrl?: string | null) => void;
    label?: string;
    placeholder?: string;
    subtitulo?: string;
    accept?: string;
    maxSizeMB?: number;
    error?: boolean | string;
    disabled?: boolean;
    type?: 'file' | 'image';
    icon?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    clearable?: boolean;
    id?: string;
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function FileUpload({
    file,
    onChange,
    label,
    placeholder,
    subtitulo,
    accept,
    maxSizeMB = 10,
    error,
    disabled = false,
    type = 'file',
    icon,
    className,
    containerClassName,
    id,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const defaultId = React.useId();
    const elementId = id || defaultId;

    const defaultPlaceholder =
        type === 'image'
            ? 'Clique para anexar uma foto do patrimônio'
            : 'Clique para anexar um documento ou comprovante';

    const defaultSubtitulo =
        type === 'image'
            ? 'JPEG, JPG, PNG ou WEBP até 10MB'
            : 'PDF, DOC ou DOCX até 10MB';

    const defaultAccept = type === 'image' ? 'image/*' : '.pdf,.doc,.docx,image/*';

    React.useEffect(() => {
        if (file && type === 'image' && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        } else {
            setPreviewUrl(null);
        }
    }, [file, type]);

    const handleFile = (selectedFile: File) => {
        if (disabled) return;

        if (type === 'image' && !selectedFile.type.startsWith('image/')) {
            toast.error('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
            return;
        }

        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            toast.error(`O arquivo não pode exceder ${maxSizeMB}MB.`);
            return;
        }

        let url: string | null = null;
        if (selectedFile.type.startsWith('image/')) {
            url = URL.createObjectURL(selectedFile);
        }

        onChange(selectedFile, url);
        toast.success('Arquivo anexado com sucesso!');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        setIsDragging(false);

        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        onChange(null, null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        toast.info('Arquivo removido.');
    };

    return (
        <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
            {label && (
                <label
                    htmlFor={elementId}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                    {label}
                </label>
            )}

            {!file ? (
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!disabled) setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !disabled && inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!disabled) inputRef.current?.click();
                        }
                    }}
                    className={cn(
                        'flex items-center gap-3.5 w-full cursor-pointer rounded-2xl border border-dashed p-3.5 transition-all duration-200 select-none',
                        'bg-muted/15 border-border/80 hover:bg-muted/30 hover:border-primary/50',
                        isDragging && 'border-primary bg-primary/5 scale-[0.995]',
                        error && 'border-destructive bg-destructive/5 hover:bg-destructive/10',
                        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                        className
                    )}
                >
                    <input
                        id={elementId}
                        type="file"
                        ref={inputRef}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                handleFile(e.target.files[0]);
                            }
                        }}
                        accept={accept || defaultAccept}
                        className="hidden"
                        disabled={disabled}
                    />

                    <div className="flex size-11 items-center justify-center rounded-xl bg-muted/80 text-foreground/80 shrink-0">
                        {icon || <Upload className="size-5" />}
                    </div>

                    <div className="flex flex-col text-left truncate">
                        <span className="text-sm font-semibold text-foreground truncate">
                            {placeholder || defaultPlaceholder}
                        </span>
                        <span className="text-xs text-muted-foreground/80 truncate">
                            {subtitulo || defaultSubtitulo}
                        </span>
                    </div>
                </div>
            ) : (
                <div
                    className={cn(
                        'flex items-center justify-between gap-3 w-full rounded-2xl border border-border/80 bg-muted/20 p-3 transition-all',
                        className
                    )}
                >
                    <div className="flex items-center gap-3 truncate min-w-0">
                        {previewUrl ? (
                            <div className="relative size-11 overflow-hidden rounded-xl border border-border/40 shrink-0 bg-background">
                                <img
                                    src={previewUrl}
                                    alt={file.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                                {file.type.startsWith('image/') ? (
                                    <ImageIcon className="size-5" />
                                ) : (
                                    <FileText className="size-5" />
                                )}
                            </div>
                        )}

                        <div className="flex flex-col truncate min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">
                                {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleRemove}
                        className="flex size-8 items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
                        title="Remover arquivo"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            {typeof error === 'string' && (
                <span className="text-xs text-destructive mt-0.5">{error}</span>
            )}
        </div>
    );
}
