<?php

declare(strict_types=1);

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('usuario autenticado pode visualizar listagem de usuarios com contadores', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('usuarios.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 5)
        ->where('contadores.todos', 5)
        ->where('contadores.ativo', 4)
        ->where('contadores.inativo', 1)
        ->where('filtros.busca', '')
        ->where('filtros.role', 'todos')
    );
});

test('filtro de busca por nome ou email filtra usuarios corretamente', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('usuarios.index', ['busca' => 'Carlos']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.name', 'Carlos Inativo')
        ->where('contadores.todos', 1)
        ->where('contadores.inativo', 1)
        ->where('contadores.ativo', 0)
        ->where('filtros.busca', 'Carlos')
    );

    $responseEmail = $this->actingAs($user)->get(route('usuarios.index', ['busca' => 'cvm2.com.br']));

    $responseEmail->assertOk();
    $responseEmail->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 2)
        ->where('contadores.todos', 2)
        ->where('contadores.ativo', 2)
    );
});

test('filtro de perfil de acesso filtra administradores e usuarios padrao', function () {
    $user = User::factory()->create();

    $responseAdmin = $this->actingAs($user)->get(route('usuarios.index', ['role' => 'admin']));

    $responseAdmin->assertOk();
    $responseAdmin->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.name', 'Suporte SGI')
        ->where('contadores.todos', 1)
        ->where('filtros.role', 'admin')
    );

    $responsePadrao = $this->actingAs($user)->get(route('usuarios.index', ['role' => 'usuario_padrao']));

    $responsePadrao->assertOk();
    $responsePadrao->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 4)
        ->where('contadores.todos', 4)
        ->where('filtros.role', 'usuario_padrao')
    );
});

test('filtro de aba de status filtra usuarios inativos ou ativos', function () {
    $user = User::factory()->create();

    $responseInativo = $this->actingAs($user)->get(route('usuarios.index', ['aba' => 'inativo']));

    $responseInativo->assertOk();
    $responseInativo->assertInertia(fn (Assert $page) => $page
        ->component('usuarios/index')
        ->has('usuarios.data', 1)
        ->where('usuarios.data.0.status', 'inativo')
    );
});

test('usuario autenticado pode exportar listagem de usuarios em csv', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('usuarios.exportar'));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    $response->assertHeader('content-disposition', 'attachment; filename=usuarios.csv');
});

test('exportacao de usuarios respeita filtro de busca', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('usuarios.exportar', ['busca' => 'Carlos']));

    $response->assertOk();
    $content = $response->streamedContent();

    expect($content)->toContain('Carlos Inativo')
        ->not->toContain('Geisiane Gaspar');
});
