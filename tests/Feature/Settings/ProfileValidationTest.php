<?php

declare(strict_types=1);

use App\Models\User;

test('nome é obrigatório', function () {
    actAsUser()
        ->patch('/settings/profile', ['name' => ''])
        ->assertSessionHasErrors('name');
});

test('nome não pode ter mais de 255 caracteres', function () {
    actAsUser()
        ->patch('/settings/profile', ['name' => str_repeat('a', 256)])
        ->assertSessionHasErrors('name');
});

test('e-mail é obrigatório', function () {
    actAsUser()
        ->patch('/settings/profile', ['email' => ''])
        ->assertSessionHasErrors('email');
});

test('e-mail deve ser válido', function (string $email) {
    actAsUser()
        ->patch('/settings/profile', ['email' => $email])
        ->assertSessionHasErrors('email');
})->with('invalid_emails');

test('e-mail deve ser único', function () {
    $user1 = User::factory()->create(['email' => 'existente@exemplo.com']);

    actAsUser()
        ->patch('/settings/profile', ['email' => 'existente@exemplo.com'])
        ->assertSessionHasErrors('email');
});

test('usuário pode manter o próprio e-mail', function () {
    $user = User::factory()->create(['email' => 'meu@exemplo.com']);

    $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Novo Nome',
            'email' => 'meu@exemplo.com',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');
});
