import { Form, Head, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';

export default function Profile() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Configurações de perfil" />

            <h1 className="sr-only">Configurações de perfil</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Informações do perfil"
                    description="Atualize seu nome e endereço de e-mail"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="max-w-xl space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-xs font-semibold text-foreground md:text-sm">
                                    Nome
                                </Label>

                                <Input
                                    id="name"
                                    className="h-10 border-input/80 bg-background dark:bg-black"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Nome completo"
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-semibold text-foreground md:text-sm">
                                    Endereço de e-mail
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="h-10 border-input/80 bg-background dark:bg-black"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Endereço de e-mail"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    isLoading={processing}
                                    className="h-10 w-40 gap-2 px-6 text-xs font-bold md:text-sm"
                                    data-test="update-profile-button"
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

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Configurações de perfil',
            href: edit(),
        },
    ],
};
