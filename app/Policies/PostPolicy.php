<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    // Only the owner can update
    public function update(User $user, Post $post)
    {
        return $user->id === $post->user_id;
    }

    // Only the owner can delete
    public function delete(User $user, Post $post)
    {
        return $user->id === $post->user_id;
    }
}
