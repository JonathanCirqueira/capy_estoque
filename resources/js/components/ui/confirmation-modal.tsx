'use client';

import * as React from 'react';
import { AlertCircle, AlertTriangle, ArrowLeft, Check, CheckCircle2, Info, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConfirmationModalVariant = 'destructive' | 'default' | 'warning' | 'success' | 'info';

export interface ConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    variant?: ConfirmationModalVariant;
    isLoading?: boolean;
    disabled?: boolean;

    /* Customizações Finas de Estilo e Ícones */
    icon?: React.ReactNode;
    confirmIcon?: React.ReactNode;
    cancelIcon?: React.ReactNode;
    titleClassName?: string;
    confirmClassName?: string;
    cancelClassName?: string;
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    cancelVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';

    children?: React.ReactNode;
}

export function ConfirmationModal({
    open,
    onOpenChange,
    title = 'Confirmar Ação',
    description,
    confirmText = 'Confirmar',
    cancelText = 'Voltar',
    onConfirm,
    variant = 'destructive',
    isLoading = false,
    disabled = false,
    icon,
    confirmIcon,
    cancelIcon,
    titleClassName,
    confirmClassName,
    cancelClassName,
    confirmVariant,
    cancelVariant = 'outline',
    children,
}: ConfirmationModalProps) {
    const handleConfirm = async () => {
        if (disabled || isLoading) return;
        await onConfirm();
    };

    // Estilos de variante predefinidos
    const variantConfig = {
        destructive: {
            titleColor: 'text-destructive',
            buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700',
            buttonVariant: 'destructive' as const,
            defaultIcon: <AlertCircle className="size-5 shrink-0 text-destructive" />,
        },
        success: {
            titleColor: 'text-emerald-600 dark:text-emerald-500',
            buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700',
            buttonVariant: 'default' as const,
            defaultIcon: <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-500" />,
        },
        warning: {
            titleColor: 'text-amber-600 dark:text-amber-500',
            buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-700',
            buttonVariant: 'default' as const,
            defaultIcon: <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-500" />,
        },
        info: {
            titleColor: 'text-blue-600 dark:text-blue-400',
            buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
            buttonVariant: 'default' as const,
            defaultIcon: <Info className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />,
        },
        default: {
            titleColor: 'text-foreground',
            buttonBg: 'bg-primary hover:bg-primary/90 text-primary-foreground',
            buttonVariant: 'default' as const,
            defaultIcon: <AlertCircle className="size-5 shrink-0 text-primary" />,
        },
    };

    const currentVariant = variantConfig[variant] || variantConfig.default;

    const defaultIcon = icon || currentVariant.defaultIcon;

    const defaultConfirmIcon = confirmIcon || (
        isLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" strokeWidth={2.5} />
    );

    const defaultCancelIcon = cancelIcon || <ArrowLeft className="size-4" />;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 gap-5 border border-border/60 shadow-lg">
                <DialogHeader className="gap-2 text-left">
                    <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
                        {defaultIcon}
                        <span className={cn(currentVariant.titleColor, titleClassName)}>{title}</span>
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm font-normal text-muted-foreground leading-relaxed pt-1">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {children && <div className="py-1">{children}</div>}

                <DialogFooter className="flex flex-row items-center justify-between gap-3 pt-2 sm:justify-between">
                    <Button
                        type="button"
                        variant={cancelVariant}
                        onClick={() => onOpenChange(false)}
                        disabled={disabled || isLoading}
                        className={cn(
                            'w-40 rounded-xl h-11 border-border/80 font-medium hover:bg-muted/80 gap-2 cursor-pointer shrink-0',
                            cancelClassName
                        )}
                    >
                        {defaultCancelIcon}
                        <span>{cancelText}</span>
                    </Button>

                    <Button
                        type="button"
                        variant={confirmVariant || currentVariant.buttonVariant}
                        onClick={handleConfirm}
                        disabled={disabled || isLoading}
                        className={cn(
                            'w-40 rounded-xl h-11 font-medium gap-2 cursor-pointer shadow-sm shrink-0',
                            currentVariant.buttonBg,
                            confirmClassName
                        )}
                    >
                        {defaultConfirmIcon}
                        <span>{confirmText}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Re-export com aliases para compatibilidade
export { ConfirmationModal as ModalConfirmacao };
