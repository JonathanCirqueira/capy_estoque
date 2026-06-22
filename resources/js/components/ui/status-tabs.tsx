import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusTabItem {
    id: string;
    label: string;
    count: number;
    color?: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'destructive';
    badgeAtivo?: string;
    badgeInativo?: string;
}

interface StatusTabsProps {
    tabs: StatusTabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

const colorMap = {
    primary: {
        ativo: 'bg-primary text-primary-foreground font-bold',
        inativo: 'bg-primary/10 text-primary ring-1 ring-primary/20',
    },
    success: {
        ativo: 'bg-success text-success-foreground font-bold dark:bg-success dark:text-success-foreground',
        inativo: 'bg-success/10 text-success-foreground/80 ring-1 ring-success/20 dark:bg-success/10 dark:text-success dark:ring-success/20',
    },
    warning: {
        ativo: 'bg-warning text-warning-foreground font-bold dark:bg-warning dark:text-warning-foreground',
        inativo: 'bg-warning/10 text-warning-foreground/80 ring-1 ring-warning/20 dark:bg-warning/10 dark:text-warning dark:ring-warning/20',
    },
    info: {
        ativo: 'bg-info text-info-foreground font-bold',
        inativo: 'bg-info/10 text-info ring-1 ring-info/20',
    },
    error: {
        ativo: 'bg-error text-white font-bold',
        inativo: 'bg-error/10 text-error ring-1 ring-error/20',
    },
    destructive: {
        ativo: 'bg-destructive text-destructive-foreground font-bold dark:bg-destructive dark:text-destructive-foreground',
        inativo: 'bg-destructive/10 text-destructive-foreground/80 ring-1 ring-destructive/20 dark:bg-destructive/10 dark:text-destructive dark:ring-destructive/20',
    },
};

const borderColorMap = {
    primary: 'border-primary',
    success: 'border-success-foreground dark:border-success',
    warning: 'border-warning-foreground dark:border-warning',
    info: 'border-info',
    error: 'border-error',
    destructive: 'border-destructive-foreground dark:border-destructive',
};

const textActiveColorMap = {
    primary: 'text-foreground',
    success: 'text-success-foreground dark:text-success',
    warning: 'text-warning-foreground dark:text-warning',
    info: 'text-info dark:text-info',
    error: 'text-error dark:text-error',
    destructive: 'text-destructive-foreground dark:text-destructive',
};

const textHoverColorMap = {
    primary: 'hover:text-foreground',
    success: 'hover:text-success-foreground dark:hover:text-success',
    warning: 'hover:text-warning-foreground dark:hover:text-warning',
    info: 'hover:text-info-foreground dark:hover:text-info',
    error: 'hover:text-error-foreground dark:hover:text-error',
    destructive: 'hover:text-destructive-foreground dark:hover:text-destructive',
};

export function StatusTabs({ tabs, activeTab, onChange, className }: StatusTabsProps) {
    return (
        <div
            className={cn(
                'w-full border-b border-border bg-secondary/30 px-4 md:px-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                className,
            )}
        >
            <div className="flex w-max min-w-full gap-4 md:gap-6">
                {tabs.map((tab) => {
                    const ativo = activeTab === tab.id;
                    const resolvedColor = tab.color && colorMap[tab.color] ? tab.color : 'primary';
                    const activeClass = tab.badgeAtivo || colorMap[resolvedColor].ativo;
                    const inactiveClass = tab.badgeInativo || colorMap[resolvedColor].inativo;
                    const borderClass = borderColorMap[resolvedColor];
                    const activeTextColor = textActiveColorMap[resolvedColor];
                    const hoverTextColor = textHoverColorMap[resolvedColor];

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                'relative flex items-center gap-1.5 md:gap-2 py-3 md:py-4 px-0.5 md:px-1 text-xs md:text-sm font-semibold transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap shrink-0',
                                ativo
                                    ? `${activeTextColor} border-b-2 ${borderClass}`
                                    : `text-muted-foreground ${hoverTextColor}`,
                            )}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    'rounded-md px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-bold transition-all duration-300',
                                    ativo ? activeClass : inactiveClass,
                                )}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
