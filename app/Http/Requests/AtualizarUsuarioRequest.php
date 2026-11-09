<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Models\User;
use App\Rules\CpfOuCnpjRule;
use App\Rules\TelefoneBrasileiroRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class AtualizarUsuarioRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        /** @var User|string|int|null $targetUser */
        $targetUser = $this->route('user');
        $userId = $targetUser instanceof User ? $targetUser->id : (int) $targetUser;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email')->ignore($userId),
            ],
            'role' => ['required', 'string', Rule::enum(UserRole::class)],
            'empresa' => ['nullable', 'string', 'max:255'],
            'telefone' => ['required', 'string', 'max:20', new TelefoneBrasileiroRule()],
            'cpf_cnpj' => [
                'required',
                'string',
                'max:20',
                Rule::unique(User::class, 'cpf_cnpj')->ignore($userId),
                new CpfOuCnpjRule(),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'email' => 'e-mail',
            'role' => 'nível de acesso',
            'empresa' => 'empresa',
            'telefone' => 'telefone',
            'cpf_cnpj' => 'CPF/CNPJ',
        ];
    }
}
