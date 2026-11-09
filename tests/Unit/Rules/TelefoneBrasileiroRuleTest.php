<?php

declare(strict_types=1);

use App\Rules\TelefoneBrasileiroRule;
use Illuminate\Translation\PotentiallyTranslatedString;

test('telefone brasileiro valido passa na validacao com ou sem mascara', function (string $telefoneValido) {
    $rule = new TelefoneBrasileiroRule();
    $erros = [];

    $rule->validate('telefone', $telefoneValido, function (string $msg) use (&$erros): PotentiallyTranslatedString {
        $erros[] = $msg;

        return new PotentiallyTranslatedString($msg, app('translator'));
    });

    expect($erros)->toBeEmpty();
})->with([
    '(11) 99999-8888',
    '11999998888',
    '(21) 98765-4321',
    '21987654321',
    '(11) 3333-4444',
    '1133334444',
    '(47) 99123-4567',
]);

test('telefone brasileiro invalido falha na validacao', function (string $invalido) {
    $rule = new TelefoneBrasileiroRule();
    $erros = [];

    $rule->validate('telefone', $invalido, function (string $msg) use (&$erros): PotentiallyTranslatedString {
        $erros[] = $msg;

        return new PotentiallyTranslatedString($msg, app('translator'));
    });

    expect($erros)->not->toBeEmpty();
})->with([
    '12345',
    '11111111111',
    '00999998888', // DDD 00 inválido
    '11888887777', // Celular de 11 dígitos que não inicia com 9
    '01999998888', // DDD 01 inválido
    'abcdefghijk',
]);
