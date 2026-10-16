import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-xl border p-4",
                    description: "group-[.toast]:text-muted-foreground text-xs",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    success: "group-[.toaster]:!bg-[color-mix(in_oklab,var(--success)_15%,var(--card))] group-[.toaster]:!text-[oklch(0.25_0.08_137.47)] group-[.toaster]:!border-success/30 dark:group-[.toaster]:!bg-[color-mix(in_oklab,var(--success)_10%,var(--card))] dark:group-[.toaster]:!text-success dark:group-[.toaster]:!border-success/20",
                    error: "group-[.toaster]:!bg-[color-mix(in_oklab,var(--error)_15%,var(--card))] group-[.toaster]:!text-destructive group-[.toaster]:!border-error/30 dark:group-[.toaster]:!bg-[color-mix(in_oklab,var(--error)_10%,var(--card))] dark:group-[.toaster]:!text-error dark:group-[.toaster]:!border-error/20",
                    warning: "group-[.toaster]:!bg-[color-mix(in_oklab,var(--warning)_15%,var(--card))] group-[.toaster]:!text-[oklch(0.35_0.12_70.08)] group-[.toaster]:!border-warning/30 dark:group-[.toaster]:!bg-[color-mix(in_oklab,var(--warning)_10%,var(--card))] dark:group-[.toaster]:!text-warning dark:group-[.toaster]:!border-warning/20",
                    info: "group-[.toaster]:!bg-[color-mix(in_oklab,var(--info)_15%,var(--card))] group-[.toaster]:!text-info-foreground group-[.toaster]:!border-info/30 dark:group-[.toaster]:!bg-[color-mix(in_oklab,var(--info)_10%,var(--card))] dark:group-[.toaster]:!text-info dark:group-[.toaster]:!border-info/20",
                },
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
