import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Search,
    MoreHorizontal,
    Download,
    FolderOpen,
    RefreshCw,
    ShieldAlert,
    ShieldCheck,
    MoreVertical,
    Pencil,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { StatusTabs, type StatusTabItem } from '@/components/ui/status-tabs';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Paginacao } from '@/components/paginacao';
import { ModalConvidarUsuario } from './components/modal-convidar-usuario';
import { ModalEditarUsuario } from './components/modal-editar-usuario';
import {
    inativar as inativarRoute,
    ativar as ativarRoute,
    reenviarConvite as reenviarConviteRoute,
    exportar as exportarRoute,
} from '@/routes/usuarios';
import { UserRole } from '@/types/enums/user-role';
import { UserStatus } from '@/types/enums/user-status';
import type { UsuariosPageProps, UsuarioListItem } from './types';

const formatarTelefoneExibicao = (valor?: string | null): string => {
    if (!valor) return '-';
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 11);
    if (apenasDigitos.length <= 10) {
        return apenasDigitos
            .replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
            .trim()
            .replace(/-$/, '');
    }
    return apenasDigitos
        .replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
        .trim()
        .replace(/-$/, '');
};

const formatarCpfCnpjExibicao = (valor?: string | null): string => {
    if (!valor) return '-';
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 14);
    if (apenasDigitos.length <= 11) {
        return apenasDigitos
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }
    return apenasDigitos
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
};

export default function UsuariosIndex({
    usuarios = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0, links: [] },
    contadores = { todos: 0, ativo: 0, pendente: 0, inativo: 0 },
    filtros = { busca: '', assinatura: 'todos', aba: 'todos', ordem_campo: 'name', ordem_direcao: 'asc', per_page: 10 },
}: UsuariosPageProps) {
    const [modalConvidarAberto, setModalConvidarAberto] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState<UsuarioListItem | null>(null);
    const [usuarioInativar, setUsuarioInativar] = useState<UsuarioListItem | null>(null);
    const [usuarioAtivar, setUsuarioAtivar] = useState<UsuarioListItem | null>(null);
    const [usuarioReenviar, setUsuarioReenviar] = useState<UsuarioListItem | null>(null);

    const [estaInativando, setEstaInativando] = useState(false);
    const [estaAtivando, setEstaAtivando] = useState(false);
    const [estaReenviando, setEstaReenviando] = useState(false);

    const [termoBusca, setTermoBusca] = useState(filtros?.busca ?? '');
    const [assinaturaFiltro, setAssinaturaFiltro] = useState(filtros?.assinatura ?? 'todos');
    const [abaStatus, setAbaStatus] = useState(filtros?.aba ?? 'todos');

    const debounceBuscaRef = React.useRef<NodeJS.Timeout | null>(null);

    const filtrosAtuaisRef = React.useRef({
        busca: termoBusca,
        assinatura: assinaturaFiltro,
        aba: abaStatus,
        ordem_campo: filtros.ordem_campo ?? 'name',
        ordem_direcao: filtros.ordem_direcao ?? 'asc',
        per_page: filtros.per_page ?? 10,
    });

    React.useEffect(() => {
        filtrosAtuaisRef.current = {
            busca: termoBusca,
            assinatura: assinaturaFiltro,
            aba: abaStatus,
            ordem_campo: filtros.ordem_campo ?? 'name',
            ordem_direcao: filtros.ordem_direcao ?? 'asc',
            per_page: filtros.per_page ?? 10,
        };
    }, [termoBusca, assinaturaFiltro, abaStatus, filtros]);

    React.useEffect(() => {
        setTermoBusca(filtros?.busca ?? '');
    }, [filtros?.busca]);

    React.useEffect(() => {
        setAssinaturaFiltro(filtros?.assinatura ?? 'todos');
    }, [filtros?.assinatura]);

    React.useEffect(() => {
        setAbaStatus(filtros?.aba ?? 'todos');
    }, [filtros?.aba]);

    React.useEffect(() => {
        return () => {
            if (debounceBuscaRef.current) {
                clearTimeout(debounceBuscaRef.current);
            }
        };
    }, []);

    const statusTabs: StatusTabItem[] = useMemo(
        () => [
            { id: 'todos', label: 'Todos', count: contadores.todos, color: 'primary' },
            { id: 'ativo', label: 'Ativos', count: contadores.ativo, color: 'success' },
            { id: 'pendente', label: 'Pendentes', count: contadores.pendente, color: 'warning' },
            { id: 'inativo', label: 'Inativos', count: contadores.inativo, color: 'destructive' },
        ],
        [contadores],
    );

    const handleFiltrar = (novosFiltros: Partial<typeof filtros>) => {
        const params = {
            ...filtrosAtuaisRef.current,
            page: 1,
            ...novosFiltros,
        };

        router.get('/usuarios', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleBuscaChange = (valor: string) => {
        setTermoBusca(valor);
        if (debounceBuscaRef.current) {
            clearTimeout(debounceBuscaRef.current);
        }
        debounceBuscaRef.current = setTimeout(() => {
            handleFiltrar({ busca: valor });
        }, 300);
    };

    const handleBuscaClear = () => {
        setTermoBusca('');
        if (debounceBuscaRef.current) {
            clearTimeout(debounceBuscaRef.current);
        }
        handleFiltrar({ busca: '' });
    };

    const handleSort = (coluna: string) => {
        const novaDirecao = filtros.ordem_campo === coluna && filtros.ordem_direcao === 'asc' ? 'desc' : 'asc';
        handleFiltrar({ ordem_campo: coluna, ordem_direcao: novaDirecao });
    };

    return (
        <>
            <Head title="Gestão de Usuários" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Gestão de Usuários"
                    description="Gerencie os usuários do sistema, configure perfis de acesso e convide novos membros."
                    action={{
                        label: 'Convidar Usuário',
                        onClick: () => setModalConvidarAberto(true),
                    }}
                />

                <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs md:rounded-3xl">
                    <StatusTabs
                        tabs={statusTabs}
                        activeTab={abaStatus}
                        onChange={(tab) => {
                            setAbaStatus(tab);
                            handleFiltrar({ aba: tab });
                        }}
                    />

                    {/* Barra de Filtros */}
                    <div className="p-4 md:p-6">
                        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                            <div className="order-1 min-w-0 flex-1">
                                <Input
                                    value={termoBusca}
                                    onChange={(e) => handleBuscaChange(e.target.value)}
                                    placeholder="Filtrar por nome ou e-mail..."
                                    leftIcon={<Search className="size-4 text-muted-foreground/60" />}
                                    clearable={Boolean(termoBusca)}
                                    onClear={handleBuscaClear}
                                />
                            </div>

                            <div className="order-2 shrink-0 sm:order-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer text-muted-foreground"
                                        >
                                            <MoreHorizontal className="size-4" />
                                            <span className="sr-only">Opções da Listagem</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                const query: Record<string, string> = {};
                                                if (termoBusca) query.busca = termoBusca;
                                                if (assinaturaFiltro && assinaturaFiltro !== 'todos')
                                                    query.assinatura = assinaturaFiltro;
                                                if (abaStatus && abaStatus !== 'todos') query.aba = abaStatus;
                                                window.open(exportarRoute.url({ query }), '_blank');
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Download className="mr-2 size-4" /> Exportar CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="order-3 w-full sm:order-2 sm:w-56">
                                <Combobox
                                    value={assinaturaFiltro}
                                    onChange={(val) => {
                                        const novaAssinatura = val || 'todos';
                                        setAssinaturaFiltro(novaAssinatura);
                                        handleFiltrar({ assinatura: novaAssinatura });
                                    }}
                                    options={[
                                        { value: 'todos', label: 'Todas as Assinaturas' },
                                        { value: 'ativa', label: 'Ativas' },
                                        { value: 'pendente', label: 'Pendentes' },
                                        { value: 'inativa', label: 'Inativas' },
                                    ]}
                                    placeholder="Status da Assinatura"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabela Desktop */}
                    <div className="hidden border-t border-border/40 md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <SortableTableHead
                                        label="NOME"
                                        coluna="name"
                                        colunaAtiva={filtros.ordem_campo}
                                        direcaoAtiva={filtros.ordem_direcao}
                                        onSort={handleSort}
                                    />
                                    <SortableTableHead
                                        label="E-MAIL"
                                        coluna="email"
                                        colunaAtiva={filtros.ordem_campo}
                                        direcaoAtiva={filtros.ordem_direcao}
                                        onSort={handleSort}
                                    />
                                    <SortableTableHead
                                        label="EMPRESA"
                                        coluna="empresa"
                                        colunaAtiva={filtros.ordem_campo}
                                        direcaoAtiva={filtros.ordem_direcao}
                                        onSort={handleSort}
                                    />
                                    <SortableTableHead
                                        label="PERFIL"
                                        coluna="role"
                                        colunaAtiva={filtros.ordem_campo}
                                        direcaoAtiva={filtros.ordem_direcao}
                                        onSort={handleSort}
                                    />
                                    <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        PLANO
                                    </TableHead>
                                    <SortableTableHead
                                        label="STATUS"
                                        coluna="status"
                                        colunaAtiva={filtros.ordem_campo}
                                        direcaoAtiva={filtros.ordem_direcao}
                                        onSort={handleSort}
                                    />
                                    <TableHead className="w-16 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        AÇÕES
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usuarios.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <FolderOpen className="size-8 stroke-1 text-muted-foreground/60" />
                                                <p className="text-sm">
                                                    Nenhum usuário encontrado com os filtros aplicados.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usuarios.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="text-sm font-normal text-foreground">
                                                {user.name}
                                            </TableCell>
                                            <TableCell className="text-sm font-normal text-foreground">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="text-sm font-normal text-foreground">
                                                {user.empresa ? user.empresa : '-'}
                                            </TableCell>
                                            <TableCell className="text-sm font-normal text-foreground">
                                                {user.role === UserRole.Admin ? 'Administrador' : 'Usuário Padrão'}
                                            </TableCell>
                                            <TableCell className="text-sm font-normal text-foreground">
                                                {user.plano ? `${user.plano.nome}` : 'Sem Plano'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.status === UserStatus.Ativo
                                                            ? 'success'
                                                            : user.status === UserStatus.Pendente
                                                              ? 'warning'
                                                              : 'destructive'
                                                    }
                                                >
                                                    {user.status === UserStatus.Ativo
                                                        ? 'ATIVO'
                                                        : user.status === UserStatus.Pendente
                                                          ? 'PENDENTE'
                                                          : 'INATIVO'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 cursor-pointer"
                                                        >
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => setUsuarioEditar(user)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 size-4" /> Editar Usuário
                                                        </DropdownMenuItem>
                                                        {user.status === UserStatus.Pendente && (
                                                            <DropdownMenuItem
                                                                onClick={() => setUsuarioReenviar(user)}
                                                                className="cursor-pointer"
                                                            >
                                                                <RefreshCw className="mr-2 size-4" /> Reenviar Convite
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === UserStatus.Ativo && (
                                                            <DropdownMenuItem
                                                                onClick={() => setUsuarioInativar(user)}
                                                                className="cursor-pointer text-destructive hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white data-highlighted:bg-destructive data-highlighted:text-white dark:hover:text-white dark:focus:text-white [&_svg]:text-destructive! hover:[&_svg]:text-white! focus:[&_svg]:text-white! data-highlighted:[&_svg]:text-white!"
                                                            >
                                                                <ShieldAlert className="mr-2 size-4" /> Inativar Usuário
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === UserStatus.Inativo && (
                                                            <DropdownMenuItem
                                                                onClick={() => setUsuarioAtivar(user)}
                                                                className="cursor-pointer text-emerald-600 hover:bg-success hover:text-success-foreground focus:bg-success focus:text-success-foreground data-highlighted:bg-success data-highlighted:text-success-foreground dark:text-emerald-400 dark:hover:text-white! dark:focus:text-white! dark:data-highlighted:text-white! [&_svg]:text-emerald-600! hover:[&_svg]:text-success-foreground! focus:[&_svg]:text-success-foreground! data-highlighted:[&_svg]:text-success-foreground! dark:[&_svg]:text-emerald-400! dark:hover:[&_svg]:text-white! dark:focus:[&_svg]:text-white! dark:data-highlighted:[&_svg]:text-white!"
                                                            >
                                                                <ShieldCheck className="mr-2 size-4" /> Ativar Usuário
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Cards Mobile */}
                    <div className="flex flex-col gap-3 px-4 pb-4 md:hidden">
                        {usuarios.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
                                <FolderOpen className="size-8 stroke-1 text-muted-foreground/60" />
                                <p className="text-sm">Nenhum usuário encontrado com os filtros aplicados.</p>
                            </div>
                        ) : (
                            usuarios.data.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-4 shadow-xs"
                                >
                                    {/* Topo do Card Mobile */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <Badge
                                                variant={
                                                    user.status === UserStatus.Ativo
                                                        ? 'success'
                                                        : user.status === UserStatus.Pendente
                                                          ? 'warning'
                                                          : 'destructive'
                                                }
                                            >
                                                {user.status === UserStatus.Ativo
                                                    ? 'ATIVO'
                                                    : user.status === UserStatus.Pendente
                                                      ? 'PENDENTE'
                                                      : 'INATIVO'}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 cursor-pointer"
                                                    >
                                                        <MoreVertical className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setUsuarioEditar(user)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Pencil className="mr-2 size-4" /> Editar Usuário
                                                    </DropdownMenuItem>
                                                    {user.status === UserStatus.Pendente && (
                                                        <DropdownMenuItem
                                                            onClick={() => setUsuarioReenviar(user)}
                                                            className="cursor-pointer"
                                                        >
                                                            <RefreshCw className="mr-2 size-4" /> Reenviar Convite
                                                        </DropdownMenuItem>
                                                    )}
                                                    {user.status === UserStatus.Ativo && (
                                                        <DropdownMenuItem
                                                            onClick={() => setUsuarioInativar(user)}
                                                            className="cursor-pointer text-destructive hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white data-highlighted:bg-destructive data-highlighted:text-white dark:hover:text-white dark:focus:text-white [&_svg]:text-destructive! hover:[&_svg]:text-white! focus:[&_svg]:text-white! data-highlighted:[&_svg]:text-white!"
                                                        >
                                                            <ShieldAlert className="mr-2 size-4" /> Inativar Usuário
                                                        </DropdownMenuItem>
                                                    )}
                                                    {user.status === UserStatus.Inativo && (
                                                        <DropdownMenuItem
                                                            onClick={() => setUsuarioAtivar(user)}
                                                            className="cursor-pointer text-emerald-600 hover:bg-success hover:text-success-foreground focus:bg-success focus:text-success-foreground data-highlighted:bg-success data-highlighted:text-success-foreground dark:text-emerald-400 dark:hover:text-white! dark:focus:text-white! dark:data-highlighted:text-white! [&_svg]:text-emerald-600! hover:[&_svg]:text-success-foreground! focus:[&_svg]:text-success-foreground! data-highlighted:[&_svg]:text-success-foreground! dark:[&_svg]:text-emerald-400! dark:hover:[&_svg]:text-white! dark:focus:[&_svg]:text-white! dark:data-highlighted:[&_svg]:text-white!"
                                                        >
                                                            <ShieldCheck className="mr-2 size-4" /> Ativar Usuário
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Metadados em Grid Neutro */}
                                    <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border/30 bg-muted/40 p-3">
                                        {user.empresa && (
                                            <div className="col-span-2">
                                                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Empresa
                                                </span>
                                                <p className="mt-0.5 truncate text-sm font-normal text-foreground">
                                                    {user.empresa}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                Perfil
                                            </span>
                                            <p className="mt-0.5 truncate text-sm font-normal text-foreground">
                                                {user.role === UserRole.Admin ? 'Administrador' : 'Usuário Padrão'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                Plano
                                            </span>
                                            <p className="mt-0.5 truncate text-sm font-normal text-foreground">
                                                {user.plano ? user.plano.nome : 'Sem Plano'}
                                            </p>
                                        </div>
                                        {user.telefone && (
                                            <div>
                                                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Telefone
                                                </span>
                                                <p className="mt-0.5 truncate text-sm font-normal text-foreground">
                                                    {formatarTelefoneExibicao(user.telefone)}
                                                </p>
                                            </div>
                                        )}
                                        {user.cpf_cnpj && (
                                            <div>
                                                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                    CPF / CNPJ
                                                </span>
                                                <p className="mt-0.5 truncate text-sm font-normal text-foreground">
                                                    {formatarCpfCnpjExibicao(user.cpf_cnpj)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Paginacao
                        paginaAtual={usuarios.current_page}
                        totalPaginas={usuarios.last_page}
                        aoMudarPagina={(p) => handleFiltrar({ page: p })}
                        mostrarDe={usuarios.from}
                        mostrarA={usuarios.to}
                        mostrarTotal={usuarios.total}
                        itensPorPagina={usuarios.per_page}
                        aoMudarItensPorPagina={(itens) => handleFiltrar({ per_page: itens, page: 1 })}
                    />
                </div>
            </div>

            <ModalConvidarUsuario aberto={modalConvidarAberto} onAbertoAlterado={setModalConvidarAberto} />

            <ModalEditarUsuario
                usuario={usuarioEditar}
                aberto={Boolean(usuarioEditar)}
                onAbertoAlterado={(aberto) => !aberto && setUsuarioEditar(null)}
            />

            {/* Modal de Inativação Segura (#ce3765) */}
            <ConfirmationModal
                open={Boolean(usuarioInativar)}
                onOpenChange={(aberto) => !aberto && !estaInativando && setUsuarioInativar(null)}
                title="Inativar Usuário"
                description={`Tem certeza que deseja inativar o acesso de ${usuarioInativar?.name}? O colaborador não conseguirá mais entrar no sistema.`}
                confirmText="Inativar"
                cancelText="Voltar"
                variant="destructive"
                isLoading={estaInativando}
                onConfirm={() => {
                    if (usuarioInativar) {
                        router.put(
                            inativarRoute.url(usuarioInativar.id),
                            {},
                            {
                                preserveScroll: true,
                                onStart: () => setEstaInativando(true),
                                onFinish: () => setEstaInativando(false),
                                onSuccess: () => setUsuarioInativar(null),
                            },
                        );
                    }
                }}
            />

            {/* Modal de Ativação Segura */}
            <ConfirmationModal
                open={Boolean(usuarioAtivar)}
                onOpenChange={(aberto) => !aberto && !estaAtivando && setUsuarioAtivar(null)}
                title="Ativar Usuário"
                description={`Tem certeza que deseja ativar o acesso de ${usuarioAtivar?.name}? O colaborador poderá acessar o sistema novamente.`}
                confirmText="Ativar"
                cancelText="Voltar"
                variant="success"
                isLoading={estaAtivando}
                onConfirm={() => {
                    if (usuarioAtivar) {
                        router.put(
                            ativarRoute.url(usuarioAtivar.id),
                            {},
                            {
                                preserveScroll: true,
                                onStart: () => setEstaAtivando(true),
                                onFinish: () => setEstaAtivando(false),
                                onSuccess: () => setUsuarioAtivar(null),
                            },
                        );
                    }
                }}
            />

            {/* Modal de Confirmação para Reenvio de Convite por E-mail */}
            <ConfirmationModal
                open={Boolean(usuarioReenviar)}
                onOpenChange={(aberto) => !aberto && !estaReenviando && setUsuarioReenviar(null)}
                title="Reenviar Convite"
                description={`Deseja reenviar o e-mail de convite com link de definição de senha para ${usuarioReenviar?.email}?`}
                confirmText="Enviar E-mail"
                cancelText="Voltar"
                variant="default"
                isLoading={estaReenviando}
                onConfirm={() => {
                    if (usuarioReenviar) {
                        router.post(
                            reenviarConviteRoute.url(usuarioReenviar.id),
                            {},
                            {
                                preserveScroll: true,
                                onStart: () => setEstaReenviando(true),
                                onFinish: () => setEstaReenviando(false),
                                onSuccess: () => setUsuarioReenviar(null),
                            },
                        );
                    }
                }}
            />
        </>
    );
}

UsuariosIndex.layout = {
    breadcrumbs: [{ title: 'Usuários', href: '/usuarios' }],
};
