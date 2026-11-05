<?php

declare(strict_types=1);

use App\Http\Controllers\ExportarUsuariosController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth'])->group(function () {
    /** @var Illuminate\Routing\Route $dashboardRoute */
    $dashboardRoute = Route::inertia('dashboard', 'dashboard');
    $dashboardRoute->name('dashboard');

    // Módulo de Gestão de Usuários e Assinaturas
    Route::get('/usuarios/exportar', ExportarUsuariosController::class)->name('usuarios.exportar');
    Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    Route::post('/usuarios/convidar', [UsuarioController::class, 'convidar'])->name('usuarios.convidar');
    Route::put('/usuarios/{user}', [UsuarioController::class, 'update'])->name('usuarios.update');
    Route::put('/usuarios/{user}/inativar', [UsuarioController::class, 'inativar'])->name('usuarios.inativar');
    Route::put('/usuarios/{user}/ativar', [UsuarioController::class, 'ativar'])->name('usuarios.ativar');
    Route::post('/usuarios/{user}/reenviar-convite', [UsuarioController::class, 'reenviarConvite'])->name('usuarios.reenviar-convite');
});

// Rota para link de aceitação de convite enviado por e-mail
Route::get('/convite/aceitar/{token}', function (string $token) {
    return redirect()->route('login')->with('info', 'Token de convite recebido: '.$token);
})->name('convite.aceitar');

require __DIR__.'/settings.php';
