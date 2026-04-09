<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

/** @var Illuminate\Routing\Route $homeRoute */
$homeRoute = Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
]);
$homeRoute->name('home');

Route::middleware(['auth'])->group(function () {
    /** @var Illuminate\Routing\Route $dashboardRoute */
    $dashboardRoute = Route::inertia('dashboard', 'dashboard');
    $dashboardRoute->name('dashboard');
});

require __DIR__.'/settings.php';
