'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface SearchableSelectOption {
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value?: string | number;
    onChange?: (value: string) => void;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: boolean | string;
    clearable?: boolean;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
}

export function SearchableSelect({
    options = [],
    value,
    onChange,
    onValueChange,
    placeholder = 'Selecione uma opção...',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'Nenhum resultado encontrado.',
    label,
    required = false,
    disabled = false,
    error = false,
    clearable = false,
    className,
    triggerClassName,
    contentClassName,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const id = React.useId();

    const handleSelect = (selectedValue: string) => {
        const nextValue = String(value) === selectedValue && clearable ? '' : selectedValue;
        if (onChange) onChange(nextValue);
        if (onValueChange) onValueChange(nextValue);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onChange) onChange('');
        if (onValueChange) onValueChange('');
    };

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    return (
        <div className={cn('flex flex-col gap-1.5 w-full', className)}>
            {label && (
                <label
                    htmlFor={id}
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                >
                    {label}
                    {required && <span className="text-destructive">*</span>}
                </label>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild disabled={disabled}>
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={`${id}-list`}
                        className={cn(
                            'h-10 w-full justify-between rounded-2xl border border-input bg-background dark:bg-black px-3.5 py-2 text-xs md:text-sm font-normal text-foreground shadow-2xs transition-all',
                            'hover:border-primary/40 hover:bg-background',
                            'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
                            'data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20',
                            error && 'border-destructive focus-visible:ring-destructive/20',
                            disabled && 'opacity-50 cursor-not-allowed',
                            triggerClassName
                        )}
                    >
                        <span className="truncate">
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            {clearable && selectedOption && (
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleClear}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') handleClear(e);
                                    }}
                                    className="rounded-full p-1 opacity-60 hover:opacity-100 hover:bg-muted transition-opacity"
                                    title="Limpar seleção"
                                >
                                    <X className="size-3.5 text-muted-foreground" />
                                </span>
                            )}
                            <ChevronsUpDown className="size-4 opacity-50 shrink-0 text-muted-foreground" />
                        </div>
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className={cn(
                        'w-(--radix-popover-trigger-width) min-w-55 p-0 rounded-2xl border border-border/60 bg-popover text-popover-foreground shadow-lg overflow-hidden backdrop-blur-sm',
                        contentClassName
                    )}
                    align="start"
                    sideOffset={6}
                >
                    <Command className="w-full">
                        <CommandInput placeholder={searchPlaceholder} />

                        <CommandList id={`${id}-list`} className="max-h-65 p-1.5 overflow-y-auto">
                            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                {emptyMessage}
                            </CommandEmpty>

                            <CommandGroup className="p-0">
                                {options.map((option) => {
                                    const isSelected = String(option.value) === String(value);

                                    return (
                                        <CommandItem
                                            key={String(option.value)}
                                            value={option.label}
                                            disabled={option.disabled}
                                            onSelect={() => handleSelect(String(option.value))}
                                            className={cn(
                                                'relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors my-0.5',
                                                'data-[selected=true]:bg-muted/80 data-[selected=true]:text-foreground',
                                                isSelected && 'bg-muted font-medium text-foreground',
                                                option.disabled && 'opacity-40 cursor-not-allowed'
                                            )}
                                        >
                                            <div className="flex flex-col truncate pr-2">
                                                <span className="truncate">{option.label}</span>
                                                {option.description && (
                                                    <span className="text-xs text-muted-foreground truncate font-normal">
                                                        {option.description}
                                                    </span>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <Check className="size-4 shrink-0 text-primary ml-2" />
                                            )}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {typeof error === 'string' && (
                <span className="text-xs text-destructive mt-0.5">{error}</span>
            )}
        </div>
    );
}
