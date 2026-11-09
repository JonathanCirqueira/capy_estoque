<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class CpfOuCnpjRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('O campo :attribute deve ser um CPF ou CNPJ válido.');

            return;
        }

        $digits = preg_replace('/\D/', '', $value);

        if ($digits === null || $digits === '') {
            $fail('O campo :attribute deve ser um CPF ou CNPJ válido.');

            return;
        }

        $length = mb_strlen($digits);

        if ($length === 11) {
            if (! $this->isValidCpf($digits)) {
                $fail('O CPF informado é inválido.');
            }

            return;
        }

        if ($length === 14) {
            if (! $this->isValidCnpj($digits)) {
                $fail('O CNPJ informado é inválido.');
            }

            return;
        }

        $fail('O campo :attribute deve conter um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
    }

    private function isValidCpf(string $cpf): bool
    {
        // Rejeita sequências repetidas como 111.111.111-11
        if (preg_match('/^(\d)\1{10}$/', $cpf) === 1) {
            return false;
        }

        // Primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += ((int) $cpf[$i]) * (10 - $i);
        }

        $remainder = $sum % 11;
        $digit1 = $remainder < 2 ? 0 : 11 - $remainder;

        if (((int) $cpf[9]) !== $digit1) {
            return false;
        }

        // Segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += ((int) $cpf[$i]) * (11 - $i);
        }

        $remainder = $sum % 11;
        $digit2 = $remainder < 2 ? 0 : 11 - $remainder;

        return ((int) $cpf[10]) === $digit2;
    }

    private function isValidCnpj(string $cnpj): bool
    {
        // Rejeita sequências repetidas como 000.000.000/0000-00
        if (preg_match('/^(\d)\1{13}$/', $cnpj) === 1) {
            return false;
        }

        // Primeiro dígito verificador
        $weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += ((int) $cnpj[$i]) * $weights1[$i];
        }

        $remainder = $sum % 11;
        $digit1 = $remainder < 2 ? 0 : 11 - $remainder;

        if (((int) $cnpj[12]) !== $digit1) {
            return false;
        }

        // Segundo dígito verificador
        $weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $sum = 0;
        for ($i = 0; $i < 13; $i++) {
            $sum += ((int) $cnpj[$i]) * $weights2[$i];
        }

        $remainder = $sum % 11;
        $digit2 = $remainder < 2 ? 0 : 11 - $remainder;

        return ((int) $cnpj[13]) === $digit2;
    }
}
