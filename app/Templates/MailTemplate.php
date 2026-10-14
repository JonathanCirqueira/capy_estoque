<?php

declare(strict_types=1);

namespace App\Templates;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

/**
 * ==============================================================================
 * TEMPLATE CANÔNICO DE ENVIO DE E-MAIL TRANSACIONAL COM FILA (MAILABLE + BLADE)
 * ==============================================================================
 *
 * Este arquivo serve como blueprint canônico para envio de e-mails assíncronos no Starter Kit.
 *
 * Características e Boas Práticas Obrigatórias:
 * 1. Processamento Assíncrono (`implements ShouldQueue`):
 *    - Todo e-mail transacional deve ser enviado via fila de mensageria (Redis / Database).
 * 2. Prevenção de Race Conditions (`$this->afterCommit()`):
 *    - Garante que a mensagem só entre na fila APÓS o commit bem-sucedido da transação no banco.
 * 3. Resiliência de Conexão SMTP:
 *    - `$tries = 5` e `$backoff = [5, 10, 20]` para tolerância a falhas temporárias do provedor de e-mail.
 * 4. Ações Rápidas Seguras (1-Click Actions):
 *    - Utilização de URLs temporárias assinadas (`URL::temporarySignedRoute`) permitindo aprovação
 *      ou recusa com token criptográfico de expiração sem exigir autenticação prévia imediata.
 * 5. Tipagem e Configurações Modernas do Laravel 11/12/13:
 *    - Uso de `Envelope` e `Content` com `config()->string('app.name')`.
 *
 * ------------------------------------------------------------------------------
 * INSTRUÇÕES DE ARQUIVOS:
 * ------------------------------------------------------------------------------
 * - Mailable: `app/Mail/[NomeDoFluxo]Mail.php`
 * - Template Blade: `resources/views/emails/[nome-do-fluxo].blade.php` (veja modelo no final deste arquivo)
 * ==============================================================================
 */

/**
 * CLASSE CANÔNICA DE MAILABLE TRANSACIONAL COM FILA
 */
final class MailTemplate extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    /**
     * Número máximo de tentativas de entrega da mensagem na fila.
     */
    public int $tries = 5;

    /**
     * Tempo de espera progressivo em segundos entre tentativas de reenvio em caso de falha de conexão SMTP.
     *
     * @var array<int, int>
     */
    public array $backoff = [5, 10, 20];

    /**
     * Construtor com injeção tipada de dados e trava de commit da transação.
     *
     * @param  object  $destinatario  Usuário destinatário da mensagem (ex: User $destinatario)
     * @param  object|null  $registro  Registro/Entidade associada ao e-mail (ex: [Entidade] $registro)
     * @param  array<string, mixed>  $dadosExtras  Parâmetros adicionais (ex: senha temporária, observações)
     */
    public function __construct(
        public readonly object $destinatario,
        public readonly ?object $registro = null,
        public readonly array $dadosExtras = [],
    ) {
        // OBRIGATÓRIO: Impede o envio do e-mail caso a transação de banco ainda não tenha comitado
        $this->afterCommit();
    }

    /**
     * Define o envelope do e-mail (assunto, remetente, tags, etc).
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: sprintf(
                '[Notificação / Assunto do E-mail] - %s',
                config()->string('app.name', 'Starter Kit')
            ),
        );
    }

    /**
     * Define o conteúdo visual (template Blade Markdown) e as variáveis passadas à view.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.[nome-do-fluxo]',
            with: [
                'destinatario' => $this->destinatario,
                'registro' => $this->registro,
                'dadosExtras' => $this->dadosExtras,

                // Cenário A: Link simples autenticado (ex: botão para tela de login ou listagem)
                'urlAcesso' => route('login'),

                // Cenário B: Links assinados de 1-Click (ex: Aprovação / Recusa rápida por e-mail)
                // 'urlAprovar' => $this->gerarLinkAssinado('[entidades].resposta.aprovar'),
                // 'urlRecusar' => $this->gerarLinkAssinado('[entidades].resposta.recusar'),
            ],
        );
    }

    /**
     * Gera URL temporária assinada com HMAC seguro para ações rápidas de 1-clique.
     *
     * @param  string  $nomeRota  Nome da rota registrada com middleware 'signed'
     * @param  array<string, mixed>  $parametrosExtras  Parâmetros adicionais da rota
     * @param  int  $diasValidade  Dias de expiração do link assinado
     */
    protected function gerarLinkAssinado(
        string $nomeRota,
        array $parametrosExtras = [],
        int $diasValidade = 7
    ): string {
        $parametros = array_merge([
            // 'registro' => $this->registro?->id,
            // 'destinatario' => $this->destinatario->id,
        ], $parametrosExtras);

        return URL::temporarySignedRoute(
            $nomeRota,
            now()->addDays($diasValidade),
            $parametros
        );
    }
}

/*
|--------------------------------------------------------------------------
| BLUEPRINTS DE TEMPLATES BLADE MARKDOWN COMPANHEIROS
|--------------------------------------------------------------------------
|
| Salve estes modelos na pasta: resources/views/emails/[nome-do-fluxo].blade.php
|
|==========================================================================
| MODELO 1: Convite / Boas-vindas / Notificação com Botão Único
|==========================================================================
|
| <x-mail::message>
| # Olá, {{ $destinatario->nome_completo ?? $destinatario->name }}!
|
| Você foi cadastrado na plataforma **{{ config('app.name') }}**. Abaixo estão as suas credenciais de acesso:
|
| <x-mail::panel>
| **E-mail:** {{ $destinatario->email }}
| @if(! empty($dadosExtras['senha']))
| **Senha Temporária:** `{{ $dadosExtras['senha'] }}`
| @endif
| </x-mail::panel>
|
| Por questões de segurança, recomendamos alterar a sua senha no seu primeiro acesso.
|
| <x-mail::button :url="$urlAcesso" color="primary">
| Acessar Plataforma
| </x-mail::button>
|
| Atenciosamente,
| **Equipe {{ config('app.name') }}**
| </x-mail::message>
|
|
|==========================================================================
| MODELO 2: Ação Rápida Transacional (Aprovação / Recusa de 1-Clique)
|==========================================================================
|
| <x-mail::message>
| # Olá, {{ $destinatario->nome_completo ?? $destinatario->name }}!
|
| Uma nova solicitação de **[Ação / Processo]** requer a sua avaliação na plataforma **{{ config('app.name') }}**.
|
| ### Detalhes do Registro:
| - **Identificador:** #{{ $registro->id ?? 'N/A' }}
| - **Título / Descrição:** {{ $registro->nome ?? $registro->titulo ?? 'Não informado' }}
| - **Data da Solicitação:** {{ now()->format('d/m/Y H:i') }}
|
| Você pode aprovar ou reprovar esta solicitação diretamente através dos botões seguros abaixo (válidos por 7 dias):
|
| <table class="action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
|   <tr>
|     <td align="center">
|       <table border="0" cellpadding="0" cellspacing="0" role="presentation">
|         <tr>
|           <td style="padding: 0 8px;" align="center">
|             <a href="{{ $urlRecusar }}" class="button button-error" style="width: 150px; text-align: center; box-sizing: border-box;" target="_blank" rel="noopener">Recusar</a>
|           </td>
|           <td style="padding: 0 8px;" align="center">
|             <a href="{{ $urlAprovar }}" class="button button-success" style="width: 150px; text-align: center; box-sizing: border-box;" target="_blank" rel="noopener">Aprovar</a>
|           </td>
|         </tr>
|       </table>
|     </td>
|   </tr>
| </table>
|
| Se os botões não funcionarem, acesse diretamente através do sistema: [{{ $urlAcesso }}]({{ $urlAcesso }})
|
| Atenciosamente,
| **Equipe {{ config('app.name') }}**
| </x-mail::message>
|--------------------------------------------------------------------------
*/
