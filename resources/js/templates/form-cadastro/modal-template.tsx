import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { UserCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import type { ExemploCadastroSimples, ModalCadastroProps } from './types';

// Opções de demonstração para selects
const OPCOES_DEPARTAMENTO = [
    { value: '1', label: 'Engenharia de Software' },
    { value: '2', label: 'Infraestrutura e TI' },
    { value: '3', label: 'Recursos Humanos' },
    { value: '4', label: 'Financeiro e Fiscal' },
];

const OPCOES_CARGO = [
    { value: '1', label: 'Desenvolvedor Full Stack' },
    { value: '2', label: 'Administrador de Redes' },
    { value: '3', label: 'Analista de RH' },
    { value: '4', label: 'Coordenador Financeiro' },
];

const OPCOES_STATUS = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'inativo', label: 'Inativo' },
];

/**
 * =============================================================================
 * TEMPLATE CANÔNICO: CADASTRO EM MODAL (<= 8 CAMPOS)
 * =============================================================================
 * Ideal para cadastros rápidos, entidades de apoio, convites, usuários simples,
 * categorias, centros de custo ou cadastros com até 8 campos.
 *
 * Características Canônicas:
 * 1. Dialog responsivo: tela cheia no mobile (`fixed inset-0`) e modal centralizado
 *    com cantos arredondados no desktop (`sm:max-w-3xl sm:rounded-2xl`).
 * 2. Cabeçalho com badge arredondado de ícone (`rounded-xl bg-primary/10 text-primary`).
 * 3. Formulário em Grid de 2 colunas com Labels e Inputs padronizados.
 * 4. Validação reativa com exibição de erros por campo e Sonner toast no submit.
 * 5. DialogFooter com botão Cancelar (`DialogClose`) e Salvar com spinner de loading.
 */
export function ModalCadastroTemplate({
    aberto,
    onAbertoAlterado,
    onConfirmar,
    item = null,
    modo = 'create',
}: ModalCadastroProps<ExemploCadastroSimples>) {
    const isEdit = modo === 'edit' || Boolean(item?.id);
    const isView = modo === 'view';

    const [isSaving, setIsSaving] = useState(false);

    // Inicialização do useForm do Inertia
    const { data, setData, processing, errors, setError, clearErrors, reset } = useForm<ExemploCadastroSimples>({
        nome: item?.nome || '',
        email: item?.email || '',
        cargo_id: item?.cargo_id || '',
        departamento_id: item?.departamento_id || '',
        telefone: item?.telefone || '',
        status: item?.status || 'ativo',
        observacoes: item?.observacoes || '',
    });

    // Sincroniza dados caso o item selecionado mude
    useEffect(() => {
        if (item) {
            setData({
                nome: item.nome || '',
                email: item.email || '',
                cargo_id: item.cargo_id || '',
                departamento_id: item.departamento_id || '',
                telefone: item.telefone || '',
                status: item.status || 'ativo',
                observacoes: item.observacoes || '',
            });
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
    }, [item, aberto, setData, reset, clearErrors]);

    // Validação local antes do envio
    const validarCampos = (): boolean => {
        clearErrors();
        let valido = true;

        if (!data.nome.trim()) {
            setError('nome', 'O nome completo é obrigatório.');
            valido = false;
        }

        if (!data.email.trim()) {
            setError('email', 'O e-mail corporativo é obrigatório.');
            valido = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            setError('email', 'Informe um endereço de e-mail válido.');
            valido = false;
        }

        if (!data.departamento_id) {
            setError('departamento_id', 'Selecione o departamento.');
            valido = false;
        }

        if (!data.cargo_id) {
            setError('cargo_id', 'Selecione o cargo.');
            valido = false;
        }

        return valido;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isView) {
            onAbertoAlterado(false);
            return;
        }

        if (!validarCampos()) {
            toast.error('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }

        setIsSaving(true);

        // Simulação de requisição / Em produção use: router.post('/rota', data, { onSuccess: ... })
        setTimeout(() => {
            setIsSaving(false);
            toast.success(isEdit ? 'Registro atualizado com sucesso!' : 'Registro cadastrado com sucesso!');
            onConfirmar?.(data);
            onAbertoAlterado(false);
            reset();
        }, 600);
    };

    const titulos = {
        view: 'Detalhes do Registro',
        edit: 'Editar Cadastro',
        create: 'Novo Cadastro',
    };

    const descricoes = {
        view: 'Consulte os dados cadastrais da entidade selecionada.',
        edit: 'Atualize os dados cadastrais preenchendo as informações abaixo.',
        create: 'Preencha os campos abaixo para adicionar um novo registro ao sistema.',
    };

    return (
        <Dialog open={aberto} onOpenChange={onAbertoAlterado}>
            <DialogContent className="fixed inset-0 top-0 left-0 z-50 flex h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border/60 sm:shadow-2xl">
                {/* 1. CABEÇALHO DO MODAL */}
                <DialogHeader className="border-b border-border/40 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UserCheck className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-foreground sm:text-lg">
                                {titulos[modo]}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {descricoes[modo]}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* 2. FORMULÁRIO COM SCROLL INTERNO (<= 8 CAMPOS EM GRID) */}
                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Campo 1: Nome Completo */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label
                                    htmlFor="modal_nome"
                                    className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    NOME COMPLETO <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="modal_nome"
                                    type="text"
                                    disabled={isView || isSaving}
                                    placeholder="Ex: Ana Clara dos Santos"
                                    value={data.nome}
                                    onChange={(e) => {
                                        setData('nome', e.target.value);
                                        if (errors.nome) clearErrors('nome');
                                    }}
                                    className="h-10 rounded-xl text-sm"
                                />
                                {errors.nome && <p className="text-xs font-medium text-destructive">{errors.nome}</p>}
                            </div>

                            {/* Campo 2: E-mail */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="modal_email"
                                    className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    E-MAIL CORPORATIVO <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="modal_email"
                                    type="email"
                                    disabled={isView || isSaving}
                                    placeholder="ana.santos@empresa.com"
                                    value={data.email}
                                    onChange={(e) => {
                                        setData('email', e.target.value);
                                        if (errors.email) clearErrors('email');
                                    }}
                                    className="h-10 rounded-xl text-sm"
                                />
                                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                            </div>

                            {/* Campo 3: Telefone / Ramal */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="modal_telefone"
                                    className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    TELEFONE / RAMAL
                                </Label>
                                <Input
                                    id="modal_telefone"
                                    type="tel"
                                    disabled={isView || isSaving}
                                    placeholder="(11) 98765-4321"
                                    value={data.telefone}
                                    onChange={(e) => {
                                        setData('telefone', e.target.value);
                                        if (errors.telefone) clearErrors('telefone');
                                    }}
                                    className="h-10 rounded-xl text-sm"
                                />
                                {errors.telefone && (
                                    <p className="text-xs font-medium text-destructive">{errors.telefone}</p>
                                )}
                            </div>

                            {/* Campo 4: Departamento */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    DEPARTAMENTO <span className="text-destructive">*</span>
                                </Label>
                                <Combobox
                                    options={OPCOES_DEPARTAMENTO}
                                    value={data.departamento_id}
                                    onValueChange={(val) => {
                                        setData('departamento_id', val || '');
                                        if (errors.departamento_id) clearErrors('departamento_id');
                                    }}
                                    placeholder="Selecione o departamento..."
                                    searchPlaceholder="Buscar departamento..."
                                    disabled={isView || isSaving}
                                    className="h-10 rounded-xl"
                                />
                                {errors.departamento_id && (
                                    <p className="text-xs font-medium text-destructive">{errors.departamento_id}</p>
                                )}
                            </div>

                            {/* Campo 5: Cargo / Perfil */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    CARGO / PERFIL <span className="text-destructive">*</span>
                                </Label>
                                <Combobox
                                    options={OPCOES_CARGO}
                                    value={data.cargo_id}
                                    onValueChange={(val) => {
                                        setData('cargo_id', val || '');
                                        if (errors.cargo_id) clearErrors('cargo_id');
                                    }}
                                    placeholder="Selecione o cargo..."
                                    searchPlaceholder="Buscar cargo..."
                                    disabled={isView || isSaving}
                                    className="h-10 rounded-xl"
                                />
                                {errors.cargo_id && (
                                    <p className="text-xs font-medium text-destructive">{errors.cargo_id}</p>
                                )}
                            </div>

                            {/* Campo 6: Status da Conta */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    STATUS INICIAL
                                </Label>
                                <Combobox
                                    options={OPCOES_STATUS}
                                    value={data.status}
                                    onValueChange={(val) => {
                                        if (val) setData('status', val as any);
                                    }}
                                    placeholder="Selecione o status..."
                                    disabled={isView || isSaving}
                                    className="h-10 rounded-xl"
                                />
                            </div>

                            {/* Campo 7: Observações Adicionais */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label
                                    htmlFor="modal_obs"
                                    className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    OBSERVAÇÕES OU NOTAS
                                </Label>
                                <Input
                                    id="modal_obs"
                                    type="text"
                                    disabled={isView || isSaving}
                                    placeholder="Informações complementares sobre este registro..."
                                    value={data.observacoes}
                                    onChange={(e) => setData('observacoes', e.target.value)}
                                    className="h-10 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. RODAPÉ FIXO DO MODAL (DIALOG FOOTER) - UM BOTÃO EM CADA PONTA */}
                    <DialogFooter className="flex w-full shrink-0 flex-row items-center justify-between border-t border-border/40 bg-muted/20 p-4 sm:justify-between">
                        <DialogClose asChild disabled={isSaving || processing}>
                            <Botao type="button" variant="outline">
                                Voltar
                            </Botao>
                        </DialogClose>

                        {!isView && (
                            <Botao
                                type="submit"
                                loading={isSaving || processing}
                                icon={<Check className="size-4" strokeWidth={2.5} />}
                            >
                                Salvar
                            </Botao>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
