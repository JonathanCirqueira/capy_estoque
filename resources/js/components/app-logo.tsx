import { cn } from '@/lib/utils';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center justify-center transition-all duration-200 ease-linear', className)}>
            <img
                src="/logo_jhe_dark.png"
                alt="JHE Veículos"
                className="max-h-[90px] w-full max-w-[115px] object-contain transition-all duration-200 ease-linear group-data-[collapsible=icon]:max-w-[32px]"
            />
        </div>
    );
}
