'use client';

import * as React from 'react';
import { ChevronsUpDown, X, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export interface MultiSelectItem {
    value: string;
    label: string;
    description?: string;
}

export interface MultiSelectProps {
    items: MultiSelectItem[];
    value: string[];
    onValueChange: (value: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    label?: string;
    required?: boolean;
    icon?: React.ReactNode;
    selectAllOption?: boolean;
    selectAllLabel?: string;
    disabled?: boolean;
    className?: string;
    containerClassName?: string;
    error?: boolean | string;
}

export function MultiSelect({
    items = [],
    value = [],
    onValueChange,
    placeholder = 'Selecione os usuários...',
    searchPlaceholder = 'Buscar por nome ou e-mail...',
    emptyMessage = 'Nenhum resultado encontrado.',
    label,
    required = false,
    icon,
    selectAllOption = true,
    selectAllLabel = 'Todos os Usuários',
    disabled = false,
    className,
    containerClassName,
    error = false,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const id = React.useId();

    const isAllSelected = items.length > 0 && value.length === items.length;

    const handleUnselect = (itemValue: string) => {
        onValueChange(value.filter((val) => val !== itemValue));
    };

    const handleSelect = (itemValue: string) => {
        if (value.includes(itemValue)) {
            handleUnselect(itemValue);
        } else {
            onValueChange([...value, itemValue]);
        }
    };

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            onValueChange([]);
        } else {
            onValueChange(items.map((item) => item.value));
        }
    };

    const multiSelectContent = (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={id}
                    className={cn(
                        'h-auto min-h-11 w-full justify-between rounded-2xl border border-input bg-muted/30 dark:bg-neutral-900/60 px-4 py-2 text-sm font-medium text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20',
                        'hover:border-primary/40',
                        error && 'border-destructive focus:ring-destructive/20',
                        value.length === 0 && 'text-muted-foreground',
                        className,
                    )}
                >
                    <div className="flex flex-wrap gap-1.5 max-w-[90%] items-center text-left">
                        {value.length === 0 ? (
                            <span className="truncate">{placeholder}</span>
                        ) : (
                            value.map((val) => {
                                const matchedItem = items.find((item) => item.value === val);
                                if (!matchedItem) return null;
                                return (
                                    <Badge
                                        key={val}
                                        variant="secondary"
                                        className="h-6 rounded-lg gap-1 border border-border/50 bg-secondary/80 px-2 py-0 text-xs font-semibold text-foreground hover:bg-secondary flex items-center shrink-0"
                                    >
                                        <span className="max-w-32 truncate">{matchedItem.label}</span>
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleUnselect(val);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    handleUnselect(val);
                                                }
                                            }}
                                            className="rounded-sm opacity-60 hover:opacity-100 transition-opacity p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </span>
                                    </Badge>
                                );
                            })
                        )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) min-w-[320px] p-0 rounded-2xl border border-border/50 bg-popover/98 backdrop-blur-md shadow-xl animate-none"
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-11" />
                    <CommandList id={id} className="max-h-72 p-1.5 space-y-1">
                        <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                            {emptyMessage}
                        </CommandEmpty>

                        <CommandGroup>
                            {/* Opção "Todos os Usuários" / Selecionar Todos */}
                            {selectAllOption && items.length > 0 && (
                                <CommandItem
                                    value={selectAllLabel}
                                    onSelect={handleToggleSelectAll}
                                    className="flex items-center justify-between rounded-xl px-3 py-2.5 my-0.5 text-sm font-semibold cursor-pointer transition-colors focus:bg-muted/70 hover:bg-muted/70"
                                >
                                    <span className="text-foreground">{selectAllLabel}</span>
                                    <div
                                        className={cn(
                                            'size-4.5 rounded-md border border-input shadow-2xs flex items-center justify-center transition-all shrink-0 ml-2',
                                            isAllSelected
                                                ? 'bg-primary border-primary text-primary-foreground'
                                                : 'bg-background'
                                        )}
                                    >
                                        {isAllSelected && <Check className="size-3.5 stroke-[3]" />}
                                    </div>
                                </CommandItem>
                            )}

                            {/* Lista de Itens Individuais */}
                            {items.map((item) => {
                                const isSelected = value.includes(item.value);
                                return (
                                    <CommandItem
                                        key={item.value}
                                        value={`${item.label} ${item.description || ''}`}
                                        onSelect={() => handleSelect(item.value)}
                                        className="flex items-center justify-between rounded-xl px-3 py-2.5 my-0.5 text-sm cursor-pointer transition-colors focus:bg-muted/70 hover:bg-muted/70"
                                    >
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className="font-semibold text-foreground truncate">
                                                {item.label}
                                            </span>
                                            {item.description && (
                                                <span className="text-xs text-muted-foreground font-normal truncate">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            className={cn(
                                                'size-4.5 rounded-md border border-input shadow-2xs flex items-center justify-center transition-all shrink-0 ml-2',
                                                isSelected
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : 'bg-background'
                                            )}
                                        >
                                            {isSelected && <Check className="size-3.5 stroke-[3]" />}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );

    if (!label && typeof error !== 'string') {
        return multiSelectContent;
    }

    return (
        <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
            {label && (
                <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                    {icon || <Users className="size-3.5 text-muted-foreground" />}
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
