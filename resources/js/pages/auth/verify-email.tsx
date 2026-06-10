// Components
import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verificação de e-mail" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Um novo link de verificação foi enviado para o endereço de e-mail fornecido durante o cadastro.
                </div>
            )}

            <form className="space-y-6 text-center">
                <Button variant="secondary">Reenviar e-mail de verificação</Button>

                <TextLink href={logout()} className="mx-auto block text-sm">
                    Sair
                </TextLink>
            </form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verificar e-mail',
    description: 'Por favor, verifique seu endereço de e-mail clicando no link que acabamos de enviar para você.',
};
