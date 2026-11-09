<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class TelefoneBrasileiroRule implements ValidationRule
{
    /**
     * Lista de DDDs válidos no Brasil.
     *
     * @var list<int>
     */
    private const array DDDS_VALIDOS = [
        11, 12, 13, 14, 15, 16, 17, 18, 19,
        21, 22, 24, 27, 28,
        31, 32, 33, 34, 35, 37, 38,
        41, 42, 43, 44, 45, 46, 47, 48, 49,
        51, 53, 54, 55,
        61, 62, 63, 64, 65, 66, 67, 68, 69,
        71, 73, 74, 75, 77, 79,
        81, 82, 83, 84, 85, 86, 87, 88, 89,
        91, 92, 93, 94, 95, 96, 97, 98, 99,
    ];

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('O telefone informado é inválido.');

            return;
        }

        $digits = preg_replace('/\D/', '', $value);

        if ($digits === null || $digits === '') {
            $fail('O telefone informado é inválido.');

            return;
        }

        $length = mb_strlen($digits);

        if ($length !== 10 && $length !== 11) {
            $fail('O telefone deve conter DDD + 8 ou 9 dígitos (ex: (11) 99999-9999).');

            return;
        }

        // Não permite todos os dígitos iguais
        if (preg_match('/^(\d)\1+$/', $digits) === 1) {
            $fail('O telefone informado é inválido.');

            return;
        }

        $ddd = (int) mb_substr($digits, 0, 2);
        if (! in_array($ddd, self::DDDS_VALIDOS, true)) {
            $fail('O DDD informado no telefone é inválido.');

            return;
        }

        // Se for celular (11 dígitos), o primeiro dígito após o DDD deve ser 9
        if ($length === 11 && $digits[2] !== '9') {
            $fail('Telefone celular com 11 dígitos deve iniciar com 9 após o DDD.');

            return;
        }
    }
}
