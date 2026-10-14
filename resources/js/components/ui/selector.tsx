import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectorOption<T extends string = string> {
    id: T;
    title: string;
    description?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
}

/* Context for composable children (Selector.Item) */
interface SelectorContextValue {
    selectedValue?: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
}

const SelectorContext = React.createContext<SelectorContextValue | undefined>(undefined);

function useSelectorContext() {
    return React.useContext(SelectorContext);
}

/* Component: SelectorItem */
export interface SelectorItemProps<T extends string = string> {
    value: T;
    title: string;
    description?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function SelectorItem<T extends string = string>({
    value,
    title,
    description,
    icon: OptionIcon,
    disabled = false,
    className,
    children,
}: SelectorItemProps<T>) {
    const context = useSelectorContext();
    const isSelected = context?.selectedValue === value;
    const isItemDisabled = context?.disabled || disabled;

    const handleClick = () => {
        if (isItemDisabled || !context) return;
        context.onSelect(value);
    };

    return (
        <div
            role="radio"
            aria-checked={isSelected}
            tabIndex={isItemDisabled ? -1 : 0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if ((e.key === ' ' || e.key === 'Enter') && !isItemDisabled) {
                    e.preventDefault();
                    handleClick();
                }
            }}
            className={cn(
                'relative flex items-center justify-between rounded-2xl p-4 transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isSelected
                    ? 'border border-primary bg-[#F8FAFC] dark:bg-primary/10 shadow-2xs'
                    : 'border border-border/80 bg-background hover:border-border hover:bg-muted/30 dark:bg-card',
                isItemDisabled && 'cursor-not-allowed opacity-50',
                className
            )}
        >
            {children || (
                <>
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        {/* Icon Box */}
                        {OptionIcon && (
                            <div
                                className={cn(
                                    'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground shadow-2xs'
                                        : 'bg-muted/70 text-muted-foreground border border-border/40'
                                )}
                            >
                                <OptionIcon className="size-4" />
                            </div>
                        )}

                        {/* Text Details */}
                        <div className="flex flex-col min-w-0">
                            <span className="truncate font-bold text-xs tracking-wide text-foreground uppercase">
                                {title}
                            </span>
                            {description && (
                                <span className="truncate text-[11px] text-muted-foreground font-normal mt-0.5">
                                    {description}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Selection Indicator (Circular check indicator matching image) */}
                    <div
                        className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-full transition-all',
                            isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-muted-foreground/30 bg-background'
                        )}
                    >
                        {isSelected && <Check className="size-3 stroke-3 text-primary-foreground" />}
                    </div>
                </>
            )}
        </div>
    );
}

/* Component: Selector */
export interface SelectorProps<T extends string = string> {
    value?: T;
    defaultValue?: T;
    onValueChange?: (value: T) => void;
    options?: SelectorOption<T>[];
    label?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
    gridClassName?: string;
    disabled?: boolean;
    children?: React.ReactNode;
}

export function SelectorRoot<T extends string = string>({
    value,
    defaultValue,
    onValueChange,
    options,
    label,
    icon: HeaderIcon,
    className,
    gridClassName,
    disabled = false,
    children,
}: SelectorProps<T>) {
    const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value ?? defaultValue);

    React.useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    const handleSelect = (newValue: string) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue as T);
    };

    return (
        <SelectorContext.Provider
            value={{
                selectedValue,
                onSelect: handleSelect,
                disabled,
            }}
        >
            <div className={cn('w-full space-y-3.5', className)}>
                {/* Header label with icon (only if label or icon provided) */}
                {(label || HeaderIcon) && (
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {HeaderIcon && (
                            <div className="flex size-6 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground border border-border/40">
                                <HeaderIcon className="size-3.5" />
                            </div>
                        )}
                        {label && <span>{label}</span>}
                    </div>
                )}

                {/* Grid container */}
                <div className={cn('grid grid-cols-1 gap-3.5 sm:grid-cols-3', gridClassName)}>
                    {children ||
                        options?.map((option) => (
                            <SelectorItem
                                key={option.id}
                                value={option.id}
                                title={option.title}
                                description={option.description}
                                icon={option.icon}
                                disabled={option.disabled}
                            />
                        ))}
                </div>
            </div>
        </SelectorContext.Provider>
    );
}

export const Selector = Object.assign(SelectorRoot, {
    Item: SelectorItem,
});
