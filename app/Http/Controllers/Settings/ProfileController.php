<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\DeleteUserAccount;
use App\Actions\Settings\UpdateUserProfileInformation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $request->user();

        return Inertia::render('settings/profile', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(
        ProfileUpdateRequest $profileUpdateRequest,
        UpdateUserProfileInformation $updateUserProfileInformation,
    ): RedirectResponse {
        $user = $profileUpdateRequest->user();
        assert($user instanceof User);

        $updateUserProfileInformation->handle($user, $profileUpdateRequest->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(
        ProfileDeleteRequest $profileDeleteRequest,
        DeleteUserAccount $deleteUserAccount,
    ): RedirectResponse {
        $user = $profileDeleteRequest->user();
        assert($user instanceof User);

        $deleteUserAccount->handle($user);

        $profileDeleteRequest->session()->invalidate();
        $profileDeleteRequest->session()->regenerateToken();

        return redirect('/');
    }
}
