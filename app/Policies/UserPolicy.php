<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can update their own profile.
     */
    public function update(User $currentUser, User $targetUser)
    {
        return $currentUser->id === $targetUser->id;
    }

    /**
     * Determine whether the user can delete their own account.
     */
    public function delete(User $currentUser, User $targetUser)
    {
        return $currentUser->id === $targetUser->id;
    }
}
