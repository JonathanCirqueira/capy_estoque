'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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

interface MultiSelectProps {
    items: { value: string; label: string }[];
    value: string[];
    onValueChange: (value: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    containerClassName?: string;
    error?: boolean | string;
}

export function MultiSelect({
    items,
    value = [],
    onValueChange,
    placeholder = 'Selecione as opções...',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'Nenhum resultado encontrado.',
    label,
    required = false,
    disabled = false,
    className,
    containerClassName,
    error = false,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const id = React.useId();

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

    const multiSelectContent = (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={id}
                    className={cn(
                        'h-auto min-h-11 w-full justify-between rounded-xl border border-input px-4 py-2 text-sm font-medium text-foreground transition-all focus:outline-none focus:ring-[3px] focus:ring-primary/15 focus:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:border-primary data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-primary/15 dark:bg-[#0A0A0A]',
                        'hover:border-primary/30 hover:bg-primary/2 dark:hover:bg-primary/1.5',
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
                                        <span className="max-w-28 truncate">{matchedItem.label}</span>
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
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0 rounded-xl border border-border/40 bg-popover/95 backdrop-blur-md animate-none">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList id={id}>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => {
                                const isSelected = value.includes(item.value);
                                return (
                                    <CommandItem
                                        key={item.value}
                                        value={item.label}
                                        onSelect={() => {
                                            handleSelect(item.value);
                                        }}
                                        className="rounded-lg py-2.5 text-sm font-medium transition-colors focus:bg-primary focus:text-primary-foreground"
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                isSelected ? 'opacity-100' : 'opacity-0',
                                            )}
                                        />
                                        {item.label}
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
                <Label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                    {label}
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
