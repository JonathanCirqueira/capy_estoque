<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class ListarUsuariosRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'busca' => ['sometimes', 'nullable', 'string', 'max:255'],
            'aba' => ['sometimes', 'string', 'in:todos,ativo,ativos,inativo,inativos,pendente,pendentes'],
            'assinatura' => ['sometimes', 'nullable', 'string', 'in:todos,ativa,pendente,inativa'],
            'ordem_campo' => ['sometimes', 'string', 'in:name,email,empresa,role,status,created_at'],
            'ordem_direcao' => ['sometimes', 'string', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
        ];
    }
}
