import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BotaoProps extends ComponentPropsWithoutRef<typeof Button> {
    loading?: boolean;
    icon?: ReactNode;
    href?: string;
}

export function Botao({ children, className, loading = false, icon, disabled, href, ...props }: BotaoProps) {
    const content = (
        <>
            {loading ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : icon ? (
                <span className="flex shrink-0 items-center justify-center">{icon}</span>
            ) : null}
            {children}
        </>
    );

    return (
        <Button
            asChild={Boolean(href)}
            disabled={disabled || loading}
            className={cn('h-10 w-40 shrink-0 font-semibold', className)}
            {...props}
        >
            {href ? <Link href={href}>{content}</Link> : content}
        </Button>
    );
}
