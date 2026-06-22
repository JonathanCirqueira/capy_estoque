import { MoreHorizontal } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface ColunaTabela<T> {
    id: string;
    header: React.ReactNode;
    cell: (item: T, index: number) => React.ReactNode;
    className?: string; // Classes extras para o contêiner no desktop
    headerClassName?: string; // Classes extras para o cabeçalho no desktop

    // Mapeamento opcional para estruturar o cartão responsivo no Mobile
    mobile?: {
        target: 'header' | 'title' | 'subtitle' | 'attribute' | 'highlight';
        label?: string; // Rótulo usado em 'attribute' e 'highlight'
        className?: string; // Classes extras aplicadas no mobile
    };
}

export interface ItemAcao<T> {
    label: string;
    onClick: (item: T) => void;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'destructive';
}

export interface TabelaGenericaProps<T> {
    data: T[];
    columns: ColunaTabela<T>[];
    actions?: ItemAcao<T>[];
    actionsHeader?: string; // Rótulo do cabeçalho de ações (ex: "Opções", "Ações")
    getRowKey: (item: T, index: number) => string | number;
    emptyState?: React.ReactNode; // Estado vazio customizável
}

export const TabelaGenerica = React.memo(function TabelaGenerica<T>({
    data,
    columns,
    actions,
    actionsHeader,
    getRowKey,
    emptyState,
}: TabelaGenericaProps<T>) {
    // Filtros de colunas para montagem do layout Mobile
    const mobileHeaderCols = columns.filter((col) => col.mobile?.target === 'header');
    const mobileTitleCols = columns.filter((col) => col.mobile?.target === 'title');
    const mobileSubCols = columns.filter((col) => col.mobile?.target === 'subtitle');
    const mobileAttrCols = columns.filter((col) => col.mobile?.target === 'attribute');
    const mobileHighlightCols = columns.filter((col) => col.mobile?.target === 'highlight');

    const renderActions = (item: T) => {
        if (!actions || actions.length === 0) {
            return null;
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 cursor-pointer rounded-lg border-0 border-none text-muted-foreground shadow-none select-none hover:bg-muted hover:text-foreground focus-visible:ring-primary/20"
                        aria-label="Opções de linha"
                    >
                        <MoreHorizontal className="size-4.5" strokeWidth={2} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                    {actionsHeader && (
                        <>
                            <DropdownMenuLabel className="px-2.5 py-1.5 text-[9px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                                {actionsHeader}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <DropdownMenuItem
                                key={action.label}
                                onClick={() => action.onClick(item)}
                                variant={action.variant}
                                className={cn(
                                    'cursor-pointer gap-2 py-2 text-xs font-semibold',
                                    action.variant === 'destructive'
                                        ? ''
                                        : 'text-foreground focus:bg-muted focus:text-foreground',
                                )}
                            >
                                {Icon && <Icon className="size-3.5 text-muted-foreground" />}
                                {action.label}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const defaultEmptyState = (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground/60">
                <MoreHorizontal className="size-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Nenhum dado encontrado</h3>
            <p className="mt-1 text-xs text-muted-foreground">
                Não há registros disponíveis para serem exibidos nesta tabela no momento.
            </p>
        </div>
    );

    return (
        <div className="w-full">
            {data.length === 0 ? (
                (emptyState ?? defaultEmptyState)
            ) : (
                <>
                    {/* Desktop View (Table) */}
                    <div className="hidden overflow-x-auto md:block">
                        <Table className="min-w-full border-collapse">
                            <TableHeader>
                                <TableRow className="border-b border-border/50 bg-muted/10 hover:bg-muted/10">
                                    {columns.map((col) => (
                                        <TableHead
                                            key={col.id}
                                            className={cn(
                                                'px-4 py-4 font-display text-[11px] font-bold tracking-wider whitespace-nowrap text-muted-foreground/80 uppercase',
                                                col.headerClassName,
                                            )}
                                        >
                                            {col.header}
                                        </TableHead>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <TableHead className="w-12 px-4 py-4 text-right font-display text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                                            {/* Cabeçalho de ações sem texto */}
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow
                                        key={getRowKey(item, index)}
                                        className="group/row border-b border-border/40 transition-colors duration-200 hover:bg-muted/20"
                                        style={{
                                            animationDelay: `${index * 40}ms`,
                                        }}
                                    >
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.id}
                                                className={cn(
                                                    'px-4 py-4 text-sm font-normal text-neutral-900 dark:text-white',
                                                    col.className,
                                                )}
                                            >
                                                {col.cell(item, index)}
                                            </TableCell>
                                        ))}
                                        {actions && actions.length > 0 && (
                                            <TableCell className="px-4 py-4 text-right align-middle whitespace-nowrap">
                                                <div className="flex items-center justify-end">
                                                    {renderActions(item)}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View (Cards Grid) */}
                    <div className="grid grid-cols-1 gap-4 px-3 pt-1 pb-5 sm:grid-cols-2 md:hidden">
                        {data.map((item, index) => (
                            <div
                                key={getRowKey(item, index)}
                                className="flex animate-in flex-col rounded-3xl border border-border/40 bg-card p-5 shadow-xs transition-all duration-300 fill-mode-both fade-in slide-in-from-bottom-3 hover:-translate-y-0.5 hover:shadow-md"
                                style={{
                                    animationDelay: `${index * 45}ms`,
                                }}
                            >
                                {/* Cabeçalho do Card (Mobile Header) */}
                                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {mobileHeaderCols.map((col) => (
                                            <div key={col.id} className={col.mobile?.className}>
                                                {col.cell(item, index)}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Menu de Opções ("...") */}
                                    {actions && actions.length > 0 && renderActions(item)}
                                </div>

                                {/* Título/Nome */}
                                {(mobileTitleCols.length > 0 || mobileSubCols.length > 0) && (
                                    <div className="pt-3">
                                        {mobileTitleCols.map((col) => (
                                            <h4
                                                key={col.id}
                                                className={cn(
                                                    'line-clamp-2 font-sans text-sm leading-snug font-normal text-neutral-900 dark:text-white',
                                                    col.mobile?.className,
                                                )}
                                            >
                                                {col.cell(item, index)}
                                            </h4>
                                        ))}
                                        {mobileSubCols.map((col) => (
                                            <span
                                                key={col.id}
                                                className={cn(
                                                    'mt-1 block text-xs font-normal text-muted-foreground',
                                                    col.mobile?.className,
                                                )}
                                            >
                                                {col.cell(item, index)}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Informações em Lista de Atributos */}
                                {mobileAttrCols.length > 0 && (
                                    <div className="flex flex-col gap-3.5 py-4">
                                        {mobileAttrCols.map((col, attrIdx) => {
                                            const isLast = attrIdx === mobileAttrCols.length - 1;
                                            return (
                                                <div
                                                    key={col.id}
                                                    className={cn(
                                                        'flex items-center justify-between',
                                                        !isLast && 'border-b border-border/15 pb-2.5',
                                                        col.mobile?.className,
                                                    )}
                                                >
                                                    <span className="text-xs font-normal text-muted-foreground select-none">
                                                        {col.mobile?.label}
                                                    </span>
                                                    <div className="max-w-[170px] truncate text-xs font-semibold text-foreground dark:text-neutral-200">
                                                        {col.cell(item, index)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Bloco de Destaque Inferior */}
                                {mobileHighlightCols.map((col) => (
                                    <div
                                        key={col.id}
                                        className={cn(
                                            'mt-1 rounded-2xl border border-border/15 bg-muted/30 p-3.5',
                                            col.mobile?.className,
                                        )}
                                    >
                                        {col.mobile?.label && (
                                            <span className="block text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase select-none">
                                                {col.mobile?.label}
                                            </span>
                                        )}
                                        <div className="mt-1 block text-xs leading-relaxed font-medium text-foreground dark:text-neutral-200">
                                            {col.cell(item, index)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}) as <T>(props: TabelaGenericaProps<T>) => React.ReactElement;
