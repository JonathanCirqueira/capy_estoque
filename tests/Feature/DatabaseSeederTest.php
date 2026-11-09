<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

test('database seeder creates standard admin user', function () {
    $this->seed(DatabaseSeeder::class);

    $admin = User::where('email', 'admin@capy.com')->firstOrFail();

    expect($admin->name)->toBe('Admin')
        ->and($admin->email)->toBe('admin@capy.com')
        ->and($admin->role)->toBe(UserRole::Admin)
        ->and($admin->status)->toBe(UserStatus::Ativo)
        ->and(Hash::check('password', $admin->password))->toBeTrue();
});
