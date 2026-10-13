import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { cn } from '@/lib/utils';

export interface PageHeaderAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    className?: string;
}

export interface PageHeaderProps {
    title: string;
    description?: string;
    action?: PageHeaderAction | React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

function isActionConfig(action: unknown): action is PageHeaderAction {
    return Boolean(
        action &&
        typeof action === 'object' &&
        'label' in action &&
        typeof (action as PageHeaderAction).label === 'string',
    );
}

export function PageHeader({ title, description, action, children, className }: PageHeaderProps) {
    const renderAction = () => {
        if (!action) return null;

        if (isActionConfig(action)) {
            const buttonClasses = cn(
                'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-2xs transition-all select-none hover:bg-primary/90 active:scale-[0.98]',
                action.className,
            );

            const iconElement = action.icon !== undefined ? action.icon : <Plus className="size-4" strokeWidth={2.5} />;

            if (action.href) {
                return (
                    <Link href={action.href} className={buttonClasses}>
                        {iconElement}
                        <span>{action.label}</span>
                    </Link>
                );
            }

            return (
                <button type="button" onClick={action.onClick} className={buttonClasses}>
                    {iconElement}
                    <span>{action.label}</span>
                </button>
            );
        }

        return action;
    };

    const hasActions = Boolean(action || children);

    return (
        <div
            className={cn('flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between', className)}
        >
            <Heading className="mb-0" title={title} description={description} />

            {hasActions && (
                <div className="flex flex-wrap items-center gap-2.5">
                    {renderAction()}
                    {children}
                </div>
            )}
        </div>
    );
}

export default PageHeader;
