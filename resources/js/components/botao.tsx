import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BotaoProps extends React.ComponentPropsWithoutRef<typeof Button> {}

export function Botao({ children, variant = 'default', className, ...props }: BotaoProps) {
    return (
        <Button
            variant={variant}
            className={cn('h-10 w-40 shrink-0 cursor-pointer justify-center font-semibold transition-all', className)}
            {...props}
        >
            {children}
        </Button>
    );
}
