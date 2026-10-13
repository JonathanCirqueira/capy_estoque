import { MoreHorizontal, Edit3 } from 'lucide-react';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { Badge } from '@/components/ui/badge';
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
import type { ItemTemplateExemplo, StatusConfigItem } from './types';

export interface TableTemplateProps<T = ItemTemplateExemplo> {
    items: T[];
    ordemCampo?: string;
    ordemDirecao?: 'asc' | 'desc';
    onAlternarOrdenacao?: (campo: string, direcao: 'asc' | 'desc') => void;
    onEditar?: (item: T) => void;
    statusConfigMap?: Record<string, StatusConfigItem>;
}

const statusConfigPadrao: Record<string, StatusConfigItem> = {
    ativo: {
        label: 'ATIVO',
        className: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-200',
    },
    pendente: {
        label: 'PENDENTE',
        className: 'bg-warning/15 text-amber-900 border-warning/30 dark:text-amber-200',
    },
    inativo: {
        label: 'INATIVO',
        className:
            'bg-destructive/15 text-destructive border-destructive/30 dark:bg-destructive/15 dark:text-destructive dark:border-destructive/30',
    },
};

export function TableTemplate({
    items,
    ordemCampo,
    ordemDirecao = 'asc',
    onAlternarOrdenacao,
    onEditar,
    statusConfigMap = statusConfigPadrao,
}: TableTemplateProps) {
    const handleSort = (campo: string) => {
        if (!onAlternarOrdenacao) return;
        const novaDirecao = ordemCampo === campo && ordemDirecao === 'asc' ? 'desc' : 'asc';
        onAlternarOrdenacao(campo, novaDirecao);
    };

    return (
        <div className="w-full">
            {/* Visão Desktop: Tabela Convencional */}
            <div className="hidden overflow-x-auto md:block">
                <Table className="w-full border-collapse text-left">
                    <TableHeader>
                        <TableRow className="border-b border-border/50 bg-muted/10 hover:bg-muted/10">
                            {/* CÓDIGO */}
                            <SortableTableHead
                                label="CÓDIGO"
                                coluna="codigo"
                                colunaAtiva={ordemCampo}
                                direcaoAtiva={ordemDirecao}
                                onSort={handleSort}
                                className="w-28 py-3 pr-3 pl-5 whitespace-nowrap md:pl-6 xl:w-32 xl:pl-6"
                            />

                            {/* TÍTULO / ITEM */}
                            <SortableTableHead
                                label="TÍTULO / ITEM"
                                coluna="titulo"
                                colunaAtiva={ordemCampo}
                                direcaoAtiva={ordemDirecao}
                                onSort={handleSort}
                                className="px-3 py-3"
                            />

                            {/* CATEGORIA */}
                            <SortableTableHead
                                label="CATEGORIA"
                                coluna="categoria"
                                colunaAtiva={ordemCampo}
                                direcaoAtiva={ordemDirecao}
                                onSort={handleSort}
                                className="px-3 py-3"
                            />

                            {/* DEPARTAMENTO */}
                            <SortableTableHead
                                label="DEPARTAMENTO"
                                coluna="departamento"
                                colunaAtiva={ordemCampo}
                                direcaoAtiva={ordemDirecao}
                                onSort={handleSort}
                                className="px-3 py-3"
                            />

                            {/* STATUS */}
                            <SortableTableHead
                                label="STATUS"
                                coluna="status"
                                colunaAtiva={ordemCampo}
                                direcaoAtiva={ordemDirecao}
                                onSort={handleSort}
                                className="w-24 px-3 py-3 text-center xl:w-28"
                            />

                            {/* AÇÕES (3 Pontinhos) */}
                            <TableHead className="w-12 py-3 pr-5 pl-3 text-right font-display text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase md:pr-6 xl:w-16 xl:pr-6">
                                AÇÕES
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {items.map((item) => {
                            const config = statusConfigMap[item.status] || {
                                label: String(item.status).toUpperCase(),
                                className: 'bg-muted text-foreground border-border',
                            };

                            return (
                                <TableRow
                                    key={item.id}
                                    className="border-b border-border/40 transition-colors duration-150 hover:bg-muted/20"
                                >
                                    {/* 1. Código */}
                                    <TableCell className="py-3 pr-3 pl-5 whitespace-nowrap md:pl-6 xl:pl-6">
                                        <span className="inline-flex cursor-text items-center rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-sm font-normal text-foreground select-all">
                                            {item.codigo}
                                        </span>
                                    </TableCell>

                                    {/* 2. Título & Subtítulo */}
                                    <TableCell className="px-3 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-normal tracking-tight text-foreground">
                                                {item.titulo}
                                            </span>
                                            {item.subtitulo && (
                                                <span className="mt-0.5 text-sm font-normal text-muted-foreground">
                                                    {item.subtitulo}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* 3. Categoria */}
                                    <TableCell className="px-3 py-3 text-sm font-normal text-foreground">
                                        <span className="block max-w-44 truncate">{item.categoria || '-'}</span>
                                    </TableCell>

                                    {/* 4. Departamento */}
                                    <TableCell className="px-3 py-3 text-sm font-normal text-foreground">
                                        <div className="flex flex-col">
                                            <span>{item.departamento || '-'}</span>
                                            {item.referencia && (
                                                <span className="text-sm font-normal text-muted-foreground">
                                                    {item.referencia}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* 5. Status Badge */}
                                    <TableCell className="w-24 px-3 py-3 text-center whitespace-nowrap xl:w-28">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                                                config.className,
                                            )}
                                        >
                                            {config.label}
                                        </Badge>
                                    </TableCell>

                                    {/* 6. Ações (3 Pontinhos -> Apenas Editar) */}
                                    <TableCell className="w-12 py-3 pr-5 pl-3 text-right whitespace-nowrap md:pr-6 xl:w-16 xl:pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 cursor-pointer rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                                >
                                                    <MoreHorizontal className="size-4.5" />
                                                    <span className="sr-only">Ações</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuLabel className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                                                    OPÇÕES
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onEditar?.(item)}
                                                    className="cursor-pointer gap-2.5 py-2 text-xs font-semibold"
                                                >
                                                    <Edit3 className="size-4 text-muted-foreground" />
                                                    Editar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Visão Mobile: Cards Reutilizáveis e Agnósticos (sem ícones decorativos específicos) */}
            <div className="flex flex-col gap-3 px-4 pb-4 md:hidden">
                {items.map((item) => {
                    const config = statusConfigMap[item.status] || {
                        label: String(item.status).toUpperCase(),
                        className: 'bg-muted text-foreground border-border',
                    };

                    return (
                        <div
                            key={item.id}
                            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-2xs"
                        >
                            {/* Topo do Card: Código + Status + 3 Pontinhos */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md border border-border/70 bg-muted/50 px-2 py-0.5 font-mono text-xs font-semibold text-foreground select-all">
                                        {item.codigo}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                                            config.className,
                                        )}
                                    >
                                        {config.label}
                                    </Badge>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-foreground"
                                        >
                                            <MoreHorizontal className="size-4.5" />
                                            <span className="sr-only">Opções</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuLabel className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                                            OPÇÕES
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onEditar?.(item)}
                                            className="cursor-pointer gap-2.5 py-2 text-xs font-semibold"
                                        >
                                            <Edit3 className="size-4 text-muted-foreground" />
                                            Editar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Título & Subtítulo */}
                            <div>
                                <h4 className="text-sm font-semibold tracking-tight text-foreground">{item.titulo}</h4>
                                {item.subtitulo && (
                                    <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitulo}</p>
                                )}
                            </div>

                            {/* Bloco de Metadados Estruturados (Adaptável a qualquer entidade) */}
                            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border/30 bg-muted/40 p-3 text-xs">
                                <div className="min-w-0">
                                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Categoria
                                    </span>
                                    <p className="mt-0.5 truncate font-medium text-foreground">
                                        {item.categoria || '-'}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                        Departamento
                                    </span>
                                    <p className="mt-0.5 truncate font-medium text-foreground">
                                        {item.departamento || '-'}
                                    </p>
                                </div>

                                {item.referencia && (
                                    <div className="col-span-2 min-w-0 border-t border-border/30 pt-2">
                                        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            Referência
                                        </span>
                                        <p className="mt-0.5 truncate font-medium text-foreground">{item.referencia}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
