<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Mail\ConviteUsuarioMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('admin pode convidar novo usuario com dados validos', function () {
    Mail::fake();

    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    $payload = [
        'name' => 'Novo Colaborador',
        'email' => 'novo.colaborador@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao->value,
        'empresa' => 'Capy Tech Ltda',
        'telefone' => '11999998888',
        'cpf_cnpj' => '529.982.247-25',
    ];

    $response = $this->actingAs($admin)->post(route('usuarios.convidar'), $payload);

    $response->assertSessionHas('success');
    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'name' => 'Novo Colaborador',
        'email' => 'novo.colaborador@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao->value,
        'status' => UserStatus::Pendente->value,
        'empresa' => 'Capy Tech Ltda',
        'telefone' => '11999998888',
        'cpf_cnpj' => '529.982.247-25',
    ]);

    Mail::assertQueued(ConviteUsuarioMail::class, function (ConviteUsuarioMail $mail) {
        return $mail->usuario->email === 'novo.colaborador@exemplo.com.br';
    });
});

test('admin pode convidar usuario sem campo empresa', function () {
    Mail::fake();

    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    $payload = [
        'name' => 'Sem Empresa',
        'email' => 'sem.empresa@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao->value,
        'telefone' => '(11) 98888-7777',
        'cpf_cnpj' => '042.846.591-97',
    ];

    $response = $this->actingAs($admin)->post(route('usuarios.convidar'), $payload);

    $response->assertSessionHas('success');
    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'email' => 'sem.empresa@exemplo.com.br',
        'empresa' => null,
    ]);
});

test('exige telefone e cpf_cnpj obrigatorios e validos ao convidar', function () {
    Mail::fake();

    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    $responseVazio = $this->actingAs($admin)->post(route('usuarios.convidar'), [
        'name' => 'Teste Invalido',
        'email' => 'invalido@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao->value,
    ]);

    $responseVazio->assertSessionHasErrors(['telefone', 'cpf_cnpj']);

    $responseFormatoInvalido = $this->actingAs($admin)->post(route('usuarios.convidar'), [
        'name' => 'Teste Formato Invalido',
        'email' => 'formato.invalido@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao->value,
        'telefone' => '1234',
        'cpf_cnpj' => '111.111.111-11',
    ]);

    $responseFormatoInvalido->assertSessionHasErrors(['telefone', 'cpf_cnpj']);
    Mail::assertNothingQueued();
});

test('nao permite convidar usuario com email duplicado', function () {
    Mail::fake();

    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    User::factory()->create([
        'email' => 'existente@exemplo.com.br',
    ]);

    $payload = [
        'name' => 'Outro Usuario',
        'email' => 'existente@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao->value,
        'telefone' => '11999998888',
        'cpf_cnpj' => '529.982.247-25',
    ];

    $response = $this->actingAs($admin)->post(route('usuarios.convidar'), $payload);

    $response->assertSessionHasErrors(['email']);
    Mail::assertNothingQueued();
});

test('usuario padrao nao pode convidar usuarios', function () {
    Mail::fake();

    $userPadrao = User::factory()->create([
        'role' => UserRole::UsuarioPadrao,
    ]);

    $payload = [
        'name' => 'Outro Usuario',
        'email' => 'outro@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao->value,
        'telefone' => '11999998888',
        'cpf_cnpj' => '529.982.247-25',
    ];

    $response = $this->actingAs($userPadrao)->post(route('usuarios.convidar'), $payload);

    $response->assertForbidden();
    Mail::assertNothingQueued();
});

test('admin pode atualizar dados de um usuario existente', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    $usuario = User::factory()->create([
        'name' => 'Nome Antigo',
        'email' => 'antigo@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao,
    ]);

    $payload = [
        'name' => 'Nome Atualizado',
        'email' => 'antigo@exemplo.com.br',
        'role' => UserRole::Admin->value,
        'empresa' => 'Nova Empresa S/A',
        'telefone' => '11988887777',
        'cpf_cnpj' => '042.846.591-97',
    ];

    $response = $this->actingAs($admin)->put(route('usuarios.update', $usuario), $payload);

    $response->assertSessionHas('success');
    $response->assertRedirect();

    $usuario->refresh();
    expect($usuario->name)->toBe('Nome Atualizado')
        ->and($usuario->role)->toBe(UserRole::Admin)
        ->and($usuario->empresa)->toBe('Nova Empresa S/A')
        ->and($usuario->telefone)->toBe('11988887777')
        ->and($usuario->cpf_cnpj)->toBe('042.846.591-97');
});

test('nao permite atualizar usuario com telefone ou cpf_cnpj invalidos', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    $usuario = User::factory()->create([
        'role' => UserRole::UsuarioPadrao,
    ]);

    $response = $this->actingAs($admin)->put(route('usuarios.update', $usuario), [
        'name' => 'Usuario Teste',
        'email' => $usuario->email,
        'role' => UserRole::UsuarioPadrao->value,
        'telefone' => '999',
        'cpf_cnpj' => '000.000.000-00',
    ]);

    $response->assertSessionHasErrors(['telefone', 'cpf_cnpj']);
});

test('admin pode inativar um usuario que nao seja ele mesmo', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    $usuario = User::factory()->create([
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Ativo,
    ]);

    $response = $this->actingAs($admin)->put(route('usuarios.inativar', $usuario));

    $response->assertSessionHas('success');
    $usuario->refresh();
    expect($usuario->status)->toBe(UserStatus::Inativo);
});

test('admin nao pode inativar a si mesmo', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
        'status' => UserStatus::Ativo,
    ]);

    $response = $this->actingAs($admin)->put(route('usuarios.inativar', $admin));

    $response->assertForbidden();
    $admin->refresh();
    expect($admin->status)->toBe(UserStatus::Ativo);
});

test('admin pode ativar um usuario inativo', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    $usuario = User::factory()->create([
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Inativo,
    ]);

    $response = $this->actingAs($admin)->put(route('usuarios.ativar', $usuario));

    $response->assertSessionHas('success');
    $usuario->refresh();
    expect($usuario->status)->toBe(UserStatus::Ativo);
});

test('admin pode reenviar convite para usuario com status pendente', function () {
    Mail::fake();

    $admin = User::factory()->create([
        'role' => UserRole::Admin,
    ]);

    $usuarioPendente = User::factory()->create([
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Pendente,
        'convite_token' => 'token_antigo',
        'convite_expira_em' => now()->subDay(),
    ]);

    $response = $this->actingAs($admin)->post(route('usuarios.reenviar-convite', $usuarioPendente));

    $response->assertSessionHas('success');

    $usuarioPendente->refresh();
    expect($usuarioPendente->convite_token)->not->toBe('token_antigo')
        ->and($usuarioPendente->convite_expira_em)->not->toBeNull()
        ->and($usuarioPendente->convite_expira_em?->isFuture())->toBeTrue();

    Mail::assertQueued(ConviteUsuarioMail::class, function (ConviteUsuarioMail $mail) use ($usuarioPendente) {
        return $mail->usuario->id === $usuarioPendente->id;
    });
});
