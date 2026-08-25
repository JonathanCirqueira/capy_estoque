import { Form, Head } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

export default function Security() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Configurações de segurança" />

            <h1 className="sr-only">Configurações de segurança</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Atualizar senha"
                    description="Certifique-se de que sua conta esteja usando uma senha longa e aleatória para se manter segura"
                />

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={['password', 'password_confirmation', 'current_password']}
                    resetOnSuccess
                    onError={(formErrors) => {
                        if (formErrors.password) {
                            passwordInput.current?.focus();
                        }

                        if (formErrors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="max-w-xl space-y-5"
                >
                    {({ errors: formErrors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="current_password"
                                    className="text-xs font-semibold text-foreground md:text-sm"
                                >
                                    Senha atual
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="h-10 border-input/80 bg-background dark:bg-black"
                                    autoComplete="current-password"
                                    placeholder="Senha atual"
                                />

                                <InputError message={formErrors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-xs font-semibold text-foreground md:text-sm">
                                    Nova senha
                                </Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="h-10 border-input/80 bg-background dark:bg-black"
                                    autoComplete="new-password"
                                    placeholder="Nova senha"
                                />

                                <InputError message={formErrors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-xs font-semibold text-foreground md:text-sm"
                                >
                                    Confirmar senha
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="h-10 border-input/80 bg-background dark:bg-black"
                                    autoComplete="new-password"
                                    placeholder="Confirmar senha"
                                />

                                <InputError message={formErrors.password_confirmation} />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    isLoading={processing}
                                    className="h-10 w-40 gap-2 px-6 text-xs font-bold md:text-sm"
                                    data-test="update-password-button"
                                >
                                    <Save className="size-4" />
                                    Salvar
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Configurações de segurança',
            href: edit(),
        },
    ],
};
