<?php

declare(strict_types=1);

use function Pest\Laravel\get;

test('página de saúde do sistema está acessível', function () {
    get('/up')->assertOk();
});

test('página de login está acessível', function () {
    get('/login')->assertOk();
});

test('página de registro está acessível', function () {
    get('/register')->assertOk();
});

test('página de esqueci a senha está acessível', function () {
    get('/forgot-password')->assertOk();
});

test('dashboard requer autenticação', function () {
    get('/dashboard')->assertRedirect('/login');
});

test('dashboard está acessível para usuários autenticados', function () {
    actAsUser()->get('/dashboard')->assertOk();
});

test('configurações de perfil estão acessíveis para usuários autenticados', function () {
    actAsUser()->get('/settings/profile')->assertOk();
});

test('configurações de aparência estão acessíveis para usuários autenticados', function () {
    actAsUser()->get('/settings/appearance')->assertOk();
});
