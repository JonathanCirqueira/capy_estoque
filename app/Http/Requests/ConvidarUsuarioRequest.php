<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ConvidarUsuarioRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email'),
            ],
            'role' => ['required', 'string', Rule::enum(UserRole::class)],
            'telefone' => ['nullable', 'string', 'max:20'],
            'cpf_cnpj' => ['nullable', 'string', 'max:18'],
        ];
    }
}
