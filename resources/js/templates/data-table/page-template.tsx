import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Search, MoreHorizontal, Download, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusTabs, type StatusTabItem } from '@/components/ui/status-tabs';
import { Combobox } from '@/components/ui/combobox';
import { Paginacao } from '@/components/paginacao';

import { TableTemplate } from './table-template';
import type { ItemTemplateExemplo, StatusConfigItem } from './types';

// Mock de demonstração inicial para teste imediato out-of-the-box
const MOCK_ITEMS_INICIAIS: ItemTemplateExemplo[] = [
    {
        id: '1',
        codigo: '0101',
        titulo: 'Servidor Dell PowerEdge R740',
        subtitulo: 'Série: SN-883492 · NF: 44012',
        categoria: 'Infraestrutura',
        departamento: 'TI - Datacenter',
        referencia: 'Rack B-03',
        status: 'ativo',
        atualizadoEm: '2026-03-10',
    },
    {
        id: '2',
        codigo: '0102',
        titulo: 'Estação de Trabalho Precision 3660',
        subtitulo: 'Série: SN-119283 · NF: 44015',
        categoria: 'Informática',
        departamento: 'Engenharia de Software',
        referencia: 'Mesa 14',
        status: 'ativo',
        atualizadoEm: '2026-03-11',
    },
    {
        id: '3',
        codigo: '0103',
        titulo: 'Switch Cisco Catalyst 2960',
        subtitulo: 'Série: SN-772910 · NF: 43900',
        categoria: 'Redes',
        departamento: 'TI - Infra',
        referencia: 'Rack Switch A',
        status: 'pendente',
        atualizadoEm: '2026-03-08',
    },
    {
        id: '4',
        codigo: '0104',
        titulo: 'Nobreak APC Smart-UPS 3000VA',
        subtitulo: 'Série: SN-338291 · NF: 43210',
        categoria: 'Elétrica',
        departamento: 'TI - Datacenter',
        referencia: 'Rack Energia 01',
        status: 'inativo',
        atualizadoEm: '2026-02-15',
    },
    {
        id: '5',
        codigo: '0105',
        titulo: 'Monitor UltraSharp 27" 4K',
        subtitulo: 'Série: SN-994821 · NF: 44100',
        categoria: 'Informática',
        departamento: 'Design & UX',
        referencia: 'Bancada 02',
        status: 'ativo',
        atualizadoEm: '2026-03-12',
    },
];

const STATUS_CONFIG_MAP: Record<string, StatusConfigItem> = {
    ativo: {
        label: 'ATIVO',
        className: 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-200',
    },
    pendente: {
        label: 'PENDENTE',
        className: 'bg-warning/15 text-amber-900 border-warning/30 dark:text-amber-200',
    },
    inativo: {
        label: 'INATIVO',
        className:
            'bg-destructive/15 text-destructive border-destructive/30 dark:bg-destructive/15 dark:text-destructive dark:border-destructive/30',
    },
};

export function DataTablePageTemplate() {
    // 1. Estados de Dados e Paginação
    const [itens] = useState<ItemTemplateExemplo[]>(MOCK_ITEMS_INICIAIS);
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [abaStatus, setAbaStatus] = useState<string>('todos');
    const [ordemCampo, setOrdemCampo] = useState<string | undefined>('codigo');
    const [ordemDirecao, setOrdemDirecao] = useState<'asc' | 'desc'>('asc');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(10);

    // 2. Filtros de Combobox adicionais (Grid dinâmico)
    const [filtroCategoria, setFiltroCategoria] = useState<string | undefined>();
    const [filtroDepartamento, setFiltroDepartamento] = useState<string | undefined>();

    // 3. Opções dos Filtros Grid
    const opcoesCategorias = useMemo(() => {
        const unicas = Array.from(new Set(itens.map((i) => i.categoria).filter(Boolean)));
        return unicas.map((cat) => ({ value: cat, label: cat }));
    }, [itens]);

    const opcoesDepartamentos = useMemo(() => {
        const unicas = Array.from(new Set(itens.map((i) => i.departamento).filter(Boolean)));
        return unicas.map((dep) => ({ value: dep, label: dep }));
    }, [itens]);

    // 4. Configuração das StatusTabs com contagens dinâmicas
    const statusTabs = useMemo<StatusTabItem[]>(() => {
        return [
            { id: 'todos', label: 'Todos', count: itens.length, color: 'primary' },
            { id: 'ativo', label: 'Ativos', count: itens.filter((i) => i.status === 'ativo').length, color: 'success' },
            {
                id: 'pendente',
                label: 'Pendentes',
                count: itens.filter((i) => i.status === 'pendente').length,
                color: 'warning',
            },
            {
                id: 'inativo',
                label: 'Inativos',
                count: itens.filter((i) => i.status === 'inativo').length,
                color: 'destructive',
            },
        ];
    }, [itens]);

    // 5. Filtragem e Ordenação
    const itensFiltrados = useMemo(() => {
        return itens
            .filter((item) => {
                // Filtro por Aba Status
                if (abaStatus !== 'todos' && item.status !== abaStatus) {
                    return false;
                }
                // Filtro por Categoria
                if (filtroCategoria && item.categoria !== filtroCategoria) {
                    return false;
                }
                // Filtro por Departamento
                if (filtroDepartamento && item.departamento !== filtroDepartamento) {
                    return false;
                }
                // Busca Textual
                if (termoPesquisa.trim()) {
                    const termo = termoPesquisa.toLowerCase();
                    const matchCodigo = item.codigo.toLowerCase().includes(termo);
                    const matchTitulo = item.titulo.toLowerCase().includes(termo);
                    const matchSubtitulo = item.subtitulo?.toLowerCase().includes(termo);
                    return matchCodigo || matchTitulo || matchSubtitulo;
                }
                return true;
            })
            .toSorted((a, b) => {
                if (!ordemCampo) return 0;
                const valA = (a as unknown as Record<string, unknown>)[ordemCampo] ?? '';
                const valB = (b as unknown as Record<string, unknown>)[ordemCampo] ?? '';
                const res = String(valA).localeCompare(String(valB), undefined, { numeric: true });
                return ordemDirecao === 'asc' ? res : -res;
            });
    }, [itens, abaStatus, filtroCategoria, filtroDepartamento, termoPesquisa, ordemCampo, ordemDirecao]);

    // 6. Paginação dos dados
    const totalItens = itensFiltrados.length;
    const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
    const inicioIndice = (paginaAtual - 1) * itensPorPagina;
    const fimIndice = Math.min(inicioIndice + itensPorPagina, totalItens);
    const itensPaginados = itensFiltrados.slice(inicioIndice, fimIndice);

    // 7. Ações
    const handleAlternarOrdenacao = (campo: string, direcao: 'asc' | 'desc') => {
        setOrdemCampo(campo);
        setOrdemDirecao(direcao);
    };

    const exportarTabela = () => {
        toast.success('Relatório CSV gerado com sucesso!');
    };

    const handleEditar = (item: ItemTemplateExemplo) => {
        toast.info(`Editar item: ${item.codigo} - ${item.titulo}`);
        // Exemplo para navegação Inertia:
        // router.visit(route('exemplo.edit', item.id));
    };

    const handleNovoRegistro = () => {
        toast.info('Abrir formulário para novo registro');
        // Exemplo para navegação Inertia:
        // router.visit(route('exemplo.create'));
    };

    return (
        <>
            <Head title="Gerenciamento de Registros" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* 1. CABEÇALHO DA PÁGINA PADRONIZADO COM AÇÃO */}
                <PageHeader
                    title="Gerenciamento de Registros"
                    description="Visualize, filtre e gerencie os registros do sistema com listagem responsiva e exportação."
                    action={{
                        label: 'Novo Registro',
                        onClick: handleNovoRegistro,
                    }}
                />

                {/* 2. CARD CONTAINER PRINCIPAL UNIFICADO COM STATUS TABS */}
                <div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs md:rounded-3xl">
                    {/* TABS DE STATUS COM CONTADORES (INTEGRADO NO TOPO DO CARD) */}
                    <StatusTabs
                        tabs={statusTabs}
                        activeTab={abaStatus}
                        onChange={(tab) => {
                            setAbaStatus(tab);
                            setPaginaAtual(1);
                        }}
                    />

                    {/* BARRA DE FILTROS: Busca + Opções (3 Pontinhos) + Grid de Filtros */}
                    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
                        {/* Linha Superior: Busca Textual + Menu de Opções */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <Input
                                    type="search"
                                    placeholder="Filtrar por código, título ou detalhes..."
                                    value={termoPesquisa}
                                    onChange={(e) => {
                                        setTermoPesquisa(e.target.value);
                                        setPaginaAtual(1);
                                    }}
                                    leftIcon={<Search className="size-4 text-muted-foreground" />}
                                    className="h-10 rounded-xl border-input bg-background text-sm shadow-2xs dark:bg-card"
                                />
                            </div>

                            {/* Menu de Opções (3 Pontinhos com Apenas "Exportar") */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 shrink-0 cursor-pointer rounded-xl border-0 text-muted-foreground shadow-none hover:bg-muted/60 hover:text-foreground"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Opções</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuLabel className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                                        OPÇÕES
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={exportarTabela}
                                        className="cursor-pointer gap-2.5 py-2 text-xs font-semibold"
                                    >
                                        <Download className="size-4 text-muted-foreground" />
                                        Exportar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Linha Inferior: Grid de Filtros Responsivo que ocupa todo o espaço */}
                        {/* Regra de Grid:
                            - 1 filtro: grid-cols-1
                            - 2 filtros: grid-cols-1 sm:grid-cols-2
                            - 3 filtros: grid-cols-1 sm:grid-cols-3
                            - 4 filtros: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
                        */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Combobox
                                className="w-full"
                                items={opcoesCategorias}
                                value={filtroCategoria}
                                onValueChange={(val) => {
                                    setFiltroCategoria(val);
                                    setPaginaAtual(1);
                                }}
                                placeholder="Categoria"
                                searchPlaceholder="Buscar categoria..."
                                clearable
                                onClear={() => {
                                    setFiltroCategoria(undefined);
                                    setPaginaAtual(1);
                                }}
                            />

                            <Combobox
                                className="w-full"
                                items={opcoesDepartamentos}
                                value={filtroDepartamento}
                                onValueChange={(val) => {
                                    setFiltroDepartamento(val);
                                    setPaginaAtual(1);
                                }}
                                placeholder="Departamento"
                                searchPlaceholder="Buscar departamento..."
                                clearable
                                onClear={() => {
                                    setFiltroDepartamento(undefined);
                                    setPaginaAtual(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* CORPO: Tabela / Mobile Cards ou Estado Vazio */}
                    {totalItens > 0 ? (
                        <>
                            <TableTemplate
                                items={itensPaginados}
                                ordemCampo={ordemCampo}
                                ordemDirecao={ordemDirecao}
                                onAlternarOrdenacao={handleAlternarOrdenacao}
                                onEditar={handleEditar}
                                statusConfigMap={STATUS_CONFIG_MAP}
                            />

                            {/* PAGINAÇÃO */}
                            <Paginacao
                                paginaAtual={paginaAtual}
                                totalPaginas={totalPaginas}
                                onPaginaAlterada={setPaginaAtual}
                                mostrarDe={totalItens > 0 ? inicioIndice + 1 : 0}
                                mostrarA={fimIndice}
                                mostrarTotal={totalItens}
                                tipoEntidade="registros"
                                itensPorPagina={itensPorPagina}
                                onItensPorPaginaAlterado={(itens) => {
                                    setItensPorPagina(itens);
                                    setPaginaAtual(1);
                                }}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground/70">
                                <FolderOpen className="size-7" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Nenhum registro encontrado</h3>
                            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
                                Não encontramos dados para os critérios selecionados. Tente ajustar os termos de
                                pesquisa ou filtros.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/**
 * ⚠️ REGRA CRÍTICA DE ARQUITETURA DE LAYOUT (INERTIA V3):
 * NUNCA envolva o retorno JSX da página com <AppLayout> ou <AppSidebarLayout>.
 * O arquivo `resources/js/app.tsx` JÁ aplica o `AppLayout` como layout padrão global para todas as páginas.
 * Envolver a página manualmente com <AppLayout> causa DUPLICAÇÃO DE CABEÇALHOS (sidebar toggle,
 * breadcrumbs e seletor de tema sol/lua duplicados).
 *
 * Para configurar as migalhas de pão (breadcrumbs), defina a propriedade estática `.layout` abaixo:
 */
DataTablePageTemplate.layout = {
    breadcrumbs: [
        {
            title: 'Título da Página',
            href: '/sua-rota',
        },
    ],
};

export default DataTablePageTemplate;
