import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusTabItem {
    id: string;
    label: string;
    count: number;
    color?: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'destructive';
    colorTheme?: 'primary' | 'success' | 'warning' | 'info' | 'error' | 'destructive';
    badgeAtivo?: string;
    badgeInativo?: string;
}

export interface StatusTabsProps {
    tabs?: StatusTabItem[];
    items?: StatusTabItem[];
    activeTab: string;
    onChange?: (id: string) => void;
    onTabChange?: (id: string) => void;
    className?: string;
}

const colorMap = {
    primary: {
        ativo: 'bg-foreground text-background font-bold',
        inativo: 'bg-muted text-muted-foreground',
    },
    success: {
        ativo: 'bg-emerald-600 text-white font-bold dark:bg-emerald-500',
        inativo: 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 dark:text-emerald-200',
    },
    warning: {
        ativo: 'bg-amber-600 text-white font-bold dark:bg-amber-500',
        inativo: 'bg-warning/15 text-amber-900 border border-warning/30 dark:text-amber-200',
    },
    info: {
        ativo: 'bg-info text-info-foreground font-bold',
        inativo: 'bg-info/15 text-info-foreground border border-info/30 dark:text-info',
    },
    error: {
        ativo: 'bg-destructive text-white font-bold',
        inativo: 'bg-destructive/15 text-destructive border border-destructive/30 dark:bg-destructive/15 dark:text-destructive',
    },
    destructive: {
        ativo: 'bg-destructive text-white font-bold',
        inativo: 'bg-destructive/15 text-destructive border border-destructive/30 dark:bg-destructive/15 dark:text-destructive',
    },
};

const borderColorMap = {
    primary: 'border-primary',
    success: 'border-emerald-600 dark:border-emerald-500',
    warning: 'border-amber-600 dark:border-amber-500',
    info: 'border-info',
    error: 'border-destructive',
    destructive: 'border-destructive',
};

const textActiveColorMap = {
    primary: 'text-foreground',
    success: 'text-foreground',
    warning: 'text-foreground',
    info: 'text-foreground',
    error: 'text-foreground',
    destructive: 'text-foreground',
};

const textHoverColorMap = {
    primary: 'hover:text-foreground',
    success: 'hover:text-foreground',
    warning: 'hover:text-foreground',
    info: 'hover:text-foreground',
    error: 'hover:text-foreground',
    destructive: 'hover:text-foreground',
};

export function StatusTabs({
    tabs,
    items,
    activeTab,
    onChange,
    onTabChange,
    className,
}: StatusTabsProps) {
    const list = tabs ?? items ?? [];
    const handleChange = onChange ?? onTabChange ?? (() => {});

    return (
        <div
            className={cn(
                'w-full border-b border-border/40 bg-muted/30 px-4 md:px-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                className,
            )}
        >
            <div className="flex w-max min-w-full gap-4 md:gap-6">
                {list.map((tab) => {
                    const ativo = activeTab === tab.id;
                    const tabColor = tab.color ?? tab.colorTheme;
                    const resolvedColor = tabColor && colorMap[tabColor] ? tabColor : 'primary';
                    const activeClass = tab.badgeAtivo || colorMap[resolvedColor].ativo;
                    const inactiveClass = tab.badgeInativo || colorMap[resolvedColor].inativo;
                    const borderClass = borderColorMap[resolvedColor];
                    const activeTextColor = textActiveColorMap[resolvedColor];
                    const hoverTextColor = textHoverColorMap[resolvedColor];

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleChange(tab.id)}
                            className={cn(
                                'relative flex items-center gap-2 py-3 px-1 text-xs md:text-sm font-medium transition-all duration-200 focus:outline-hidden cursor-pointer whitespace-nowrap shrink-0 -mb-px',
                                ativo
                                    ? `${activeTextColor} font-semibold border-b-2 ${borderClass}`
                                    : `text-muted-foreground ${hoverTextColor}`,
                            )}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    'rounded-full px-2 py-0.5 text-xs font-semibold transition-all duration-200',
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
