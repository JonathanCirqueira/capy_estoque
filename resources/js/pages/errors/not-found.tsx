import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Illustration404 } from '@/components/illustrations/illustration-404';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
            <Head title="404 Página não encontrada" />

            {/* Topbar: Logo na esquerda, Alternador de tema na direita */}
            <header className="flex h-14 w-full items-center justify-between px-6 sm:h-16 sm:px-10">
                <Link href={home().url} className="inline-flex items-center transition-opacity hover:opacity-85">
                    <AppLogo variant="auto" className="[&_img]:max-h-8 sm:[&_img]:max-h-9" />
                </Link>

                <ThemeToggle />
            </header>

            {/* Conteúdo Central */}
            <main className="my-auto flex flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:px-6">
                <div className="mx-auto flex w-full max-w-xl flex-col items-center">
                    {/* 1. Título */}
                    <h1 className="max-w-[320px] text-2xl font-bold tracking-tight text-foreground sm:max-w-95 sm:text-3xl md:text-4xl">
                        Desculpe, página não encontrada!
                    </h1>

                    {/* 2. Descrição estreita */}
                    <p className="mt-3 max-w-105 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Desculpe, não encontramos a página que você está procurando. Talvez você tenha digitado errado o
                        URL? Certifique-se de verificar a ortografia.
                    </p>

                    {/* 3. Ilustração 404 isolada */}
                    <Illustration404 />

                    {/* 4. Botão Voltar */}
                    <div className="mt-4">
                        <Button asChild size="lg" className="min-w-36 rounded-md px-8 py-2.5 font-medium shadow-xs">
                            <Link href={home().url} className="inline-flex items-center gap-2">
                                <ArrowLeft className="size-4" />
                                <span>Voltar</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
