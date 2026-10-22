import { cn } from '@/lib/utils';

interface AppLogoProps {
    className?: string;
    variant?: 'dark' | 'light' | 'auto';
}

const imgClassName =
    'max-h-[90px] w-full max-w-[115px] object-contain transition-all duration-200 ease-linear group-data-[collapsible=icon]:max-w-[32px]';

export default function AppLogo({ className, variant = 'dark' }: AppLogoProps) {
    return (
        <div className={cn('flex items-center justify-center transition-all duration-200 ease-linear', className)}>
            {variant !== 'dark' && (
                <img
                    src="/logo_jhe_light.png"
                    alt="JHE Veículos"
                    className={cn(imgClassName, variant === 'auto' && 'dark:hidden')}
                />
            )}
            {variant !== 'light' && (
                <img
                    src="/logo_jhe_dark.png"
                    alt="JHE Veículos"
                    className={cn(imgClassName, variant === 'auto' && 'hidden dark:block')}
                />
            )}
        </div>
    );
}
