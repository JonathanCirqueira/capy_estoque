<?php

declare(strict_types=1);

namespace App\Actions\Settings;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

final readonly class DeleteUserAccount
{
    /**
     * Delete the given user's account.
     */
    public function handle(User $user): void
    {
        DB::transaction(function () use ($user): void {
            Auth::logout();

            $user->delete();
        });
    }
}
