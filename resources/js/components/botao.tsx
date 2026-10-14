import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BotaoProps extends React.ComponentPropsWithoutRef<typeof Button> {
    loading?: boolean;
    icon?: React.ReactNode;
}

export function Botao({
    children,
    variant = 'default',
    className,
    loading = false,
    icon,
    disabled,
    ...props
}: BotaoProps) {
    return (
        <Button
            variant={variant}
            disabled={disabled || loading}
            className={cn(
                'h-10 w-40 shrink-0 cursor-pointer justify-center gap-2 font-semibold transition-all',
                className,
            )}
            {...props}
        >
            {loading ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : icon ? (
                <span className="flex shrink-0 items-center justify-center">{icon}</span>
            ) : null}
            {children}
        </Button>
    );
}
