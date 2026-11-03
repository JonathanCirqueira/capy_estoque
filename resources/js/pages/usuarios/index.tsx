import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, MoreHorizontal, Download, FolderOpen, RefreshCw, ShieldAlert, MoreVertical } from 'lucide-react';
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
import { UserRole } from '@/types/enums/user-role';
import { UserStatus } from '@/types/enums/user-status';
import type { UsuariosPageProps, UsuarioListItem } from './types';

export default function UsuariosIndex({
    usuarios = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0, links: [] },
    contadores = { todos: 0, ativo: 0, pendente: 0, inativo: 0 },
    filtros = { busca: '', role: 'todos', aba: 'todos', ordem_campo: 'name', ordem_direcao: 'asc', per_page: 10 },
}: UsuariosPageProps) {
    const [modalConvidarAberto, setModalConvidarAberto] = useState(false);
    const [usuarioInativar, setUsuarioInativar] = useState<UsuarioListItem | null>(null);
    const [usuarioReenviar, setUsuarioReenviar] = useState<UsuarioListItem | null>(null);

    const [termoBusca, setTermoBusca] = useState(filtros?.busca ?? '');
    const [roleFiltro, setRoleFiltro] = useState(filtros?.role ?? 'todos');
    const [abaStatus, setAbaStatus] = useState(filtros?.aba ?? 'todos');

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
        router.get(
            '/usuarios',
            {
                ...filtros,
                ...novosFiltros,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
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

                    {/* Filtros em linha única alinhados horizontalmente */}
                    <div className="p-4 md:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={termoBusca}
                                    onChange={(e) => {
                                        setTermoBusca(e.target.value);
                                        handleFiltrar({ busca: e.target.value });
                                    }}
                                    placeholder="Filtrar por nome ou e-mail..."
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-56">
                                <Combobox
                                    value={roleFiltro}
                                    onChange={(val) => {
                                        setRoleFiltro(val);
                                        handleFiltrar({ role: val });
                                    }}
                                    options={[
                                        { value: 'todos', label: 'Todos os Perfis' },
                                        { value: UserRole.Admin, label: 'Administrador' },
                                        { value: UserRole.UsuarioPadrao, label: 'Usuário Padrão' },
                                    ]}
                                    placeholder="Perfil de Acesso"
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 cursor-pointer text-muted-foreground"
                                    >
                                        <MoreHorizontal className="size-4" />
                                        <span className="sr-only">Opções da Listagem</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => window.open('/usuarios/exportar', '_blank')}
                                        className="cursor-pointer"
                                    >
                                        <Download className="mr-2 size-4" /> Exportar CSV
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                                        <TableCell colSpan={6} className="h-48 text-center">
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
                                                                className="cursor-pointer text-destructive focus:text-destructive"
                                                            >
                                                                <ShieldAlert className="mr-2 size-4" /> Inativar Usuário
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
                    <div className="flex flex-col gap-3 border-t border-border/40 p-4 md:hidden">
                        {usuarios.data.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3.5"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                    <p className="mt-1 text-xs text-foreground/80">
                                        {user.role === UserRole.Admin ? 'Administrador' : 'Usuário Padrão'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
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
                                </div>
                            </div>
                        ))}
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

            {/* Modal de Inativação Segura (#ce3765) */}
            <ConfirmationModal
                open={Boolean(usuarioInativar)}
                onOpenChange={(aberto) => !aberto && setUsuarioInativar(null)}
                title="Inativar Usuário"
                description={`Tem certeza que deseja inativar o acesso de ${usuarioInativar?.name}? O colaborador não conseguirá mais entrar no sistema.`}
                confirmText="Inativar"
                cancelText="Voltar"
                variant="destructive"
                onConfirm={() => {
                    if (usuarioInativar) {
                        router.put(
                            `/usuarios/${usuarioInativar.id}/inativar`,
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => setUsuarioInativar(null),
                            },
                        );
                    }
                }}
            />

            {/* Modal de Confirmação para Reenvio de Convite por E-mail */}
            <ConfirmationModal
                open={Boolean(usuarioReenviar)}
                onOpenChange={(aberto) => !aberto && setUsuarioReenviar(null)}
                title="Reenviar Convite"
                description={`Deseja reenviar o e-mail de convite com link de definição de senha para ${usuarioReenviar?.email}?`}
                confirmText="Enviar E-mail"
                cancelText="Voltar"
                variant="default"
                onConfirm={() => {
                    if (usuarioReenviar) {
                        router.post(
                            `/usuarios/${usuarioReenviar.id}/reenviar-convite`,
                            {},
                            {
                                preserveScroll: true,
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
