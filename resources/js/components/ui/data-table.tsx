'use client';

import * as React from 'react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Download,
    MoreHorizontal,
    Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';

/* ============================================================================
 * TYPES & INTERFACES
 * ============================================================================ */

export interface DataTableTab {
    id: string;
    label: string;
    count: number;
    badgeVariant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export interface DataTableColumn<T> {
    accessorKey: keyof T | string;
    header: string;
    sortable?: boolean;
    className?: string;
    headerClassName?: string;
    cell?: (row: T, index: number) => React.ReactNode;
}

export interface DataTablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    itemName?: string;
    onPageChange: (page: number) => void;
    className?: string;
}

/* ============================================================================
 * COMPONENT: DataTableHeader (Title + Actions - Outside the Table Card)
 * ============================================================================ */

export interface DataTableHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function DataTableHeader({ title, subtitle, actions, className }: DataTableHeaderProps) {
    return (
        <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5', className)}>
            <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
        </div>
    );
}

/* ============================================================================
 * COMPONENT: DataTableTabs (Underline Style with Count Badges)
 * ============================================================================ */

export interface DataTableTabsProps {
    tabs: DataTableTab[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export function DataTableTabs({ tabs, activeTab, onTabChange, className }: DataTableTabsProps) {
    return (
        <div className={cn('w-full border-b border-border/60 pb-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}>
            <div className="flex px-5 md:px-6 items-center gap-6 md:gap-8 min-w-max">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    const getTabColors = () => {
                        switch (tab.badgeVariant) {
                            case 'success':
                                return {
                                    text: isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/80 hover:text-foreground',
                                    border: isActive ? 'border-emerald-600 dark:border-emerald-400' : 'border-transparent',
                                    badge: isActive
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold',
                                };
                            case 'warning':
                                return {
                                    text: isActive ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground/80 hover:text-foreground',
                                    border: isActive ? 'border-amber-600 dark:border-amber-400' : 'border-transparent',
                                    badge: isActive
                                        ? 'bg-amber-600 text-white font-bold'
                                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold',
                                };
                            case 'destructive':
                                return {
                                    text: isActive ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground/80 hover:text-foreground',
                                    border: isActive ? 'border-rose-600 dark:border-rose-400' : 'border-transparent',
                                    badge: isActive
                                        ? 'bg-rose-600 text-white font-bold'
                                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold',
                                };
                            case 'secondary':
                            default:
                                return {
                                    text: isActive ? 'text-primary font-bold' : 'text-muted-foreground/80 hover:text-foreground',
                                    border: isActive ? 'border-primary' : 'border-transparent',
                                    badge: isActive
                                        ? 'bg-primary text-primary-foreground font-bold'
                                        : 'bg-primary/15 text-primary font-bold',
                                };
                        }
                    };

                    const colors = getTabColors();

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                'relative flex items-center gap-2.5 pb-2 text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border-b-[3px] -mb-px select-none',
                                colors.text,
                                colors.border
                            )}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={cn(
                                    'px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-bold tracking-tight transition-colors',
                                    colors.badge
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

/* ============================================================================
 * COMPONENT: DataTableFilters (Fixed Main Search + Export Menu + Children Below)
 * ============================================================================ */

export interface DataTableFiltersProps {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    onExport?: () => void;
    exportLabel?: string;
    exportActions?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export function DataTableFilters({
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Filtrar por nome ou série...',
    onExport,
    exportLabel = 'Exportar Tabela',
    exportActions,
    children,
    className,
}: DataTableFiltersProps) {
    return (
        <div className={cn('flex flex-col gap-3.5 p-4 md:p-6 w-full', className)}>
            {/* Linha Fixa da Busca Principal + Menu de Ações/Exportação */}
            <div className="flex items-center gap-2.5 w-full">
                <div className="relative flex-1">
                    <Input
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder={searchPlaceholder}
                        leftIcon={<Search className="size-4 text-muted-foreground/60" />}
                        clearable={Boolean(searchValue)}
                        onClear={() => onSearchChange?.('')}
                        className="bg-background dark:bg-black h-10 border-input/80 shadow-2xs"
                    />
                </div>

                {exportActions ?? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-10 rounded-md shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                            >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Opções</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                Opções
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onExport} className="cursor-pointer font-medium">
                                <Download className="mr-2 size-4 text-muted-foreground" />
                                <span>{exportLabel}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Parte de baixo: Filtros extras passados via Children */}
            {children && <div className="w-full pt-1">{children}</div>}
        </div>
    );
}

/* ============================================================================
 * COMPONENT: DataTablePagination (Footer Controls)
 * ============================================================================ */

export function DataTablePagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    itemName = 'REGISTROS',
    onPageChange,
    className,
}: DataTablePaginationProps) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis-left');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('ellipsis-right');
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-center justify-between gap-3 py-4 md:py-5 border-t border-border/40 px-4 md:px-6 select-none',
                className
            )}
        >
            {/* Informações de Contagem */}
            <div className="uppercase tracking-wider text-[11px] md:text-xs font-bold text-muted-foreground/70">
                MOSTRANDO {startItem} DE {endItem} DE {totalItems} {itemName}
            </div>

            {/* Botões de Paginação */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground/80 cursor-pointer transition-colors"
                >
                    <ChevronLeft className="size-3.5" />
                    Anterior
                </button>

                <div className="flex items-center gap-1 px-1">
                    {getPageNumbers().map((page) => {
                        if (typeof page === 'string') {
                            return (
                                <span key={page} className="px-1.5 text-[11px] md:text-xs text-muted-foreground font-bold">
                                    ...
                                </span>
                            );
                        }

                        const isSelected = currentPage === page;

                        return (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page)}
                                className={cn(
                                    'size-8 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center transition-all cursor-pointer',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground shadow-2xs'
                                        : 'text-foreground hover:bg-muted/60'
                                )}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-foreground cursor-pointer transition-colors"
                >
                    Próxima
                    <ChevronRight className="size-3.5" />
                </button>
            </div>
        </div>
    );
}

/* ============================================================================
 * COMPONENT: DataTableGrid (Desktop Table + Mobile Cards)
 * ============================================================================ */

export interface DataTableGridProps<T> {
    data?: T[];
    columns?: DataTableColumn<T>[];
    keyExtractor?: (item: T, index: number) => string | number;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (columnKey: string) => void;
    emptyMessage?: string;
    renderMobileCard?: (row: T, index: number) => React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export function DataTableGrid<T>({
    data = [],
    columns = [],
    keyExtractor,
    sortColumn,
    sortDirection = 'asc',
    onSort,
    emptyMessage = 'Nenhum registro encontrado.',
    renderMobileCard,
    children,
    className,
}: DataTableGridProps<T>) {
    if (children) {
        return <div className={cn('w-full', className)}>{children}</div>;
    }

    /* Separação para renderização mobile automática a partir das colunas */
    const primaryCol = columns[0];
    const actionsCol = columns.find(
        (c) => String(c.accessorKey).toLowerCase() === 'actions' || c.header === 'Ações'
    );
    const detailCols = columns.filter((c) => c !== primaryCol && c !== actionsCol);

    return (
        <div className={cn('w-full', className)}>
            {/* 1. VISÃO DESKTOP (Tabela padrão em telas md e superiores) */}
            <div className="hidden md:block relative w-full overflow-x-auto p-0">
                <Table className="w-full border-collapse">
                    <TableHeader>
                        <TableRow className="border-b border-border/50 hover:bg-transparent">
                            {columns.map((col, idx) => {
                                const isSortable = col.sortable !== false;
                                const isSorted = isSortable && sortColumn === String(col.accessorKey);

                                return (
                                    <TableHead
                                        key={String(col.accessorKey)}
                                        className={cn(
                                            'py-2.5 px-3 text-[11px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground/80 whitespace-nowrap select-none',
                                            idx === 0 && 'pl-5 md:pl-6',
                                            idx === columns.length - 1 && 'pr-5 md:pr-6',
                                            isSortable && 'cursor-pointer hover:text-foreground transition-colors',
                                            col.headerClassName
                                        )}
                                        onClick={() => isSortable && onSort?.(String(col.accessorKey))}
                                    >
                                        <div
                                            className={cn(
                                                'flex items-center gap-1.5',
                                                col.headerClassName?.includes('text-center') && 'justify-center',
                                                col.headerClassName?.includes('text-right') && 'justify-end'
                                            )}
                                        >
                                            <span>{col.header}</span>
                                            {isSortable &&
                                                (isSorted ? (
                                                    sortDirection === 'asc' ? (
                                                        <ArrowUp className="size-3 text-primary shrink-0" />
                                                    ) : (
                                                        <ArrowDown className="size-3 text-primary shrink-0" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="size-3 text-muted-foreground/40 shrink-0" />
                                                ))}
                                        </div>
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-28 text-center text-xs md:text-sm font-normal text-muted-foreground pl-5 md:pl-6 pr-5 md:pr-6"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => (
                                <TableRow
                                    key={keyExtractor ? keyExtractor(row, rowIndex) : rowIndex}
                                    className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                                >
                                    {columns.map((col, colIdx) => (
                                        <TableCell
                                            key={String(col.accessorKey)}
                                            className={cn(
                                                'py-2.5 px-3 text-xs md:text-sm font-normal align-middle',
                                                colIdx === 0 && 'pl-5 md:pl-6',
                                                colIdx === columns.length - 1 && 'pr-5 md:pr-6',
                                                col.className
                                            )}
                                        >
                                            {col.cell
                                                ? col.cell(row, rowIndex)
                                                : String((row as any)[col.accessorKey] ?? '')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 2. VISÃO MOBILE (Lista de Cards em telas menores que md) */}
            <div className="block md:hidden space-y-3 px-4 pb-4">
                {data.length === 0 ? (
                    <div className="py-8 text-center text-xs font-normal text-muted-foreground bg-muted/20 rounded-2xl border border-border/60">
                        {emptyMessage}
                    </div>
                ) : (
                    data.map((row, rowIndex) => {
                        const rowKey = keyExtractor ? keyExtractor(row, rowIndex) : rowIndex;

                        if (renderMobileCard) {
                            return <React.Fragment key={rowKey}>{renderMobileCard(row, rowIndex)}</React.Fragment>;
                        }

                        return (
                            <div
                                key={rowKey}
                                className="rounded-2xl border border-border/70 bg-card p-4 flex flex-col gap-3 shadow-2xs"
                            >
                                {/* Header do Card Mobile: Coluna Principal + Ações */}
                                <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-border/40">
                                    <div className="min-w-0 flex-1">
                                        {primaryCol &&
                                            (primaryCol.cell ? (
                                                primaryCol.cell(row, rowIndex)
                                            ) : (
                                                <span className="font-bold text-foreground text-sm">
                                                    {String((row as any)[primaryCol.accessorKey] ?? '')}
                                                </span>
                                            ))}
                                    </div>
                                    {actionsCol && (
                                        <div className="shrink-0 pt-0.5">
                                            {actionsCol.cell ? actionsCol.cell(row, rowIndex) : null}
                                        </div>
                                    )}
                                </div>

                                {/* Lista de Propriedades em formato Chave / Valor */}
                                <div className="flex flex-col gap-2 pt-0.5">
                                    {detailCols.map((col) => (
                                        <div
                                            key={String(col.accessorKey)}
                                            className="flex items-center justify-between gap-3 text-xs"
                                        >
                                            <span className="text-muted-foreground/80 font-bold uppercase tracking-wider text-[11px] shrink-0">
                                                {col.header}
                                            </span>
                                            <div className="text-foreground font-medium text-right min-w-0">
                                                {col.cell
                                                    ? col.cell(row, rowIndex)
                                                    : String((row as any)[col.accessorKey] ?? '')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

/* ============================================================================
 * UNIFIED COMPONENT: DataTableCard
 * ============================================================================ */

export interface DataTableCardProps<T> {
    /* Abas */
    tabs?: DataTableTab[];
    activeTab?: string;
    onTabChange?: (id: string) => void;

    /* Busca e Exportação */
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    onExport?: () => void;
    exportLabel?: string;
    exportActions?: React.ReactNode;

    /* Filtros customizados via children */
    filterChildren?: React.ReactNode;

    /* Tabela */
    data?: T[];
    columns?: DataTableColumn<T>[];
    keyExtractor?: (item: T, index: number) => string | number;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (columnKey: string) => void;
    emptyMessage?: string;
    renderMobileCard?: (row: T, index: number) => React.ReactNode;

    /* Paginação */
    pagination?: DataTablePaginationProps;

    /* Suporte a composição (Children) */
    children?: React.ReactNode;

    /* Estilização */
    className?: string;
}

export function DataTableCard<T>({
    tabs,
    activeTab,
    onTabChange,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    onExport,
    exportLabel,
    exportActions,
    filterChildren,
    data = [],
    columns = [],
    keyExtractor,
    sortColumn,
    sortDirection,
    onSort,
    emptyMessage,
    renderMobileCard,
    pagination,
    children,
    className,
}: DataTableCardProps<T>) {
    if (children) {
        return (
            <div
                className={cn(
                    'rounded-3xl border border-border/70 bg-card p-0 shadow-2xs flex flex-col w-full overflow-hidden',
                    className
                )}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'rounded-3xl border border-border/70 bg-card p-0 shadow-2xs flex flex-col w-full overflow-hidden',
                className
            )}
        >
            {/* 1. Abas de Status no Topo do Card */}
            {tabs && activeTab && onTabChange && (
                <div className="pt-5 md:pt-6 pb-0">
                    <DataTableTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
                </div>
            )}

            {/* 2. Filtros (Fixo Busca + Menu Exportação + Children) */}
            <DataTableFilters
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
                onExport={onExport}
                exportLabel={exportLabel}
                exportActions={exportActions}
            >
                {filterChildren}
            </DataTableFilters>

            {/* 3. Tabela de Dados (Desktop Table + Mobile Cards) */}
            <div className="w-full py-0">
                <DataTableGrid
                    data={data}
                    columns={columns}
                    keyExtractor={keyExtractor || ((_, index) => index)}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    emptyMessage={emptyMessage}
                    renderMobileCard={renderMobileCard}
                />
            </div>

            {/* 4. Paginação no Rodapé */}
            {pagination && <DataTablePagination {...pagination} />}
        </div>
    );
}

/* Exports */
export const DataTable = Object.assign(DataTableCard, {
    Card: DataTableCard,
    Header: DataTableHeader,
    Tabs: DataTableTabs,
    Filters: DataTableFilters,
    Grid: DataTableGrid,
    Pagination: DataTablePagination,
});
