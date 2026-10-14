'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X, Search, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export interface MultiSelectItem {
    value: string;
    label: string;
    sublabel?: string;
    description?: string;
}

export interface MultiSelectProps {
    items: MultiSelectItem[];
    selectedValues?: string[] | null;
    value?: string[] | null;
    onSelectedValuesChange?: (values: string[] | null) => void;
    onValueChange?: (values: string[] | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
    error?: boolean | string;
    disablePortal?: boolean;
    modal?: boolean;
    selectAllOption?: boolean;
    selectAllLabel?: string;
    nullWhenAll?: boolean;
    icon?: React.ReactNode;
    itemIcon?: React.ReactNode;
    label?: string;
    required?: boolean;
    containerClassName?: string;
}

export function MultiSelect({
    items = [],
    selectedValues,
    value,
    onSelectedValuesChange,
    onValueChange,
    placeholder = 'Selecione os serviços...',
    searchPlaceholder = 'Buscar serviço...',
    emptyMessage = 'Nenhum resultado encontrado.',
    disabled = false,
    className,
    error = false,
    disablePortal: _disablePortal = false,
    modal = true,
    selectAllOption = true,
    selectAllLabel = 'Todos os Serviços',
    nullWhenAll = true,
    icon = <Briefcase className="size-3 text-muted-foreground dark:text-zinc-300 shrink-0" />,
    itemIcon,
    label,
    required = false,
    containerClassName,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    // Determina o valor bruto fornecido pelas props
    const rawValue = selectedValues !== undefined ? selectedValues : value;

    // Detecta se "Todos" está selecionado (seja por valor null, '__ALL__', ou todos os IDs presentes)
    const isAllSelected = React.useMemo(() => {
        if (rawValue === null) return true;
        if (Array.isArray(rawValue)) {
            if (rawValue.includes('__ALL__') || rawValue.includes('all')) return true;
            if (items.length > 0 && items.every((item) => rawValue.includes(item.value))) return true;
        }
        return false;
    }, [rawValue, items]);

    // Array de valores efetivos quando NÃO está em modo "Todos"
    const currentValues = React.useMemo(() => {
        if (rawValue === null) return [];
        return Array.isArray(rawValue) ? rawValue : [];
    }, [rawValue]);

    const updateValues = (nextValues: string[] | null) => {
        onSelectedValuesChange?.(nextValues);
        onValueChange?.(nextValues);
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            updateValues([]);
        } else {
            updateValues(nullWhenAll ? null : items.map((item) => item.value));
        }
    };

    const toggleItem = (val: string) => {
        // Se estava em modo "Todos", selecionar um item individual isola a seleção nele
        if (isAllSelected) {
            updateValues([val]);
            return;
        }

        if (currentValues.includes(val)) {
            updateValues(currentValues.filter((v) => v !== val));
        } else {
            const next = [...currentValues, val];
            if (items.length > 0 && items.every((item) => next.includes(item.value))) {
                updateValues(nullWhenAll ? null : next);
            } else {
                updateValues(next);
            }
        }
    };

    const handleUnselect = (val: string, e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isAllSelected) {
            // Se desmarcou a partir da tag "Todos", desseleciona tudo
            updateValues([]);
        } else {
            updateValues(currentValues.filter((v) => v !== val));
        }
    };

    const filteredItems = React.useMemo(() => {
        if (!search) return items;
        const s = search.toLowerCase();
        return items.filter(
            (item) =>
                item.label.toLowerCase().includes(s) ||
                (item.sublabel && item.sublabel.toLowerCase().includes(s)) ||
                (item.description && item.description.toLowerCase().includes(s))
        );
    }, [items, search]);

    const multiSelectContent = (
        <div className="relative w-full">
            <Popover open={open} onOpenChange={setOpen} modal={modal}>
                <PopoverTrigger asChild disabled={disabled}>
                    <Button
                        disabled={disabled}
                        variant="outline"
                        role="combobox"
                        aria-controls="multi-select-options"
                        aria-expanded={open}
                        className={cn(
                            'min-h-11 h-auto w-full justify-between rounded-xl border border-input px-3 py-2 text-sm font-medium text-neutral-900 dark:text-white transition-all focus:outline-none focus:ring-[3px] focus:ring-primary/15 focus:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:border-primary data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-primary/15 dark:bg-[#0A0A0A] disabled:bg-muted/30 disabled:opacity-50',
                            !disabled && 'hover:border-primary/30 hover:bg-primary/2 dark:hover:bg-primary/1.5',
                            Boolean(error) && 'border-destructive focus:ring-destructive/20',
                            className,
                        )}
                    >
                        <div className="flex flex-wrap gap-1.5 max-w-[90%] text-left text-neutral-900 dark:text-white">
                            {isAllSelected ? (
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-900 dark:text-white select-none">
                                    {itemIcon || icon || <Briefcase className="size-3 text-muted-foreground dark:text-zinc-300 shrink-0" />}
                                    <span className="truncate max-w-44">{selectAllLabel}</span>
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            updateValues([]);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                updateValues([]);
                                            }
                                        }}
                                        className="ml-0.5 rounded-sm p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                                    >
                                        <X className="size-3" />
                                    </span>
                                </span>
                            ) : currentValues.length > 0 ? (
                                items
                                    .filter((item) => currentValues.includes(item.value))
                                    .map((item) => (
                                        <span
                                            key={item.value}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-900 dark:text-white select-none"
                                        >
                                            {itemIcon || icon || <Briefcase className="size-3 text-muted-foreground dark:text-zinc-300 shrink-0" />}
                                            <span className="truncate max-w-36">{item.label}</span>
                                            <span
                                                role="button"
                                                tabIndex={0}
                                                onClick={(e) => handleUnselect(item.value, e)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        handleUnselect(item.value, e);
                                                    }
                                                }}
                                                className="ml-0.5 rounded-sm p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                                            >
                                                <X className="size-3" />
                                            </span>
                                        </span>
                                    ))
                            ) : (
                                <span className="text-muted-foreground font-normal">{placeholder}</span>
                            )}
                        </div>
                        <ChevronsUpDown className="size-4 shrink-0 opacity-70 ml-2 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-(--radix-popover-trigger-width) p-0 rounded-xl border border-border shadow-xl bg-popover z-70 overflow-hidden"
                    align="start"
                    sideOffset={6}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    id="multi-select-options"
                >
                    <div className="flex flex-col w-full">
                        {/* Campo de Busca */}
                        <div className="flex items-center border-b border-border/50 px-3 py-1 bg-muted/10">
                            <Search className="mr-2 size-4 shrink-0 opacity-50 text-muted-foreground" />
                            <input
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground border-none ring-0 focus:ring-0 focus:outline-none"
                            />
                        </div>

                        {/* Lista de Opções com Rolagem Dedicada */}
                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                            {/* Opção "Todos os Serviços" / Selecionar Todos */}
                            {selectAllOption && items.length > 0 && !search && (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleSelectAll();
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleSelectAll();
                                        }
                                    }}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-2 px-2.5 text-xs font-normal outline-none transition-colors hover:bg-muted focus:bg-muted text-foreground"
                                    )}
                                >
                                    <span className="truncate font-normal text-foreground">{selectAllLabel}</span>
                                    <div
                                        className={cn(
                                            'flex size-4 shrink-0 items-center justify-center rounded border border-muted-foreground/30 transition-all ml-2',
                                            isAllSelected
                                                ? 'border-primary bg-primary text-primary-foreground scale-100'
                                                : 'bg-transparent',
                                        )}
                                    >
                                        {isAllSelected && <Check className="size-3 stroke-3 text-white" />}
                                    </div>
                                </div>
                            )}

                            {filteredItems.length === 0 ? (
                                <div className="py-6 text-center text-xs text-muted-foreground">
                                    {emptyMessage}
                                </div>
                            ) : (
                                filteredItems.map((item) => {
                                    const isSelected = !isAllSelected && currentValues.includes(item.value);
                                    return (
                                        <div
                                            key={item.value}
                                            role="button"
                                            tabIndex={0}
                                            onPointerDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleItem(item.value);
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleItem(item.value);
                                                }
                                            }}
                                            className={cn(
                                                "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-2 px-2.5 text-xs font-normal outline-none transition-colors hover:bg-muted focus:bg-muted text-foreground",
                                                isSelected && "bg-muted/40 font-medium"
                                            )}
                                        >
                                            <div className="flex flex-col min-w-0 flex-1 pr-4 leading-snug">
                                                <span className="truncate font-normal text-foreground">{item.label}</span>
                                                {(item.sublabel || item.description) && (
                                                    <span className="truncate text-[11px] font-normal text-muted-foreground/80">
                                                        {item.sublabel || item.description}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={cn(
                                                    'flex size-4 shrink-0 items-center justify-center rounded border border-muted-foreground/30 transition-all ml-2',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground scale-100'
                                                        : 'bg-transparent',
                                                )}
                                            >
                                                {isSelected && <Check className="size-3 stroke-3 text-white" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );

    if (!label && typeof error !== 'string') {
        return multiSelectContent;
    }

    return (
        <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
            {label && (
                <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                    {icon}
                    <span>{label}</span>
                    {required && <span className="text-destructive">*</span>}
                </Label>
            )}
            {multiSelectContent}
            {typeof error === 'string' && (
                <span className="text-xs text-destructive mt-0.5">{error}</span>
            )}
        </div>
    );
}
