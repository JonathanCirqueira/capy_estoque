<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Usuarios\AtivarUsuarioAction;
use App\Actions\Usuarios\AtualizarUsuarioAction;
use App\Actions\Usuarios\ConvidarUsuarioAction;
use App\Actions\Usuarios\FiltrarUsuariosAction;
use App\Actions\Usuarios\InativarUsuarioAction;
use App\Actions\Usuarios\ReenviarConviteAction;
use App\Http\Requests\AtualizarUsuarioRequest;
use App\Http\Requests\ConvidarUsuarioRequest;
use App\Http\Requests\ListarUsuariosRequest;
use App\Mail\ConviteUsuarioMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

final class UsuarioController extends Controller
{
    public function index(ListarUsuariosRequest $request, FiltrarUsuariosAction $action): Response
    {
        Gate::authorize('viewAny', User::class);

        $filtros = $request->validated();
        $usuarios = $action->execute($filtros);
        $contadores = $action->contadores($filtros);

        return Inertia::render('usuarios/index', [
            'usuarios' => $usuarios,
            'filtros' => $filtros,
            'contadores' => $contadores,
        ]);
    }

    public function convidar(ConvidarUsuarioRequest $request, ConvidarUsuarioAction $action): RedirectResponse
    {
        Gate::authorize('create', User::class);

        /** @var array{name: string, email: string, role: string, empresa?: string|null, telefone?: string|null, cpf_cnpj?: string|null} $dados */
        $dados = $request->validated();
        $usuario = $action->execute($dados);

        Mail::to($usuario->email)->queue(new ConviteUsuarioMail($usuario));

        return back()->with('success', 'Convite enviado com sucesso para o usuário.');
    }

    public function update(AtualizarUsuarioRequest $request, User $user, AtualizarUsuarioAction $action): RedirectResponse
    {
        Gate::authorize('update', $user);

        /** @var array{name: string, email: string, role: string, empresa?: string|null, telefone?: string|null, cpf_cnpj?: string|null} $dados */
        $dados = $request->validated();
        $action->execute($user, $dados);

        return back()->with('success', 'Usuário atualizado com sucesso.');
    }

    public function inativar(Request $request, User $user, InativarUsuarioAction $action): RedirectResponse
    {
        Gate::authorize('inativar', $user);

        $action->execute($user);

        return back()->with('success', 'Usuário inativado com sucesso.');
    }

    public function ativar(Request $request, User $user, AtivarUsuarioAction $action): RedirectResponse
    {
        Gate::authorize('ativar', $user);

        $action->execute($user);

        return back()->with('success', 'Usuário ativado com sucesso.');
    }

    public function reenviarConvite(Request $request, User $user, ReenviarConviteAction $action): RedirectResponse
    {
        Gate::authorize('reenviarConvite', $user);

        $action->execute($user);

        Mail::to($user->email)->queue(new ConviteUsuarioMail($user));

        return back()->with('success', 'Convite reenviado com sucesso.');
    }
}
