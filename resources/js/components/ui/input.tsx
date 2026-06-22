import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  onlyDigits?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", onlyDigits, onChange, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onlyDigits || type === "number") {
        // Permitir teclas de controle: Backspace, Delete, Tab, Escape, Enter
        if (
          [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
          // Permitir Ctrl+A, Ctrl+C, Ctrl+V, etc.
          e.ctrlKey === true ||
          e.metaKey === true ||
          // Permitir Home, End, Left, Right
          (e.keyCode >= 35 && e.keyCode <= 40)
        ) {
          if (onKeyDown) {
            onKeyDown(e);
          }
          return;
        }
        // Impedir se não for número (0-9 de teclado normal ou numpad)
        if (
          (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
          (e.keyCode < 96 || e.keyCode > 105)
        ) {
          e.preventDefault();
        }
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onlyDigits || type === "number") {
        const target = e.target;
        const originalValue = target.value;
        const sanitizedValue = originalValue.replace(/\D/g, "");
        
        if (originalValue !== sanitizedValue) {
          target.value = sanitizedValue;
        }
      }
      if (onChange) {
        onChange(e);
      }
    };

    // Usamos tipo "text" sob o capô para inputs numéricos simples para evitar spinners padrão dos navegadores
    const inputType = type === "number" ? "text" : type;

    return (
      <input
        ref={ref}
        type={inputType}
        data-slot="input"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        className={cn(
          "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-11 w-full min-w-0 rounded-xl border bg-transparent px-4 py-3 text-sm shadow-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:outline-none",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }

