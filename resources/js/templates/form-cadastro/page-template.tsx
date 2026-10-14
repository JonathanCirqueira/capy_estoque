import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ChevronLeft, Check, Layers, Receipt, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { Botao } from '@/components/botao';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Skeleton } from '@/components/ui/skeleton';
import type { ExemploCadastroComplexo, PageCadastroProps } from './types';

// Mock de opções iniciais para selects da página
const OPCOES_CATEGORIAS_MOCK = [
    { value: '1', label: 'Equipamentos de Informática' },
    { value: '2', label: 'Infraestrutura de Rede' },
    { value: '3', label: 'Mobiliário Corporativo' },
    { value: '4', label: 'Veículos e Maquinários' },
];

const OPCOES_DEPARTAMENTOS_MOCK = [
    { value: '1', label: 'Tecnologia da Informação' },
    { value: '2', label: 'Engenharia de Operações' },
    { value: '3', label: 'Administrativo / Diretoria' },
    { value: '4', label: 'Logística e Almoxarifado' },
];

const OPCOES_RESPONSAVEIS_MOCK = [
    { value: '1', label: 'Carlos Alberto Silva' },
    { value: '2', label: 'Mariana Duarte Souza' },
    { value: '3', label: 'Roberto Mendes Costa' },
];

const OPCOES_CENTROS_CUSTO_MOCK = [
    { value: '1', label: 'CC-1010 - Matriz São Paulo' },
    { value: '2', label: 'CC-1020 - Centro de Distribuição Cajamar' },
    { value: '3', label: 'CC-2010 - TI Corporativa' },
];

/**
 * =============================================================================
 * TEMPLATE CANÔNICO: CADASTRO EM PÁGINA COMPLETA (> 8 CAMPOS)
 * =============================================================================
 * Ideal para formulários com mais de 8 campos em página dedicada.
 *
 * Características Canônicas:
 * 1. Formulário contínuo unificado em uma única tela (sem divisão por etapas/stepper).
 * 2. Organização visual limpa em seções temáticas com badges e rótulos 10px uppercase.
 * 3. PageHeader com título e descrição limpos (sem botão duplicado no título; navegação pelo rodapé).
 * 4. Rodapé Sticky (`sticky bottom-0`) com botões Voltar (à esquerda) e Salvar/Enviar (à direita).
 * 5. Integração com Inertia v3 sem duplicação de layout global.
 */
export function PageCadastroTemplate({
    id = null,
    mode = 'create',
    item = null,
}: PageCadastroProps<ExemploCadastroComplexo>) {
    const isEdit = mode === 'edit' || Boolean(id || item?.id);
    const isView = mode === 'view';

    const [isLoadingOptions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Inertia useForm gerenciando todos os campos
    const { data, setData, processing, errors, setError, clearErrors } = useForm<ExemploCadastroComplexo>({
        codigo: item?.codigo || '',
        nome: item?.nome || '',
        categoria_id: item?.categoria_id || '',
        departamento_id: item?.departamento_id || '',
        responsavel_id: item?.responsavel_id || '',
        status: item?.status || 'ativo',
        numero_serie: item?.numero_serie || '',
        numero_nota_fiscal: item?.numero_nota_fiscal || '',
        data_aquisicao: item?.data_aquisicao || '',
        valor_aquisicao: item?.valor_aquisicao || '',
        centro_custo_id: item?.centro_custo_id || '',
        fornecedor_id: item?.fornecedor_id || '',
        localizacao_fisica: item?.localizacao_fisica || '',
        garantia_meses: item?.garantia_meses || '',
        observacoes: item?.observacoes || '',
        anexo_documento: null,
    });

    // Validação completa dos campos do formulário
    const validarCampos = (): boolean => {
        clearErrors();
        let valido = true;

        if (!data.codigo.trim()) {
            setError('codigo', 'O código do patrimônio é obrigatório.');
            valido = false;
        }
        if (!data.nome.trim()) {
            setError('nome', 'A descrição / nome do bem é obrigatória.');
            valido = false;
        }
        if (!data.categoria_id) {
            setError('categoria_id', 'Selecione uma categoria.');
            valido = false;
        }
        if (!data.departamento_id) {
            setError('departamento_id', 'Selecione o departamento.');
            valido = false;
        }
        if (!data.responsavel_id) {
            setError('responsavel_id', 'Selecione o colaborador responsável.');
            valido = false;
        }
        if (!data.numero_nota_fiscal?.trim()) {
            setError('numero_nota_fiscal', 'Informe o número da nota fiscal.');
            valido = false;
        }
        if (!data.data_aquisicao) {
            setError('data_aquisicao', 'Informe a data de aquisição.');
            valido = false;
        }
        if (!data.centro_custo_id) {
            setError('centro_custo_id', 'Selecione o centro de custo.');
            valido = false;
        }

        return valido;
    };

    const handleVoltar = () => {
        router.visit('/patrimonios');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isView) return;

        if (!validarCampos()) {
            toast.error('Preencha os campos obrigatórios corretamente.');
            return;
        }

        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success(isEdit ? 'Cadastro atualizado com sucesso!' : 'Novo bem cadastrado com sucesso!');
            router.visit('/patrimonios');
        }, 800);
    };

    const titulos = {
        view: 'Visualizar Bem Patrimonial',
        edit: 'Editar Bem Patrimonial',
        create: 'Cadastrar Novo Patrimônio',
    };

    const descricoes = {
        view: 'Consulte os dados técnicos, fiscais e documentais cadastrados.',
        edit: 'Atualize as informações cadastrais e fiscais do registro selecionado.',
        create: 'Preencha as informações detalhadas no formulário abaixo.',
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={titulos[mode]} />

            {/* 1. CABEÇALHO DA PÁGINA (Sem botão no título conforme regra; controle pelo rodapé) */}
            <PageHeader title={titulos[mode]} description={descricoes[mode]} showAction={false} />

            {/* 2. FORMULÁRIO ÚNICO CONTÍNUO */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col space-y-6">
                {/* CARD PRINCIPAL COM OS CAMPOS */}
                <div className="space-y-8 rounded-2xl border border-border/50 bg-card p-4 shadow-xs md:rounded-3xl md:p-6">
                    {isLoadingOptions ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Skeleton className="h-10 w-full rounded-xl" />
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* SEÇÃO 1: DADOS PRINCIPAIS */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    <div className="flex size-6 items-center justify-center rounded-lg border border-border/40 bg-muted/60 text-muted-foreground">
                                        <Layers className="size-3.5" />
                                    </div>
                                    <span>DADOS PRINCIPAIS & IDENTIFICAÇÃO</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="page_codigo"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            CÓDIGO PATRIMONIAL <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="page_codigo"
                                            disabled={isView || isSaving}
                                            placeholder="Ex: PAT-00109"
                                            value={data.codigo}
                                            onChange={(e) => {
                                                setData('codigo', e.target.value);
                                                if (errors.codigo) clearErrors('codigo');
                                            }}
                                            className="h-10 rounded-xl"
                                        />
                                        {errors.codigo && <p className="text-xs text-destructive">{errors.codigo}</p>}
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label
                                            htmlFor="page_nome"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            DESCRIÇÃO DO BEM <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="page_nome"
                                            disabled={isView || isSaving}
                                            placeholder="Ex: Notebook Dell Latitude 5420 i7 16GB"
                                            value={data.nome}
                                            onChange={(e) => {
                                                setData('nome', e.target.value);
                                                if (errors.nome) clearErrors('nome');
                                            }}
                                            className="h-10 rounded-xl"
                                        />
                                        {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            CATEGORIA <span className="text-destructive">*</span>
                                        </Label>
                                        <Combobox
                                            options={OPCOES_CATEGORIAS_MOCK}
                                            value={data.categoria_id}
                                            onValueChange={(val) => {
                                                setData('categoria_id', val || '');
                                                if (errors.categoria_id) clearErrors('categoria_id');
                                            }}
                                            placeholder="Selecione a categoria..."
                                            disabled={isView || isSaving}
                                            className="h-10 rounded-xl"
                                        />
                                        {errors.categoria_id && (
                                            <p className="text-xs text-destructive">{errors.categoria_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            DEPARTAMENTO <span className="text-destructive">*</span>
                                        </Label>
                                        <Combobox
                                            options={OPCOES_DEPARTAMENTOS_MOCK}
                                            value={data.departamento_id}
                                            onValueChange={(val) => {
                                                setData('departamento_id', val || '');
                                                if (errors.departamento_id) clearErrors('departamento_id');
                                            }}
                                            placeholder="Selecione o departamento..."
                                            disabled={isView || isSaving}
                                            className="h-10 rounded-xl"
                                        />
                                        {errors.departamento_id && (
                                            <p className="text-xs text-destructive">{errors.departamento_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            COLABORADOR RESPONSÁVEL <span className="text-destructive">*</span>
                                        </Label>
                                        <Combobox
                                            options={OPCOES_RESPONSAVEIS_MOCK}
                                            value={data.responsavel_id}
                                            onValueChange={(val) => {
                                                setData('responsavel_id', val || '');
                                                if (errors.responsavel_id) clearErrors('responsavel_id');
                                            }}
                                            placeholder="Selecione o responsável..."
                                            disabled={isView || isSaving}
                                            className="h-10 rounded-xl"
                                        />
                                        {errors.responsavel_id && (
                                            <p className="text-xs text-destructive">{errors.responsavel_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SEÇÃO 2: ESPECIFICAÇÕES FISCAIS & TÉCNICAS */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    <div className="flex size-6 items-center justify-center rounded-lg border border-border/40 bg-muted/60 text-muted-foreground">
                                        <Receipt className="size-3.5" />
                                    </div>
                                    <span>ESPECIFICAÇÕES FISCAIS & TÉCNICAS</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="page_nf"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            NÚMERO DA NOTA FISCAL <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="page_nf"
                                            disabled={isView || isSaving}
                                            placeholder="Ex: NF-e 044192"
                                            value={data.numero_nota_fiscal}
                                            onChange={(e) => {
                                                setData('numero_nota_fiscal', e.target.value);
                                                if (errors.numero_nota_fiscal) clearErrors('numero_nota_fiscal');
                                            }}
                                            className="h-10 rounded-xl"
                                        />
                                        {errors.numero_nota_fiscal && (
                                            <p className="text-xs text-destructive">{errors.numero_nota_fiscal}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="page_serie"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            NÚMERO DE SÉRIE
                                        </Label>
                                        <Input
                                            id="page_serie"
                                            disabled={isView || isSaving}
                                            placeholder="Ex: SN-8839210-BR"
                                            value={data.numero_serie}
                                            onChange={(e) => setData('numero_serie', e.target.value)}
                                            className="h-10 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="page_data_aq"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            DATA DE AQUISIÇÃO <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="page_data_aq"
                                            type="date"
                                            disabled={isView || isSaving}
                                            value={data.data_aquisicao}
                                            onChange={(e) => {
                                                setData('data_aquisicao', e.target.value);
                                                if (errors.data_aquisicao) clearErrors('data_aquisicao');
                                            }}
                                            className="h-10 rounded-xl"
                                        />
                                        {errors.data_aquisicao && (
                                            <p className="text-xs text-destructive">{errors.data_aquisicao}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="page_valor"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            VALOR DE AQUISIÇÃO (R$) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="page_valor"
                                            type="number"
                                            step="0.01"
                                            disabled={isView || isSaving}
                                            placeholder="0,00"
                                            value={data.valor_aquisicao}
                                            onChange={(e) => {
                                                setData('valor_aquisicao', e.target.value);
                                                if (errors.valor_aquisicao) clearErrors('valor_aquisicao');
                                            }}
                                            className="h-10 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            CENTRO DE CUSTO <span className="text-destructive">*</span>
                                        </Label>
                                        <Combobox
                                            options={OPCOES_CENTROS_CUSTO_MOCK}
                                            value={data.centro_custo_id}
                                            onValueChange={(val) => {
                                                setData('centro_custo_id', val || '');
                                                if (errors.centro_custo_id) clearErrors('centro_custo_id');
                                            }}
                                            placeholder="Selecione o centro..."
                                            disabled={isView || isSaving}
                                            className="h-10 rounded-xl"
                                        />
                                        {errors.centro_custo_id && (
                                            <p className="text-xs text-destructive">{errors.centro_custo_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SEÇÃO 3: LOCALIZAÇÃO & ANEXOS */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    <div className="flex size-6 items-center justify-center rounded-lg border border-border/40 bg-muted/60 text-muted-foreground">
                                        <Paperclip className="size-3.5" />
                                    </div>
                                    <span>LOCALIZAÇÃO & DOCUMENTOS</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="page_loc"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            LOCALIZAÇÃO FÍSICA / SALA
                                        </Label>
                                        <Input
                                            id="page_loc"
                                            disabled={isView || isSaving}
                                            placeholder="Ex: Bloco B - Sala de TI 204"
                                            value={data.localizacao_fisica}
                                            onChange={(e) => setData('localizacao_fisica', e.target.value)}
                                            className="h-10 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="page_garantia"
                                            className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                        >
                                            GARANTIA (MESES)
                                        </Label>
                                        <Input
                                            id="page_garantia"
                                            type="number"
                                            disabled={isView || isSaving}
                                            placeholder="Ex: 12"
                                            value={data.garantia_meses}
                                            onChange={(e) => setData('garantia_meses', e.target.value)}
                                            className="h-10 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. RODAPÉ FIXO / STICKY FORA DO CARD (FINAL DA PÁGINA) */}
                <div className="sticky bottom-0 z-20 -mx-4 -mb-4 flex items-center justify-between bg-background/95 p-4 backdrop-blur-sm md:-mx-6 md:-mb-6 md:px-6">
                    <Botao
                        type="button"
                        variant="outline"
                        icon={<ChevronLeft className="size-4" />}
                        onClick={handleVoltar}
                        disabled={isSaving || processing}
                    >
                        Voltar
                    </Botao>

                    <Botao
                        type="submit"
                        loading={isSaving || processing}
                        icon={<Check className="size-4" strokeWidth={2.5} />}
                    >
                        Salvar
                    </Botao>
                </div>
            </form>
        </div>
    );
}

/**
 * Breadcrumbs sem duplicação de AppLayout conforme regras de Inertia v3
 */
PageCadastroTemplate.layout = {
    breadcrumbs: [
        {
            title: 'Gestão de Patrimônios',
            href: '/patrimonios',
        },
        {
            title: 'Cadastrar',
            href: '',
        },
    ],
};

export default PageCadastroTemplate;
