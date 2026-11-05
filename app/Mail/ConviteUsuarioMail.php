<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class ConviteUsuarioMail extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public function __construct(public User $usuario)
    {
        $this->afterCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Convite para acesso ao sistema - CapyEstoque',
        );
    }

    public function content(): Content
    {
        $url = route('convite.aceitar', ['token' => (string) $this->usuario->convite_token]);

        return new Content(
            markdown: 'emails.convite-usuario',
            with: [
                'usuario' => $this->usuario,
                'url' => $url,
            ],
        );
    }
}
