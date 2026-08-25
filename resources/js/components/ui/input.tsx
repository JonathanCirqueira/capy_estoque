import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'error'> {
    onlyDigits?: boolean;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    label?: string;
    error?: boolean | string;
    clearable?: boolean;
    onClear?: () => void;
    containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            containerClassName,
            type = 'text',
            onlyDigits,
            icon,
            leftIcon,
            rightIcon,
            label,
            error,
            clearable = false,
            onClear,
            onChange,
            onKeyDown,
            value,
            defaultValue,
            disabled,
            ...props
        },
        ref
    ) => {
        const startIcon = leftIcon || icon;
        const id = React.useId();

        const [internalValue, setInternalValue] = React.useState(
            value !== undefined ? value : defaultValue || ''
        );

        React.useEffect(() => {
            if (value !== undefined) {
                setInternalValue(value);
            }
        }, [value]);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (onlyDigits || type === 'number') {
                if (
                    [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                    e.ctrlKey ||
                    e.metaKey ||
                    (e.keyCode >= 35 && e.keyCode <= 40)
                ) {
                    if (onKeyDown) onKeyDown(e);
                    return;
                }
                if (
                    (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                    (e.keyCode < 96 || e.keyCode > 105)
                ) {
                    e.preventDefault();
                }
            }
            if (onKeyDown) onKeyDown(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onlyDigits || type === 'number') {
                const target = e.target;
                const originalValue = target.value;
                const sanitizedValue = originalValue.replace(/\D/g, '');
                if (originalValue !== sanitizedValue) {
                    target.value = sanitizedValue;
                }
            }
            setInternalValue(e.target.value);
            if (onChange) onChange(e);
        };

        const handleClear = () => {
            setInternalValue('');
            if (onClear) {
                onClear();
            } else if (onChange) {
                const event = {
                    target: { value: '' },
                    currentTarget: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
            }
        };

        const hasValue = Boolean(internalValue);
        const inputType = type === 'number' ? 'text' : type;

        return (
            <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
                {label && (
                    <label
                        htmlFor={props.id || id}
                        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"
                    >
                        {label}
                        {props.required && <span className="text-destructive">*</span>}
                    </label>
                )}

                <div className="relative flex items-center w-full">
                    {startIcon && (
                        <div className="absolute left-3.5 flex items-center justify-center text-muted-foreground/70 pointer-events-none">
                            {startIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={props.id || id}
                        type={inputType}
                        value={value !== undefined ? value : internalValue}
                        data-slot="input"
                        disabled={disabled}
                        onKeyDown={handleKeyDown}
                        onChange={handleChange}
                        className={cn(
                            'flex h-10 w-full min-w-0 rounded-2xl border border-input bg-background dark:bg-black py-2 text-xs md:text-sm font-normal shadow-2xs transition-all outline-none',
                            'placeholder:text-foreground text-foreground',
                            'hover:border-primary/40',
                            'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-destructive focus-visible:ring-destructive/20',
                            startIcon ? 'pl-10' : 'px-3.5',
                            rightIcon || (clearable && hasValue) ? 'pr-10' : 'pr-3.5',
                            className
                        )}
                        {...props}
                    />

                    {(rightIcon || (clearable && hasValue)) && (
                        <div className="absolute right-3 flex items-center gap-1">
                            {clearable && hasValue && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="rounded-full p-1 text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                    title="Limpar"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                            {rightIcon && (
                                <div className="flex items-center justify-center text-muted-foreground/70">
                                    {rightIcon}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {typeof error === 'string' && (
                    <span className="text-xs text-destructive mt-0.5">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
