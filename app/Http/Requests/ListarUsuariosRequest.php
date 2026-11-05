<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListarUsuariosRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'busca' => ['sometimes', 'nullable', 'string', 'max:255'],
            'aba' => ['sometimes', 'string', 'in:todos,ativos,inativos,pendentes'],
            'role' => ['sometimes', 'nullable', 'string', Rule::enum(UserRole::class)],
            'ordem_campo' => ['sometimes', 'string', 'in:name,email,role,status,created_at'],
            'ordem_direcao' => ['sometimes', 'string', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
        ];
    }
}
