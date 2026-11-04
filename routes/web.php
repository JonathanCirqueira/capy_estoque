<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth'])->group(function () {
    /** @var Illuminate\Routing\Route $dashboardRoute */
    $dashboardRoute = Route::inertia('dashboard', 'dashboard');
    $dashboardRoute->name('dashboard');

    Route::get('/usuarios', function () {
        return Inertia::render('usuarios/index', [
            'usuarios' => [
                'data' => [
                    [
                        'id' => 1,
                        'name' => 'Carlos Inativo',
                        'email' => 'carlos.inativo@empresa.com.br',
                        'telefone' => '11988887777',
                        'cpf_cnpj' => '12345678901',
                        'role' => UserRole::UsuarioPadrao->value,
                        'status' => UserStatus::Inativo->value,
                        'plano_nome' => 'Plano Pro',
                        'servico' => '02322 - VM2',
                        'created_at' => now()->toIso8601String(),
                    ],
                    [
                        'id' => 2,
                        'name' => 'Geisiane Gaspar',
                        'email' => 'geisiane.gaspar@cvm2.com.br',
                        'telefone' => '11977776666',
                        'cpf_cnpj' => '23456789012',
                        'role' => UserRole::UsuarioPadrao->value,
                        'status' => UserStatus::Ativo->value,
                        'plano_nome' => 'Plano Pro',
                        'servico' => '02322 - VM2',
                        'created_at' => now()->toIso8601String(),
                    ],
                    [
                        'id' => 3,
                        'name' => 'Juliano Maraldi',
                        'email' => 'juliano.maraldi@consorciohabinova.com.br',
                        'telefone' => '11966665555',
                        'cpf_cnpj' => '34567890123',
                        'role' => UserRole::UsuarioPadrao->value,
                        'status' => UserStatus::Ativo->value,
                        'plano_nome' => 'Plano Básico',
                        'servico' => '02223 - Habinova II',
                        'created_at' => now()->toIso8601String(),
                    ],
                    [
                        'id' => 4,
                        'name' => 'Leidemara Silva',
                        'email' => 'leidemara.silva@cvm2.com.br',
                        'telefone' => '11955554444',
                        'cpf_cnpj' => '45678901234',
                        'role' => UserRole::UsuarioPadrao->value,
                        'status' => UserStatus::Ativo->value,
                        'plano_nome' => 'Plano Pro',
                        'servico' => '02322 - VM2',
                        'created_at' => now()->toIso8601String(),
                    ],
                    [
                        'id' => 5,
                        'name' => 'Suporte SGI',
                        'email' => 'sgi@jhe.com.br',
                        'telefone' => '11944443333',
                        'cpf_cnpj' => '12345678000199',
                        'role' => UserRole::Admin->value,
                        'status' => UserStatus::Ativo->value,
                        'plano_nome' => 'Plano Enterprise',
                        'servico' => '00099 - Sede JHE',
                        'created_at' => now()->toIso8601String(),
                    ],
                ],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 10,
                'total' => 5,
                'from' => 1,
                'to' => 5,
                'links' => [],
            ],
            'contadores' => [
                'todos' => 5,
                'ativo' => 4,
                'pendente' => 0,
                'inativo' => 1,
            ],
            'filtros' => [
                'busca' => '',
                'role' => 'todos',
                'aba' => 'todos',
                'ordem_campo' => 'name',
                'ordem_direcao' => 'asc',
                'per_page' => 10,
            ],
        ]);
    })->name('usuarios.index');

    Route::put('/usuarios/{id}', function () {
        return back();
    })->name('usuarios.update');

    Route::post('/usuarios/convidar', function () {
        return back();
    })->name('usuarios.convidar');

    Route::put('/usuarios/{id}/inativar', function () {
        return back();
    })->name('usuarios.inativar');

    Route::put('/usuarios/{id}/ativar', function () {
        return back();
    })->name('usuarios.ativar');

    Route::post('/usuarios/{id}/reenviar-convite', function () {
        return back();
    })->name('usuarios.reenviar-convite');
});

require __DIR__.'/settings.php';
