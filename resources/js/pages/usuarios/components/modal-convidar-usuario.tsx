import React from 'react';
import { useForm } from '@inertiajs/react';
import { MailPlus, Check, ArrowLeft, Shield, User } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { Botao } from '@/components/botao';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Selector, SelectorItem } from '@/components/ui/selector';
import { UserRole } from '@/types/enums/user-role';
import type { ConvidarUsuarioFormData } from '../types';

interface ModalConvidarUsuarioProps {
    aberto: boolean;
    onAbertoAlterado: (aberto: boolean) => void;
}

export function ModalConvidarUsuario({ aberto, onAbertoAlterado }: ModalConvidarUsuarioProps) {
    const { data, setData, post, processing, errors, reset, clearErrors, validate } = useForm<ConvidarUsuarioFormData>({
        name: '',
        email: '',
        role: UserRole.UsuarioPadrao,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/usuarios/convidar', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onAbertoAlterado(false);
            },
        });
    };

    return (
        <Dialog open={aberto} onOpenChange={onAbertoAlterado}>
            <DialogContent className="fixed inset-0 top-0 left-0 z-50 flex h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border/60 sm:shadow-2xl">
                <DialogHeader className="flex flex-row items-center gap-3.5 border-b border-border/40 p-4 text-left sm:p-6">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MailPlus className="size-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
                            Convidar Usuário
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
                            Envie um convite de acesso para um novo colaborador definir sua senha.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Informações do Usuário
                            </span>
                            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">
                                        Nome Completo <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => {
                                            setData('name', e.target.value);
                                            clearErrors('name');
                                        }}
                                        onBlur={() => validate('name')}
                                        placeholder="Digite o nome completo..."
                                        error={Boolean(errors.name)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email">
                                        E-mail do Colaborador <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => {
                                            setData('email', e.target.value);
                                            clearErrors('email');
                                        }}
                                        onBlur={() => validate('email')}
                                        placeholder="Ex: colaborador@empresa.com.br"
                                        error={Boolean(errors.email)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Nível de Acesso <span className="text-destructive">*</span>
                            </span>
                            <div className="mt-3">
                                <Selector
                                    value={data.role}
                                    onValueChange={(val) => {
                                        setData('role', val as UserRole);
                                        clearErrors('role');
                                    }}
                                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                                >
                                    <SelectorItem
                                        value={UserRole.Admin}
                                        title="Administrador"
                                        description="Acesso irrestrito a todas as configurações"
                                        icon={Shield}
                                    />
                                    <SelectorItem
                                        value={UserRole.UsuarioPadrao}
                                        title="Usuário Padrão"
                                        description="Acesso operacional básico ao sistema"
                                        icon={User}
                                    />
                                </Selector>
                                <InputError message={errors.role} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex shrink-0 items-center justify-between border-t border-border/40 bg-muted/20 p-4 sm:justify-between">
                        <DialogClose asChild>
                            <Botao
                                type="button"
                                variant="outline"
                                icon={<ArrowLeft className="size-4" />}
                                disabled={processing}
                            >
                                Voltar
                            </Botao>
                        </DialogClose>
                        <Botao type="submit" loading={processing} icon={<Check className="size-4" strokeWidth={2.5} />}>
                            Enviar
                        </Botao>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
