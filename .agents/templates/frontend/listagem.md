# Blueprint Canônico: Frontend - Tabela de Listagem e Gestão Tabular

> **Objetivo:** Padrão arquitetural agnóstico para páginas e tabelas de listagem completas em React 19 + Inertia.js v3 + Tailwind CSS v4 com Wayfinder, StatusTabs, busca, filtros dinâmicos, ordenação e cards mobile.

---

## ⚡ Regras de Ouro Inegociáveis

1. **PageHeader Canônico Obrigatório:** Importar exclusivamente de `@/components/page-header`. Proibido recriar divs manuais para título e botão de ação.
2. **Card Container Único:** Toda a listagem fica dentro de um container com classes:
   `bg-card border-border/50 rounded-2xl md:rounded-3xl overflow-hidden`
3. **StatusTabs no Topo:** Encostado nas bordas superiores do card, sem padding externo, com fundo sutil (`bg-muted/30 border-b border-border/50`).
4. **Filtros e Ações:**
   - **Linha 1:** Input de busca com ícone `Search` (`flex-1`) + Dropdown de 3 pontinhos (`MoreHorizontal`, botão ghost) com opção de "Exportar CSV".
   - **Linha 2:** Grid dinâmico de `Combobox` responsivo (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`).
5. **Responsividade Agnóstica (Desktop Table + Mobile Cards):**
   - **Desktop (`hidden md:block`):** Tabela estruturada com `SortableTableHead` (UPPERCASE), badges de status e botão de edição.
   - **Mobile (`md:hidden`):** Cards individuais limpos, sem ícones inventados de domínio, exibindo título, subtítulo, badge e ação.
6. **Zero Strings Mágicas:** Enums de status e filtros espelhados em TypeScript (`resources/js/types/` ou `resources/js/pages/[modulo]/types.ts`).
7. **Formatação Exclusiva na UI:** Máscaras, datas formatadas (`Intl.DateTimeFormat`) e moeda (`R$ 0,00`) são aplicadas no frontend, nunca no backend.

---

## 📐 Anatomia Visual da Tela

```
[ 1. PageHeader: Título + Descrição + Botão Novo Registro (fora do card)                 ]
[ 2. Card Container (bg-card border-border/50 rounded-2xl md:rounded-3xl overflow-hidden): ]
  ├── Topo: StatusTabs (bg-muted/30 border-b border-border/50, sem padding externo)
  └── Área Interna de Conteúdo (p-4 md:p-6 space-y-4):
      ├── Linha 1: Input Busca (flex-1) + Botão 3 Pontinhos "Exportar CSV" (ghost)
      ├── Linha 2: Grid Dinâmico de Filtros (Comboboxes em grid responsivo)
      ├── Tabela Desktop (md:block): Cabeçalhos Ordenáveis + Status Badge + Ações
      ├── Cards Mobile (md:hidden): Cards limpos com título, badge e botão de ação
      ├── Empty State: Ícone FolderOpen + Mensagem contextual quando lista for vazia
      └── Paginação: Componente <Paginacao> integrado aos metadados do Laravel
```

---

## 🧩 Esqueleto Canônico de Implementação

### 1. Tipos e Interfaces (`types.ts`)

```typescript
export interface ItemListagem {
    id: number;
    codigo: string;
    titulo: string;
    subtitulo?: string;
    status: StatusItem;
    categoria_id: number;
    categoria?: { id: number; nome: string };
    created_at: string;
}

export enum StatusItem {
    Ativo = 'ATIVO',
    Pendente = 'PENDENTE',
    Inativo = 'INATIVO',
}

export interface ListagemPageProps {
    itens: {
        data: ItemListagem[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    contadores: {
        todos: number;
        ativos: number;
        pendentes: number;
        inativos: number;
    };
    filtros: {
        termo?: string;
        aba?: string;
        categoria_id?: string;
        ordem_campo?: string;
        ordem_direcao?: 'asc' | 'desc';
    };
}
```

---

### 2. Componente de Página Principal (`index.tsx`)

```tsx
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, MoreHorizontal, Download, FolderOpen, Plus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusTabs, type StatusTabItem } from '@/components/ui/status-tabs';
import { Combobox } from '@/components/ui/combobox';
import { Paginacao } from '@/components/paginacao';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import { Badge } from '@/components/ui/badge';
import type { ListagemPageProps, ItemListagem } from './types';

export default function ListagemPage({ itens, contadores, filtros }: ListagemPageProps) {
    const [busca, setBusca] = useState(filtros.termo || '');
    const [abaAtiva, setAbaAtiva] = useState(filtros.aba || 'todos');

    // Abas dinâmicas com contadores vindos do backend
    const abas: StatusTabItem[] = [
        { label: 'Todos', value: 'todos', count: contadores.todos },
        { label: 'Ativos', value: 'ativos', count: contadores.ativos, badgeVariant: 'success' },
        { label: 'Pendentes', value: 'pendentes', count: contadores.pendentes, badgeVariant: 'warning' },
        { label: 'Inativos', value: 'inativos', count: contadores.inativos, badgeVariant: 'destructive' },
    ];

    // Atualização reativa de filtros usando o router do Inertia
    const aplicarFiltro = (novosFiltros: Record<string, unknown>) => {
        router.get(
            window.location.pathname,
            { ...filtros, ...novosFiltros },
            { preserveState: true, replace: true }
        );
    };

    return (
        <div className="space-y-6">
            <Head title="Gestão de Itens" />

            {/* 1. PageHeader fora do card */}
            <PageHeader
                title="Itens do Sistema"
                description="Gerencie os registros, aplique filtros rápidos e exporte relatórios."
                action={{
                    label: 'Novo Item',
                    icon: Plus,
                    onClick: () => router.visit('/itens/cadastrar'),
                }}
            />

            {/* 2. Container Card Único */}
            <div className="bg-card border border-border/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-xs">
                {/* StatusTabs colado nas bordas superiores */}
                <div className="bg-muted/30 border-b border-border/50">
                    <StatusTabs
                        items={abas}
                        value={abaAtiva}
                        onValueChange={(val) => {
                            setAbaAtiva(val);
                            aplicarFiltro({ aba: val, page: 1 });
                        }}
                    />
                </div>

                {/* Área de Conteúdo Interno */}
                <div className="p-4 md:p-6 space-y-4">
                    {/* Linha 1: Busca + 3 Pontinhos */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por código, nome ou descrição..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && aplicarFiltro({ termo: busca, page: 1 })}
                                className="pl-9 h-10 rounded-xl"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-10 rounded-xl">
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open('/itens/exportar')}>
                                    <Download className="mr-2 size-4" /> Exportar CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Tabela Desktop (md:block) */}
                    <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/40 border-b border-border/50">
                                <tr>
                                    <th className="p-3 text-xs font-semibold text-muted-foreground uppercase">CÓDIGO</th>
                                    <th className="p-3 text-xs font-semibold text-muted-foreground uppercase">TÍTULO</th>
                                    <th className="p-3 text-xs font-semibold text-muted-foreground uppercase">STATUS</th>
                                    <th className="p-3 text-xs font-semibold text-muted-foreground uppercase text-right">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {itens.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-3 text-sm font-mono font-medium">{item.codigo}</td>
                                        <td className="p-3 text-sm font-medium">{item.titulo}</td>
                                        <td className="p-3 text-sm">
                                            <Badge variant={item.status === 'ATIVO' ? 'default' : 'secondary'}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-right">
                                            <Button variant="ghost" size="sm" onClick={() => router.visit(`/itens/${item.id}/editar`)}>
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cards Mobile (md:hidden) */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {itens.data.map((item) => (
                            <div key={item.id} className="p-4 rounded-xl border border-border/50 bg-background space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-muted-foreground">{item.codigo}</span>
                                    <Badge variant="outline">{item.status}</Badge>
                                </div>
                                <h4 className="text-sm font-semibold">{item.titulo}</h4>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => router.visit(`/itens/${item.id}/editar`)}>
                                    Editar
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {itens.data.length === 0 && (
                        <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                            <FolderOpen className="size-10 text-muted-foreground/60" />
                            <p className="text-sm text-muted-foreground">Nenhum registro encontrado para os filtros selecionados.</p>
                        </div>
                    )}

                    {/* Paginação */}
                    <Paginacao meta={itens} onPageChange={(page) => aplicarFiltro({ page })} />
                </div>
            </div>
        </div>
    );
}
```
