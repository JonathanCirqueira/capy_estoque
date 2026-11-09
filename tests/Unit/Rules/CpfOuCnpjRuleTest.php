<?php

declare(strict_types=1);

use App\Rules\CpfOuCnpjRule;

test('cpf valido passa na validacao com ou sem mascara', function (string $cpfValido) {
    $rule = new CpfOuCnpjRule();
    $erros = [];

    $rule->validate('cpf_cnpj', $cpfValido, function (string $msg) use (&$erros) {
        $erros[] = $msg;
    });

    expect($erros)->toBeEmpty();
})->with([
    '529.982.247-25',
    '52998224725',
    '042.846.591-97',
    '04284659197',
]);

test('cnpj valido passa na validacao com ou sem mascara', function (string $cnpjValido) {
    $rule = new CpfOuCnpjRule();
    $erros = [];

    $rule->validate('cpf_cnpj', $cnpjValido, function (string $msg) use (&$erros) {
        $erros[] = $msg;
    });

    expect($erros)->toBeEmpty();
})->with([
    '11.222.333/0001-81',
    '11222333000181',
    '00.000.000/0001-91',
    '00000000000191',
]);

test('cpf ou cnpj invalido falha na validacao', function (string $invalido) {
    $rule = new CpfOuCnpjRule();
    $erros = [];

    $rule->validate('cpf_cnpj', $invalido, function (string $msg) use (&$erros) {
        $erros[] = $msg;
    });

    expect($erros)->not->toBeEmpty();
})->with([
    '111.111.111-11',
    '00000000000',
    '123.456.789-00',
    '123',
    '00.000.000/0000-00',
    '11.222.333/0001-00',
    'texto-aleatorio',
]);
