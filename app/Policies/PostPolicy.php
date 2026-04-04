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

    /**
     * Determine whether the user can view the post (for comments and details).
     * Rule: Public posts are viewable by all; private posts only by owner.
     */
    public function view(?User $user, Post $post)
    {
        if ($post->is_public) {
            return true;
        }

        return $user && $user->id === $post->user_id;
    }
}
