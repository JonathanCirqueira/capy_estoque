<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\LogAcesso;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;

final readonly class RegistrarLogAcessoListener
{
    public function __construct(
        private Request $request,
    ) {}

    public function handle(Login $event): void
    {
        if ($event->user instanceof User) {
            $agora = now();

            $event->user->forceFill([
                'ultimo_login_em' => $agora,
            ])->saveQuietly();

            LogAcesso::query()->create([
                'user_id' => $event->user->id,
                'ip' => $this->request->ip(),
                'user_agent' => $this->request->userAgent(),
                'login_em' => $agora,
            ]);
        }
    }
}
