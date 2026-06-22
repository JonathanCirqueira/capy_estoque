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

interface ComboboxProps {
    items: { value: string; label: string }[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
    error?: boolean;
    clearable?: boolean;
    onClear?: () => void;
}

export function Combobox({
    items,
    value,
    onValueChange,
    placeholder = 'Selecione...',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'Nenhum resultado encontrado.',
    disabled = false,
    className,
    error = false,
    clearable = false,
    onClear,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const id = React.useId();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={id}
                    className={cn(
                        'h-11 w-full justify-between rounded-xl border border-input px-4 py-3 text-sm font-medium text-foreground transition-all focus:outline-none focus:ring-[3px] focus:ring-primary/15 focus:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:border-primary data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-primary/15 dark:bg-[#0A0A0A]',
                        'hover:border-primary/30 hover:bg-primary/2 dark:hover:bg-primary/1.5',
                        error && 'border-destructive focus:ring-destructive/20',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate">
                        {value ? items.find((item) => item.value === value)?.label : placeholder}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {clearable && value && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (onClear) {
                                        onClear();
                                    } else {
                                        onValueChange('');
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (onClear) {
                                            onClear();
                                        } else {
                                            onValueChange('');
                                        }
                                    }
                                }}
                                className="rounded-sm opacity-50 hover:opacity-100 transition-opacity p-0.5 hover:bg-muted"
                            >
                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0 rounded-xl border border-border/40 bg-popover/95 backdrop-blur-md animate-none">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList id={id}>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={() => {
                                        onValueChange(item.value);
                                        setOpen(false);
                                    }}
                                    className="rounded-lg py-2.5 text-sm font-medium transition-colors focus:bg-primary focus:text-primary-foreground"
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === item.value ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
