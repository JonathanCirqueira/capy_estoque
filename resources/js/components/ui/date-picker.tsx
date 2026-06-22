'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    error?: boolean;
}

const MESES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

const DIAS_SEMANA = [
    { id: 'dom', label: 'D' },
    { id: 'seg', label: 'S' },
    { id: 'ter', label: 'T' },
    { id: 'qua', label: 'Q' },
    { id: 'qui', label: 'Q' },
    { id: 'sex', label: 'S' },
    { id: 'sab', label: 'S' },
];

const formatarDataExibicao = (dataStr?: string, fallback = 'Selecione a data...') => {
    if (!dataStr) return fallback;
    const partes = dataStr.split('-');
    if (partes.length !== 3) return dataStr;
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
};

export function DatePicker({
    value,
    onValueChange,
    placeholder = 'Selecione a data...',
    disabled = false,
    className,
    error = false,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    // Configurar o mês e ano visualizados no calendário
    const [viewMonth, setViewMonth] = React.useState(() => {
        const data = value ? new Date(value + 'T12:00:00') : new Date();
        return isNaN(data.getTime()) ? new Date().getMonth() : data.getMonth();
    });

    const [viewYear, setViewYear] = React.useState(() => {
        const data = value ? new Date(value + 'T12:00:00') : new Date();
        return isNaN(data.getTime()) ? new Date().getFullYear() : data.getFullYear();
    });

    const handlePopoverOpenChange = (isOpen: boolean) => {
        if (disabled) return;
        setOpen(isOpen);
        if (isOpen) {
            const data = value ? new Date(value + 'T12:00:00') : new Date();
            if (!isNaN(data.getTime())) {
                setViewMonth(data.getMonth());
                setViewYear(data.getFullYear());
            }
        }
    };

    const dias = React.useMemo(() => {
        const primeiroDiaSemana = new Date(viewYear, viewMonth, 1).getDay();
        const totalDiasMes = new Date(viewYear, viewMonth + 1, 0).getDate();
        const totalDiasMesAnterior = new Date(viewYear, viewMonth, 0).getDate();

        const listaDias = [];

        // Dias do mês anterior
        for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
            const dia = totalDiasMesAnterior - i;
            const m = viewMonth === 0 ? 11 : viewMonth - 1;
            const a = viewMonth === 0 ? viewYear - 1 : viewYear;
            listaDias.push({
                dia,
                mes: m,
                ano: a,
                isCurrentMonth: false,
                dateString: `${a}-${String(m + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
            });
        }

        // Dias do mês atual
        for (let i = 1; i <= totalDiasMes; i++) {
            listaDias.push({
                dia: i,
                mes: viewMonth,
                ano: viewYear,
                isCurrentMonth: true,
                dateString: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
            });
        }

        // Dias do próximo mês para completar 42 células
        const totalCelulas = 42;
        const celulasRestantes = totalCelulas - listaDias.length;
        for (let i = 1; i <= celulasRestantes; i++) {
            const m = viewMonth === 11 ? 0 : viewMonth + 1;
            const a = viewMonth === 11 ? viewYear + 1 : viewYear;
            listaDias.push({
                dia: i,
                mes: m,
                ano: a,
                isCurrentMonth: false,
                dateString: `${a}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
            });
        }

        return listaDias;
    }, [viewMonth, viewYear]);

    const handleSelectDate = (dateString: string) => {
        onValueChange(dateString);
        setOpen(false);
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((v) => v - 1);
        } else {
            setViewMonth((v) => v - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((v) => v + 1);
        } else {
            setViewMonth((v) => v + 1);
        }
    };

    return (
        <Popover open={open} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        'h-11 w-full justify-start rounded-xl border border-border/85 bg-background px-4 py-3 text-left text-sm font-normal focus:outline-none focus:ring-[3px] focus:ring-primary/15 focus:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:border-primary data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-primary/15 disabled:bg-muted/30 disabled:opacity-75 transition-all',
                        !disabled && 'cursor-pointer',
                        error && 'border-destructive focus:ring-destructive/20 focus-visible:ring-destructive/20',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-80" />
                    <span className="truncate">{formatarDataExibicao(value, placeholder)}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto rounded-2xl border border-border/40 bg-popover/95 backdrop-blur-md p-3 shadow-xl animate-none"
                align="start"
            >
                {/* Header com os botões de navegação */}
                <div className="flex items-center justify-between pb-3">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-border/40 text-foreground transition-all hover:bg-muted"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <div className="text-xs font-bold text-foreground">
                        {MESES[viewMonth]} {viewYear}
                    </div>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-border/40 text-foreground transition-all hover:bg-muted"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>

                {/* Grid dos dias da semana */}
                <div className="mb-1.5 grid grid-cols-7 gap-1 border-b border-border/20 pb-1.5 text-center text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {DIAS_SEMANA.map((dia) => (
                        <div key={dia.id} className="flex size-8 items-center justify-center">
                            {dia.label}
                        </div>
                    ))}
                </div>

                {/* Grid dos dias do mês */}
                <div className="grid grid-cols-7 gap-1">
                    {dias.map((d) => {
                        const isSelected = d.dateString === value;
                        const isHoje = d.dateString === new Date().toISOString().split('T')[0];
                        return (
                            <button
                                key={d.dateString}
                                type="button"
                                onClick={() => handleSelectDate(d.dateString)}
                                className={cn(
                                    'flex size-8 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition-all focus-visible:outline-hidden',
                                    d.isCurrentMonth
                                        ? 'text-foreground hover:bg-muted'
                                        : 'text-muted-foreground/40 hover:bg-muted/50',
                                    isSelected &&
                                        'bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:text-primary-foreground',
                                    isHoje &&
                                        !isSelected &&
                                        'border border-primary/30 font-bold text-primary',
                                )}
                            >
                                {d.dia}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
