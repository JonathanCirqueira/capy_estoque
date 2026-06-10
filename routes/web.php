<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth'])->group(function () {
    /** @var Illuminate\Routing\Route $dashboardRoute */
    $dashboardRoute = Route::inertia('dashboard', 'dashboard');
    $dashboardRoute->name('dashboard');
});

require __DIR__.'/settings.php';
