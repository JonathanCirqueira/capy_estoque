<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth'])->group(function () {
    /** @var Illuminate\Routing\Route $dashboardRoute */
    $dashboardRoute = Route::inertia('dashboard', 'dashboard');
    $dashboardRoute->name('dashboard');

    Route::get('/usuarios', function (Request $request) {
        $busca = trim((string) $request->query('busca', ''));
        $role = (string) $request->query('role', 'todos');
        $aba = (string) $request->query('aba', 'todos');
        $ordemCampo = (string) $request->query('ordem_campo', 'name');
        $ordemDirecao = mb_strtolower((string) $request->query('ordem_direcao', 'asc')) === 'desc' ? 'desc' : 'asc';
        $perPage = max(1, (int) $request->query('per_page', 10));
        $page = max(1, (int) $request->query('page', 1));

        $todosUsuarios = collect([
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
        ]);

        $filtradosBase = $todosUsuarios->filter(function (array $usuario) use ($busca, $role) {
            if ($busca !== '') {
                $termo = mb_strtolower($busca);
                $nome = mb_strtolower($usuario['name']);
                $email = mb_strtolower($usuario['email']);
                if (! str_contains($nome, $termo) && ! str_contains($email, $termo)) {
                    return false;
                }
            }

            if ($role !== 'todos' && $usuario['role'] !== $role) {
                return false;
            }

            return true;
        });

        $contadores = [
            'todos' => $filtradosBase->count(),
            'ativo' => $filtradosBase->where('status', UserStatus::Ativo->value)->count(),
            'pendente' => $filtradosBase->where('status', UserStatus::Pendente->value)->count(),
            'inativo' => $filtradosBase->where('status', UserStatus::Inativo->value)->count(),
        ];

        $filtradosAba = $filtradosBase->when($aba !== 'todos', function ($col) use ($aba) {
            return $col->where('status', $aba);
        });

        $ordenados = $filtradosAba->sortBy($ordemCampo, descending: $ordemDirecao === 'desc')->values();

        $total = $ordenados->count();
        $fatiados = $ordenados->forPage($page, $perPage)->values();
        $lastPage = max(1, (int) ceil($total / $perPage));

        return Inertia::render('usuarios/index', [
            'usuarios' => [
                'data' => $fatiados->all(),
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
                'from' => $total > 0 ? (($page - 1) * $perPage) + 1 : 0,
                'to' => $total > 0 ? min($page * $perPage, $total) : 0,
                'links' => [],
            ],
            'contadores' => $contadores,
            'filtros' => [
                'busca' => $busca,
                'role' => $role,
                'aba' => $aba,
                'ordem_campo' => $ordemCampo,
                'ordem_direcao' => $ordemDirecao,
                'per_page' => $perPage,
            ],
        ]);
    })->name('usuarios.index');

    Route::get('/usuarios/exportar', function (Request $request) {
        $busca = trim((string) $request->query('busca', ''));
        $role = (string) $request->query('role', 'todos');
        $aba = (string) $request->query('aba', 'todos');
        $ordemCampo = (string) $request->query('ordem_campo', 'name');
        $ordemDirecao = mb_strtolower((string) $request->query('ordem_direcao', 'asc')) === 'desc' ? 'desc' : 'asc';

        $todosUsuarios = collect([
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
        ]);

        $filtrados = $todosUsuarios
            ->filter(function (array $usuario) use ($busca, $role) {
                if ($busca !== '') {
                    $termo = mb_strtolower($busca);
                    $nome = mb_strtolower($usuario['name']);
                    $email = mb_strtolower($usuario['email']);
                    if (! str_contains($nome, $termo) && ! str_contains($email, $termo)) {
                        return false;
                    }
                }

                if ($role !== 'todos' && $usuario['role'] !== $role) {
                    return false;
                }

                return true;
            })
            ->when($aba !== 'todos', fn ($col) => $col->where('status', $aba))
            ->sortBy($ordemCampo, descending: $ordemDirecao === 'desc')
            ->values();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="usuarios.csv"',
        ];

        return response()->streamDownload(function () use ($filtrados) {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['ID', 'Nome', 'E-mail', 'Telefone', 'CPF/CNPJ', 'Perfil', 'Status', 'Plano', 'Serviço', 'Criado em'], ';');

            foreach ($filtrados as $item) {
                fputcsv($handle, [
                    $item['id'],
                    $item['name'],
                    $item['email'],
                    $item['telefone'],
                    $item['cpf_cnpj'],
                    $item['role'] === UserRole::Admin->value ? 'Administrador' : 'Usuário Padrão',
                    ucfirst($item['status']),
                    $item['plano_nome'],
                    $item['servico'],
                    $item['created_at'],
                ], ';');
            }

            fclose($handle);
        }, 'usuarios.csv', $headers);
    })->name('usuarios.exportar');

    Route::get('/usuarios/exportar', function (Request $request) {
        $busca = trim((string) $request->query('busca', ''));
        $role = (string) $request->query('role', 'todos');
        $aba = (string) $request->query('aba', 'todos');
        $ordemCampo = (string) $request->query('ordem_campo', 'name');
        $ordemDirecao = mb_strtolower((string) $request->query('ordem_direcao', 'asc')) === 'desc' ? 'desc' : 'asc';

        $todosUsuarios = collect([
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
        ]);

        $filtrados = $todosUsuarios
            ->filter(function (array $usuario) use ($busca, $role) {
                if ($busca !== '') {
                    $termo = mb_strtolower($busca);
                    $nome = mb_strtolower($usuario['name']);
                    $email = mb_strtolower($usuario['email']);
                    if (! str_contains($nome, $termo) && ! str_contains($email, $termo)) {
                        return false;
                    }
                }

                if ($role !== 'todos' && $usuario['role'] !== $role) {
                    return false;
                }

                return true;
            })
            ->when($aba !== 'todos', fn ($col) => $col->where('status', $aba))
            ->sortBy($ordemCampo, descending: $ordemDirecao === 'desc')
            ->values();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="usuarios.csv"',
        ];

        return response()->streamDownload(function () use ($filtrados) {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['ID', 'Nome', 'E-mail', 'Telefone', 'CPF/CNPJ', 'Perfil', 'Status', 'Plano', 'Serviço', 'Criado em'], ';');

            foreach ($filtrados as $item) {
                fputcsv($handle, [
                    $item['id'],
                    $item['name'],
                    $item['email'],
                    $item['telefone'],
                    $item['cpf_cnpj'],
                    $item['role'] === UserRole::Admin->value ? 'Administrador' : 'Usuário Padrão',
                    ucfirst($item['status']),
                    $item['plano_nome'],
                    $item['servico'],
                    $item['created_at'],
                ], ';');
            }

            fclose($handle);
        }, 'usuarios.csv', $headers);
    })->name('usuarios.exportar');

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
