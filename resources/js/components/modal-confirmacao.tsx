import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Botao } from './botao';

interface ModalConfirmacaoProps {
    aberto: boolean;
    onAbertoAlterado: (aberto: boolean) => void;
    titulo: React.ReactNode;
    descricao: React.ReactNode;
    conteudoResumo?: React.ReactNode;
    textoConfirmar?: string;
    textoCancelar?: string;
    onConfirmar: () => void;
    variantConfirmar?: 'default' | 'destructive' | 'outline' | 'secondary';
    desabilitado?: boolean;
}

export function ModalConfirmacao({
    aberto,
    onAbertoAlterado,
    titulo,
    descricao,
    conteudoResumo,
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Voltar',
    onConfirmar,
    variantConfirmar = 'destructive',
    desabilitado = false,
}: ModalConfirmacaoProps) {
    return (
        <Dialog open={aberto} onOpenChange={onAbertoAlterado}>
            <DialogContent className="p-4 sm:max-w-md sm:p-6">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
                        <AlertCircle className="size-5 text-destructive" />
                        {titulo}
                    </DialogTitle>
                    <DialogDescription className="text-xs">{descricao}</DialogDescription>
                </DialogHeader>

                {conteudoResumo && <div className="animate-in duration-200 fade-in-50">{conteudoResumo}</div>}

                <DialogFooter className="flex w-full flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
                    <DialogClose asChild>
                        <Botao
                            variant="outline"
                            className="w-full border border-border/80 bg-card text-foreground hover:bg-muted/80 sm:w-40 sm:flex-none sm:shrink-0"
                            disabled={desabilitado}
                        >
                            {textoCancelar}
                        </Botao>
                    </DialogClose>
                    <Botao
                        onClick={onConfirmar}
                        variant={variantConfirmar}
                        className="w-full sm:w-40 sm:flex-none sm:shrink-0"
                        disabled={desabilitado}
                    >
                        {textoConfirmar}
                    </Botao>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
