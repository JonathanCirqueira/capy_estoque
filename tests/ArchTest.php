<?php

declare(strict_types=1);

arch('globals')
    ->expect(['dd', 'dump', 'ray', 'die', 'var_dump'])
    ->not->toBeUsed();

arch('controllers')
    ->expect('App\Http\Controllers')
    ->toHaveSuffix('Controller');

arch('models')
    ->expect('App\Http\Models')
    ->toExtend('Illuminate\Database\Eloquent\Model');

arch('app')
    ->expect('App')
    ->toUseStrictTypes();
