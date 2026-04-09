<?php

declare(strict_types=1);

namespace App\Actions\Settings;

use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class UpdateUserPassword
{
    /**
     * Update the user's password.
     *
     * @param  array<string, mixed>  $input
     */
    public function handle(User $user, array $input): void
    {
        DB::transaction(function () use ($user, $input): void {
            $user->forceFill([
                'password' => $input['password'],
            ])->save();
        });
    }
}
