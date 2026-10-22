<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\LogAcesso;
use App\Models\User;

test('registra log de acesso e atualiza ultimo login ao autenticar com sucesso', function (): void {
    $user = User::factory()->create([
        'ultimo_login_em' => null,
    ]);

    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '192.168.1.100',
        'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ])->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user->refresh();

    expect($user->ultimo_login_em)->not->toBeNull()
        ->and(LogAcesso::query()->count())->toBe(1);

    $log = LogAcesso::query()->first();

    assert($log instanceof LogAcesso);

    $primeiroLog = $user->logsAcesso->first();
    assert($primeiroLog instanceof LogAcesso);

    expect($log->user_id)->toBe($user->id)
        ->and($log->ip)->toBe('192.168.1.100')
        ->and($log->user_agent)->toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
        ->and($log->login_em)->not->toBeNull()
        ->and($user->logsAcesso)->toHaveCount(1)
        ->and($primeiroLog->id)->toBe($log->id);
});

test('nao registra log de acesso nem altera data em tentativa de login com credenciais invalidas', function (): void {
    $user = User::factory()->create([
        'ultimo_login_em' => null,
    ]);

    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '192.168.1.100',
        'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ])->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'senha-incorreta',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');

    $user->refresh();

    expect($user->ultimo_login_em)->toBeNull()
        ->and(LogAcesso::query()->count())->toBe(0);
});
