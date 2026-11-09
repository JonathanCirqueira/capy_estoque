<?php

declare(strict_types=1);

use App\Enums\AssinaturaStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('usuario autenticado como admin pode visualizar listagem de usuarios com contadores do banco', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
        'status' => UserStatus::Ativo,
    ]);

    User::factory()->create([
        'name' => 'Carlos Silva',
        'email' => 'carlos.silva@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Inativo,
    ]);

    User::factory()->create([
        'name' => 'Mariana Souza',
        'email' => 'mariana.souza@exemplo.com.br',
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Ativo,
    ]);

    $response = $this->actingAs($admin)->get(route('usuarios.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 3)
        ->where('contadores.todos', 3)
        ->where('contadores.ativo', 2)
        ->where('contadores.inativo', 1)
        ->where('contadores.pendente', 0)
    );
});

test('filtro de busca por nome ou email filtra usuarios no banco', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Chefe',
        'email' => 'admin@empresa.com.br',
        'role' => UserRole::Admin,
        'status' => UserStatus::Ativo,
    ]);

    User::factory()->create([
        'name' => 'Carlos Silveira',
        'email' => 'carlos@empresa.com.br',
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Ativo,
    ]);

    User::factory()->create([
        'name' => 'Beatriz Santos',
        'email' => 'beatriz@empresa.com.br',
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Ativo,
    ]);

    $response = $this->actingAs($admin)->get(route('usuarios.index', ['busca' => 'Carlos']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.name', 'Carlos Silveira')
    );
});

test('filtro de busca por empresa filtra usuarios no banco', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Chefe',
        'role' => UserRole::Admin,
        'status' => UserStatus::Ativo,
    ]);

    User::factory()->create([
        'name' => 'Carlos Silveira',
        'email' => 'carlos@outro.com.br',
        'empresa' => 'Capycorp Logistica',
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Ativo,
    ]);

    User::factory()->create([
        'name' => 'Beatriz Santos',
        'email' => 'beatriz@outro.com.br',
        'empresa' => 'Outra Empresa',
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Ativo,
    ]);

    $response = $this->actingAs($admin)->get(route('usuarios.index', ['busca' => 'Capycorp']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.name', 'Carlos Silveira')
        ->where('usuarios.data.0.empresa', 'Capycorp Logistica')
    );
});

test('filtro de assinatura filtra usuarios com status de assinatura ativo, pendente ou inativo', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Chefe',
        'role' => UserRole::Admin,
        'status' => UserStatus::Ativo,
        'assinatura_status' => AssinaturaStatus::Active,
    ]);

    User::factory()->create([
        'name' => 'Usuario Com Assinatura Atrasada',
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Ativo,
        'assinatura_status' => AssinaturaStatus::PastDue,
    ]);

    User::factory()->create([
        'name' => 'Usuario Cancelado',
        'role' => UserRole::UsuarioPadrao,
        'status' => UserStatus::Ativo,
        'assinatura_status' => AssinaturaStatus::Canceled,
    ]);

    $responseAtiva = $this->actingAs($admin)->get(route('usuarios.index', ['assinatura' => 'ativa']));
    $responseAtiva->assertOk();
    $responseAtiva->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.name', 'Admin Chefe')
    );

    $responsePendente = $this->actingAs($admin)->get(route('usuarios.index', ['assinatura' => 'pendente']));
    $responsePendente->assertOk();
    $responsePendente->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.name', 'Usuario Com Assinatura Atrasada')
    );

    $responseInativa = $this->actingAs($admin)->get(route('usuarios.index', ['assinatura' => 'inativa']));
    $responseInativa->assertOk();
    $responseInativa->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.name', 'Usuario Cancelado')
    );
});

test('filtro de aba de status filtra usuarios inativos ou ativos', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
        'status' => UserStatus::Ativo,
    ]);

    User::factory()->create([
        'name' => 'Usuario Desativado',
        'status' => UserStatus::Inativo,
    ]);

    $responseInativo = $this->actingAs($admin)->get(route('usuarios.index', ['aba' => 'inativos']));

    $responseInativo->assertOk();
    $responseInativo->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.name', 'Usuario Desativado')
    );
});

test('usuario autenticado como admin pode exportar listagem de usuarios em csv', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Export',
        'role' => UserRole::Admin,
    ]);

    $response = $this->actingAs($admin)->get(route('usuarios.exportar'));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('exportacao de usuarios respeita filtro de busca', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Gestor',
        'email' => 'gestor@empresa.com.br',
        'role' => UserRole::Admin,
    ]);

    User::factory()->create([
        'name' => 'Carlos Silveira',
        'email' => 'carlos@empresa.com.br',
    ]);

    User::factory()->create([
        'name' => 'Geisiane Gaspar',
        'email' => 'geisiane@empresa.com.br',
    ]);

    $response = $this->actingAs($admin)->get(route('usuarios.exportar', ['busca' => 'Carlos']));

    $response->assertOk();
    $content = $response->streamedContent();

    expect($content)->toContain('Carlos Silveira')
        ->and($content)->toContain('Empresa')
        ->not->toContain('Geisiane Gaspar');
});

test('usuario padrao nao pode acessar gestao de usuarios', function () {
    $userPadrao = User::factory()->create([
        'role' => UserRole::UsuarioPadrao,
    ]);

    $response = $this->actingAs($userPadrao)->get(route('usuarios.index'));

    $response->assertForbidden();
});
