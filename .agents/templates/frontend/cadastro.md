# Blueprint Canônico: Formulário de Cadastro Frontend (React 19 + Inertia v3)

> **MANDATÓRIO:** Todo fluxo de criação ou edição de entidades no frontend DEVE seguir este blueprint.

---

## 🎯 Regra de Ouro Arquitetural: Divisor de Águas (8 Campos)

Antes de gerar qualquer interface de cadastro, conte a quantidade total de campos:

| Quantidade de Campos | Abordagem Obrigatória | Como Acionar na Listagem (`PageHeader`) |
| :--- | :--- | :--- |
| **Até 8 Campos (`<= 8`)** | **MODAL (`Dialog`)** | `<PageHeader action={{ label: 'Cadastrar', onClick: () => setModalAberto(true) }} />` |
| **Mais de 8 Campos (`> 8`)** | **PÁGINA COMPLETA CONTÍNUA** | `<PageHeader action={{ label: 'Cadastrar', href: '/[entidade]/cadastrar' }} />` |

---

## 📐 Anatomia das Abordagens

### 1. Modal (`<= 8` Campos)
```
[ Dialog: Tela Cheia no Mobile (fixed inset-0) | Centralizado no Desktop (sm:max-w-3xl sm:rounded-2xl) ]
  ├── DialogHeader (border-b p-4): Ícone com badge (size-10 rounded-xl bg-primary/10 text-primary) + Título + Descrição
  ├── Body com Scroll (overflow-y-auto p-4): Grid responsivo (grid grid-cols-1 sm:grid-cols-2 gap-4)
  └── DialogFooter Fixo (border-t border-border/40 bg-muted/20 p-4 flex items-center justify-between):
        ├── Esquerda: Botão Voltar (<Botao variant="outline" icon={<ArrowLeft className="size-4" />}>Voltar</Botao>)
        └── Direita: Botão Salvar (<Botao type="submit" loading={processing} icon={<Check className="size-4" strokeWidth={2.5} />}>Salvar</Botao>)
```

### 2. Página Completa Contínua (`> 8` Campos)
```
[ PageHeader: Título + Descrição Contextual (SEM botão voltar no título; usar showAction={false}) ]
[ Card Container Principal (rounded-2xl md:rounded-3xl border border-border/50 bg-card p-4 md:p-6 space-y-8): ]
  └── Formulário Contínuo (SEM etapas/steppers):
        ├── Seção 1: [Ícone + Título 10px uppercase tracking-wider] + Grid de Campos
        ├── Seção 2: [Ícone + Título 10px uppercase tracking-wider] + Grid de Campos
        └── Seção N: ...
[ Rodapé Sticky FORA DO CARD (sticky bottom-0 z-20 bg-background/95 p-4 backdrop-blur-sm flex items-center justify-between): ]
  ├── Esquerda: Botão Voltar (<Botao variant="outline" icon={<ChevronLeft className="size-4" />} onClick={handleVoltar}>Voltar</Botao>)
  └── Direita: Botão Salvar (<Botao type="submit" loading={processing} icon={<Check className="size-4" strokeWidth={2.5} />}>Salvar</Botao>)
```

---

## ⚡ Regras de Engenharia Inegociáveis

1. **Zero Strings Mágicas:** Enums PHP (`app/Enums/`) DEVEM ser 100% espelhados em TypeScript (`types.ts`).
2. **Nomenclatura Paritária (Frontend = Backend):** Chaves no formulário devem ser idênticas ao FormRequest (`snake_case`). Proibido aliases redundantes.
3. **Criação vs Edição Diferenciadas:** 
   - Criação: `post(url)`
   - Edição: `put(url)` (injeta ID na rota, permitindo `Rule::unique()->ignore($id)` no backend).
4. **Precognition Obrigatório (PROIBIDO `validarCampos` manual):** É terminantemente proibido criar funções manuais de validação no cliente (como `const validarCampos = (): boolean => { ... }`, regex manuais ou chamadas manuais a `setError`). O formulário integra nativamente com o Laravel Precognition no `useForm`, disparando validações em tempo real via `onBlur={() => validate('campo')}` e limpando erros no `onChange` (`clearErrors('campo')`). As mensagens de erro exibidas na UI vêm 100% das regras e mensagens do FormRequest do backend.
5. **Componente `Botao` Oficial:** Texto SEMPRE estático (`Salvar`). Nunca alterar texto para "Salvando...". Apenas o ícone roda via prop `loading`. Rodapé no modal usa `justify-between` com botão Voltar (`ArrowLeft` com `DialogClose asChild`) na esquerda e Salvar (`Check`) na direita.
6. **Página Completa - Botões Fora do Card:** O rodapé sticky fica estritamente FORA do container `bg-card` e SEM borda superior (`border-t`).
7. **Anti-Duplicação de Layout:** Definir layout via propriedade estática `.layout = { breadcrumbs: [...] }`.
8. **Selects e Dropdowns Oficiais (Sempre `Combobox`):** Todo seletor (incluindo Status e Foreign Keys) DEVE usar o componente `<Combobox>` (`@/components/ui/combobox`). É terminantemente proibido o uso de `@/components/ui/select` (Radix) em formulários de entidades.
9. **Zero Duplicação de Mensagens de Erro:** Para evitar duplicação textual (já que `<Input>` renderiza erro se receber string), passe SEMPRE `error={Boolean(errors.campo)}` nos componentes de entrada e use `<InputError message={errors.campo} />` logo abaixo. Proibido `error={errors.campo}` com `<InputError />`.

---

## 💻 Skeleton 1: Modal de Cadastro (`<= 8` Campos)

```tsx
import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { UserCheck, Check, ArrowLeft } from 'lucide-react';
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
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';

export enum StatusUsuario {
    Ativo = 'ativo',
    Inativo = 'inativo',
}

export interface EntidadeFormData {
    nome: string;
    email: string;
    cargo_id: string;
    departamento_id: string;
    status: StatusUsuario;
}

interface ModalCadastroProps {
    aberto: boolean;
    onAbertoAlterado: (aberto: boolean) => void;
    item?: (Partial<EntidadeFormData> & { id?: number }) | null;
    onSucesso?: () => void;
}

export function ModalCadastroEntidade({
    aberto,
    onAbertoAlterado,
    item = null,
    onSucesso,
}: ModalCadastroProps) {
    const isEdit = Boolean(item?.id);

    const { data, setData, post, put, processing, errors, clearErrors, reset, validate } = useForm<EntidadeFormData>({
        nome: item?.nome ?? '',
        email: item?.email ?? '',
        cargo_id: item?.cargo_id ?? '',
        departamento_id: item?.departamento_id ?? '',
        status: item?.status ?? StatusUsuario.Ativo,
    });

    const statusOptions = [
        { value: StatusUsuario.Ativo, label: 'Ativo' },
        { value: StatusUsuario.Inativo, label: 'Inativo' },
    ];

    useEffect(() => {
        if (item) {
            setData({
                nome: item.nome ?? '',
                email: item.email ?? '',
                cargo_id: item.cargo_id ?? '',
                departamento_id: item.departamento_id ?? '',
                status: item.status ?? StatusUsuario.Ativo,
            });
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
    }, [item, aberto]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const url = isEdit && item?.id ? `/usuarios/${item.id}` : '/usuarios';

        (isEdit ? put : post)(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEdit ? 'Registro atualizado com sucesso!' : 'Registro cadastrado com sucesso!');
                onSucesso?.();
                onAbertoAlterado(false);
                reset();
            },
            onError: (errs) => {
                const primeiraMensagem = Object.values(errs)[0];
                toast.error(primeiraMensagem || 'Ocorreu um erro ao salvar o registro.');
            },
        });
    };

    return (
        <Dialog open={aberto} onOpenChange={onAbertoAlterado}>
            <DialogContent className="fixed inset-0 top-0 left-0 z-50 flex h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border/60 sm:shadow-2xl">
                {/* Cabeçalho */}
                <DialogHeader className="border-b border-border/40 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UserCheck className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-foreground sm:text-lg">
                                {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Preencha os campos para salvar o registro no sistema.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Corpo do formulário com scroll */}
                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Nome */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="nome" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    NOME COMPLETO <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) => {
                                        setData('nome', e.target.value);
                                        if (errors.nome) clearErrors('nome');
                                    }}
                                    onBlur={() => validate('nome')}
                                    error={Boolean(errors.nome)}
                                    placeholder="Ex: Carlos Silva"
                                />
                                <InputError message={errors.nome} />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="email" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    E-MAIL CORPORATIVO <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => {
                                        setData('email', e.target.value);
                                        if (errors.email) clearErrors('email');
                                    }}
                                    onBlur={() => validate('email')}
                                    error={Boolean(errors.email)}
                                    placeholder="carlos@empresa.com.br"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="status" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    STATUS <span className="text-destructive">*</span>
                                </Label>
                                <Combobox
                                    options={statusOptions}
                                    value={data.status}
                                    onChange={(val) => {
                                        setData('status', val as StatusUsuario);
                                        if (errors.status) clearErrors('status');
                                        validate('status');
                                    }}
                                    placeholder="Selecione o status..."
                                    searchPlaceholder="Buscar status..."
                                    error={Boolean(errors.status)}
                                />
                                <InputError message={errors.status} />
                            </div>
                        </div>
                    </div>

                    {/* Rodapé fixo */}
                    <DialogFooter className="flex w-full shrink-0 flex-row items-center justify-between border-t border-border/40 bg-muted/20 p-4 sm:justify-between">
                        <DialogClose asChild>
                            <Botao type="button" variant="outline" icon={<ArrowLeft className="size-4" />}>
                                Voltar
                            </Botao>
                        </DialogClose>
                        <Botao type="submit" loading={processing} icon={<Check className="size-4" strokeWidth={2.5} />}>
                            {isEdit ? 'Salvar Alterações' : 'Salvar'}
                        </Botao>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
```

---

## 💻 Skeleton 2: Página Completa Contínua (`> 8` Campos)

```tsx
import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ChevronLeft, Check, Layers, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { Botao } from '@/components/botao';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';

interface PatrimonioItem {
    id?: number;
    codigo: string;
    nome: string;
    categoria_id: string;
    departamento_id: string;
    numero_serie: string;
    data_aquisicao: string;
    valor_aquisicao: string;
    localizacao_fisica: string;
    observacoes: string;
}

interface PageCadastroProps {
    item?: PatrimonioItem | null;
}

export default function CadastrarPatrimonioPage({ item = null }: PageCadastroProps) {
    const isEdit = Boolean(item?.id);

    const { data, setData, post, put, processing, errors, clearErrors, validate } = useForm({
        codigo: item?.codigo ?? '',
        nome: item?.nome ?? '',
        categoria_id: item?.categoria_id ?? '',
        departamento_id: item?.departamento_id ?? '',
        numero_serie: item?.numero_serie ?? '',
        data_aquisicao: item?.data_aquisicao ?? '',
        valor_aquisicao: item?.valor_aquisicao ?? '',
        localizacao_fisica: item?.localizacao_fisica ?? '',
        observacoes: item?.observacoes ?? '',
    });

    const handleVoltar = () => {
        router.visit('/patrimonios');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const url = isEdit && item?.id ? `/patrimonios/${item.id}` : '/patrimonios';

        (isEdit ? put : post)(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEdit ? 'Patrimônio atualizado com sucesso!' : 'Patrimônio cadastrado com sucesso!');
            },
            onError: (errs) => {
                const primeiraMensagem = Object.values(errs)[0];
                toast.error(primeiraMensagem || 'Ocorreu um erro ao salvar o patrimônio.');
            },
        });
    };

    return (
        <div className="space-y-6">
            <Head title={isEdit ? 'Editar Patrimônio' : 'Cadastrar Patrimônio'} />

            {/* Cabeçalho Limpo (Sem botão voltar no título) */}
            <PageHeader
                title={isEdit ? 'Editar Patrimônio' : 'Cadastrar Novo Patrimônio'}
                description="Preencha as informações detalhadas no formulário contínuo abaixo."
                showAction={false}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Principal: Contém APENAS os campos */}
                <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs md:p-6 md:rounded-3xl space-y-8">
                    {/* Seção 1 */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            <div className="flex size-6 items-center justify-center rounded-lg border border-border/40 bg-muted/60 text-muted-foreground">
                                <Layers className="size-3.5" />
                            </div>
                            <span>IDENTIFICAÇÃO PRINCIPAL</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="codigo" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    CÓDIGO DO PATRIMÔNIO <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="codigo"
                                    value={data.codigo}
                                    onChange={(e) => {
                                        setData('codigo', e.target.value);
                                        if (errors.codigo) clearErrors('codigo');
                                    }}
                                />
                                {errors.codigo && <p className="text-xs font-medium text-destructive mt-1">{errors.codigo}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="nome" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    NOME DO PATRIMÔNIO <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) => {
                                        setData('nome', e.target.value);
                                        if (errors.nome) clearErrors('nome');
                                    }}
                                />
                                {errors.nome && <p className="text-xs font-medium text-destructive mt-1">{errors.nome}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Seção 2 */}
                    <div className="space-y-4 border-t border-border/40 pt-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            <div className="flex size-6 items-center justify-center rounded-lg border border-border/40 bg-muted/60 text-muted-foreground">
                                <FileText className="size-3.5" />
                            </div>
                            <span>LOCALIZAÇÃO E AQUISIÇÃO</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="localizacao_fisica" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    LOCALIZAÇÃO FÍSICA
                                </Label>
                                <Input
                                    id="localizacao_fisica"
                                    value={data.localizacao_fisica}
                                    onChange={(e) => {
                                        setData('localizacao_fisica', e.target.value);
                                        if (errors.localizacao_fisica) clearErrors('localizacao_fisica');
                                    }}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="numero_serie" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    NÚMERO DE SÉRIE
                                </Label>
                                <Input
                                    id="numero_serie"
                                    value={data.numero_serie}
                                    onChange={(e) => {
                                        setData('numero_serie', e.target.value);
                                        if (errors.numero_serie) clearErrors('numero_serie');
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rodapé Sticky FORA DO CARD (SEM borda divisória) */}
                <div className="sticky bottom-0 z-20 -mx-4 -mb-4 flex items-center justify-between bg-background/95 p-4 backdrop-blur-sm md:-mx-6 md:-mb-6 md:px-6">
                    <Botao type="button" variant="outline" icon={<ChevronLeft className="size-4" />} onClick={handleVoltar}>
                        Voltar
                    </Botao>
                    <Botao type="submit" loading={processing} icon={<Check className="size-4" strokeWidth={2.5} />}>
                        Salvar
                    </Botao>
                </div>
            </form>
        </div>
    );
}

CadastrarPatrimonioPage.layout = {
    breadcrumbs: [
        { title: 'Patrimônios', href: '/patrimonios' },
        { title: 'Cadastrar', href: '' },
    ],
};
```
