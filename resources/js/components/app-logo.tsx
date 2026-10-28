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
                    src="/capy_logo_light.png"
                    alt="Capy"
                    className={cn(imgClassName, variant === 'auto' && 'dark:hidden')}
                />
            )}
            {variant !== 'light' && (
                <img
                    src="/capy_logo_dark.png"
                    alt="Capy"
                    className={cn(imgClassName, variant === 'auto' && 'hidden dark:block')}
                />
            )}
        </div>
    );
}
