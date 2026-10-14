import React from 'react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import { Botao, type BotaoProps } from '@/components/botao';
import { cn } from '@/lib/utils';

export interface PageHeaderAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    className?: string;
    loading?: boolean;
    disabled?: boolean;
    variant?: BotaoProps['variant'];
}

export interface PageHeaderProps {
    title: string;
    description?: string;
    action?: PageHeaderAction | React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    showAction?: boolean;
}

function isActionConfig(action: unknown): action is PageHeaderAction {
    return Boolean(
        action &&
        typeof action === 'object' &&
        'label' in action &&
        typeof (action as PageHeaderAction).label === 'string',
    );
}

export function PageHeader({ title, description, action, children, className, showAction = true }: PageHeaderProps) {
    const renderAction = () => {
        if (!showAction || !action) return null;

        if (isActionConfig(action)) {
            // Remove prefixo '+' do label caso tenha sido passado, evitando duplicar com o ícone Plus
            const cleanLabel = action.label.replace(/^\+\s*/, '');
            const iconElement = action.icon !== undefined ? action.icon : <Plus className="size-4" strokeWidth={2.5} />;

            return (
                <Botao
                    variant={action.variant || 'default'}
                    href={action.href}
                    onClick={action.onClick}
                    icon={iconElement}
                    className={action.className}
                    loading={action.loading}
                    disabled={action.disabled}
                >
                    {cleanLabel}
                </Botao>
            );
        }

        return action;
    };

    const hasActions = Boolean((showAction && action) || children);

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
