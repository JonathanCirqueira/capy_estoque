import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { FileUpload } from '@/components/ui/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const [comprovante, setComprovante] = useState<File | null>(null);
    const [fotoPatrimonio, setFotoPatrimonio] = useState<File | null>(null);

    return (
        <>
            <Head title="Dashboard - Teste de Upload" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <Card className="mx-auto w-full max-w-3xl rounded-2xl border border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">
                            Demonstração do Componente Padronizado: FileUpload
                        </CardTitle>
                        <CardDescription>
                            Componente de upload de arquivos e imagens com estilo em cartão horizontal, suporte a drag &
                            drop, limites e pré-visualização.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        {/* 1. Documento / Comprovante (Opcional) */}
                        <FileUpload
                            label="Documento / Comprovante (Opcional)"
                            placeholder="Clique para anexar um documento ou comprovante"
                            subtitulo="PDF, DOC ou DOCX até 10MB"
                            file={comprovante}
                            onChange={(file) => setComprovante(file)}
                            accept=".pdf,.doc,.docx,image/*"
                            type="file"
                            clearable
                        />

                        {/* 2. Imagem do Patrimônio (Opcional) */}
                        <FileUpload
                            label="Imagem do Patrimônio (Opcional)"
                            placeholder="Clique para anexar uma foto do patrimônio"
                            subtitulo="JPEG, JPG, PNG ou WEBP até 10MB"
                            file={fotoPatrimonio}
                            onChange={(file) => setFotoPatrimonio(file)}
                            accept="image/*"
                            type="image"
                            clearable
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
